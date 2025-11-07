
import { ITtsSettings } from '../types';
import { TTS_SETTINGS_KEY } from '../constants';

class TtsService {
    private utterance: SpeechSynthesisUtterance | null = null;
    private isSpeaking: boolean = false;
    private sequenceQueue: { text: string; pause: number }[] = [];
    private sequenceIndex: number = 0;
    private isSequenceRunning: boolean = false;

    constructor() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.addEventListener('beforeunload', () => {
                this.stop();
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
            console.error("Error reading TTS settings from localStorage", error);
        }
        return this.getDefaultSettings();
    }

    saveSettings(settings: Partial<ITtsSettings>) {
        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...settings };
            localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("Error saving TTS settings to localStorage", error);
        }
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            return window.speechSynthesis.getVoices();
        }
        return [];
    }

    speak(text: string, customSettings?: ITtsSettings) {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            console.warn("Speech Synthesis not supported.");
            return;
        }

        // Stop any ongoing speech, unless it's a sequence
        if (!this.isSequenceRunning) {
            this.stop();
        } else {
             window.speechSynthesis.cancel();
        }

        this.utterance = new SpeechSynthesisUtterance(text);
        const settings = customSettings || this.getSettings();
        
        const voices = this.getAvailableVoices();
        if (settings.voiceName) {
            const selectedVoice = voices.find(v => v.name === settings.voiceName);
            if (selectedVoice) {
                this.utterance.voice = selectedVoice;
            }
        } else {
            const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
            const defaultSpanishVoice = spanishVoices.find(v => v.lang === 'es-ES') || spanishVoices[0];
            if (defaultSpanishVoice) {
                this.utterance.voice = defaultSpanishVoice;
            }
        }

        this.utterance.rate = settings.rate;
        this.utterance.pitch = settings.pitch;
        this.utterance.lang = this.utterance.voice?.lang || 'es-ES';

        this.utterance.onstart = () => { this.isSpeaking = true; };
        this.utterance.onerror = (event) => {
            console.error("SpeechSynthesisUtterance.onerror", event);
            this.isSpeaking = false;
        };
        // onend is handled by the caller (speakSequence) if needed

        window.speechSynthesis.speak(this.utterance);
    }
    
    speakSequence(script: { text: string; pause: number }[]) {
        this.stop(); // Stop any previous speech before starting a new sequence
        this.isSequenceRunning = true;
        this.sequenceQueue = [...script];
        this.sequenceIndex = 0;
        this.playNextInSequence();
    }
    
    private playNextInSequence() {
        if (!this.isSequenceRunning || this.sequenceIndex >= this.sequenceQueue.length) {
            this.stop();
            return;
        }

        const currentItem = this.sequenceQueue[this.sequenceIndex];
        this.speak(currentItem.text);

        if (this.utterance) {
            this.utterance.onend = () => {
                this.isSpeaking = false;
                if (this.isSequenceRunning) { // Check if stop() was called
                    setTimeout(() => {
                        this.sequenceIndex++;
                        this.playNextInSequence();
                    }, currentItem.pause);
                }
            };
        } else {
            // If utterance failed to create, stop the sequence.
            this.stop();
        }
    }

    stop() {
        this.isSequenceRunning = false;
        this.sequenceQueue = [];
        this.sequenceIndex = 0;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
        }
    }
}

const ttsService = new TtsService();
export default ttsService;
