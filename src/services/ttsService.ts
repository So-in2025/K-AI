import { ITtsSettings } from '../types';
import { TTS_SETTINGS_KEY } from '../constants';

// --- Text Chunking Helper ---
// SpeechSynthesis has a character limit (~200-300 chars depending on browser/voice).
// We chunk text to avoid "synthesis-failed" errors and improve responsiveness.
function chunkText(text: string, maxLength = 180): string[] {
    const chunks: string[] = [];
    if (!text) return chunks;

    // First, split by natural boundaries (sentences) to make speech sound more natural.
    // This regex handles various sentence endings and keeps the punctuation.
    const sentences = text.match(/[^.!?]+[.!?]*|[^.!?]+$/g) || [];
    
    let currentChunk = '';
    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxLength) {
            currentChunk += sentence + ' ';
        } else {
            // If the current chunk is not empty, push it.
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            // The new sentence starts a new chunk. If it's too long itself, it will be the only thing in its chunk.
            currentChunk = sentence + ' ';
        }
    }
    // Add the last remaining chunk.
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    
    return chunks;
}


class TtsService {
    private isSpeaking: boolean = false;
    private utteranceQueue: (SpeechSynthesisUtterance | { type: 'pause'; duration: number })[] = [];
    private watchdogTimer: number | null = null;
    private resumeInterval: number | null = null;
    private currentPromise: { resolve: () => void; reject: (reason?: any) => void } | null = null;

    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // This is a workaround for a bug in some browsers (like Chrome on Android)
            // where the speech synthesis engine can go silent after a period of inactivity.
            // Periodically calling resume() keeps it "alive".
            this.resumeInterval = window.setInterval(() => {
                if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }
            }, 5000);

            window.addEventListener('beforeunload', () => {
                this.stop();
                if (this.resumeInterval) clearInterval(this.resumeInterval);
            });
        }
    }

    private getDefaultSettings(): ITtsSettings {
        return { voiceName: null, rate: 1, pitch: 1 };
    }

    getSettings(): ITtsSettings {
        try {
            const stored = localStorage.getItem(TTS_SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return { ...this.getDefaultSettings(), ...parsed };
            }
        } catch (error) {
            console.error("Error al leer la configuración de TTS de localStorage", error);
        }
        return this.getDefaultSettings();
    }

    saveSettings(settings: Partial<ITtsSettings>) {
        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...settings };
            localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("Error al guardar la configuración de TTS en localStorage", error);
        }
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            return window.speechSynthesis.getVoices();
        }
        return [];
    }

    // A watchdog timer to catch cases where the browser's TTS engine gets stuck.
    private _startWatchdog() {
        this._clearWatchdog();
        this.watchdogTimer = window.setTimeout(() => {
            console.warn("TTS Watchdog triggered: Speech synthesis seems stuck. Resetting state.");
            // We don't call stop() here to avoid rejecting the promise,
            // we just try to advance the queue.
            this.isSpeaking = false;
            this._processQueue();
        }, 15000); // 15 seconds is a generous timeout for an utterance to start.
    }

    private _clearWatchdog() {
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
    }

    private _processQueue() {
        if (this.isSpeaking) {
            return;
        }

        if (this.utteranceQueue.length === 0) {
            // Queue is finished, resolve the promise.
            if (this.currentPromise) {
                this.currentPromise.resolve();
                this.currentPromise = null;
            }
            return;
        }

        this.isSpeaking = true;
        const nextItem = this.utteranceQueue.shift();

        if (nextItem && 'type' in nextItem && nextItem.type === 'pause') {
            // Handle pauses in a sequence
            setTimeout(() => {
                this.isSpeaking = false;
                this._processQueue();
            }, nextItem.duration);
        } else if (nextItem) {
            const utterance = nextItem as SpeechSynthesisUtterance;
            
            utterance.onend = () => {
                this._clearWatchdog();
                this.isSpeaking = false;
                this._processQueue();
            };
            
            utterance.onerror = (event) => {
                console.error("SpeechSynthesisErrorEvent:", event.error);
                this._clearWatchdog();
                this.isSpeaking = false;
                // Don't stop the whole queue on error. Just log it and continue.
                this._processQueue();
            };
            
            utterance.onstart = () => {
                this._startWatchdog();
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }

    private _createUtterance(text: string, customSettings?: ITtsSettings): SpeechSynthesisUtterance {
        const utterance = new SpeechSynthesisUtterance(text);
        const settings = customSettings || this.getSettings();
        
        const voices = this.getAvailableVoices();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (voices.length > 0) {
             if (settings.voiceName) {
                selectedVoice = voices.find(v => v.name === settings.voiceName);
            }
            
            // Fallback logic if selected voice is not found or not set
            if (!selectedVoice) {
                const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
                // Prefer a specific dialect if available, otherwise take the first Spanish one
                selectedVoice = spanishVoices.find(v => v.lang === 'es-ES') || spanishVoices.find(v => v.lang === 'es-MX') || spanishVoices[0];
            }
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        } else {
            utterance.lang = 'es-ES'; // Default language if no voice found
        }

        utterance.rate = Math.max(0.5, Math.min(settings.rate, 2));
        utterance.pitch = Math.max(0, Math.min(settings.pitch, 2));

        return utterance;
    }

    speak(text: string, customSettings?: ITtsSettings): Promise<void> {
        // Simple wrapper around speakSequence for a single utterance
        return this.speakSequence([{ text, pause: 0 }]);
    }
    
    speakSequence(script: { text: string; pause: number }[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
                console.warn("Síntesis de voz no soportada.");
                resolve();
                return;
            }
    
            // Stop any ongoing speech. This will also resolve any pending promise from a previous call.
            this.stop(); 
            this.currentPromise = { resolve, reject };
    
            if (!script || script.length === 0) {
                this._processQueue(); // Will resolve immediately
                return;
            }
            
            for (const item of script) {
                 const chunks = chunkText(item.text);
                 for (const chunk of chunks) {
                    this.utteranceQueue.push(this._createUtterance(chunk));
                 }
                 if (item.pause > 0) {
                     this.utteranceQueue.push({ type: 'pause', duration: item.pause });
                 }
            }
            
            this._processQueue();
        });
    }

    stop() {
        this._clearWatchdog();
        this.utteranceQueue = [];
        this.isSpeaking = false;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // This is a safety measure. If speech is active, cancel it.
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
                window.speechSynthesis.cancel();
            }
        }
        
        // If there was a promise waiting, resolve it. This signals that the operation
        // has been terminated. It prevents dangling promises in the application.
        if (this.currentPromise) {
            this.currentPromise.resolve();
            this.currentPromise = null;
        }
    }
}

const ttsService = new TtsService();
export default ttsService;
