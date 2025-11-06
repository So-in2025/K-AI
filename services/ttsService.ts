import { ITtsSettings } from '../types';
import { TTS_SETTINGS_KEY } from '../constants';

class TtsService {
  private voice: SpeechSynthesisVoice | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: ITtsSettings = { voiceName: null, rate: 1, pitch: 1 };
  
  private utteranceQueue: { text: string; pause: number; rate?: number; pitch?: number }[] = [];
  private isSpeaking = false;
  private currentSequenceResolver: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Cargar las configuraciones guardadas
        const storedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
        if (storedSettings) {
            this.settings = JSON.parse(storedSettings);
        }
        
        // Intentar cargar las voces. `onvoiceschanged` es crucial para móviles.
        window.speechSynthesis.onvoiceschanged = () => this.loadInitialVoice();
        this.loadInitialVoice();
    }
  }
  
  private loadInitialVoice() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
          const allVoices = window.speechSynthesis.getVoices();
          if (allVoices.length > 0) {
              this.voices = allVoices.filter(v => v.lang.startsWith('es-'));
              
              const preferredVoice = this.voices.find(v => v.name === this.settings.voiceName);
              if (preferredVoice) {
                  this.voice = preferredVoice;
              } else if (this.voices.length > 0) {
                  const spanishMaleGoogle = this.voices.find(v => v.name.includes('Google') && !v.name.includes('Femenina'));
                  const spanishMale = this.voices.find(v => v.name.includes('Male') || v.name.includes('Masculino'));
                  this.voice = spanishMaleGoogle || spanishMale || this.voices[0];
                  this.settings.voiceName = this.voice.name;
                  localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(this.settings));
              }
          }
      }
  }

  public getAvailableVoices = (): SpeechSynthesisVoice[] => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        // Siempre obtener la lista más fresca, crucial para la carga asíncrona en móviles.
        this.voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es-'));
    }
    return this.voices;
  }
  
  public getSettings = (): ITtsSettings => this.settings;
  
  public updateSettings(newSettings: Partial<ITtsSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(this.settings));
      this.voice = this.getAvailableVoices().find(v => v.name === this.settings.voiceName) || this.voice;
  }

  private processQueue() {
    if (this.utteranceQueue.length === 0 || this.isSpeaking) {
        if(this.utteranceQueue.length === 0 && !this.isSpeaking) {
            if (this.currentSequenceResolver) {
                this.currentSequenceResolver();
                this.currentSequenceResolver = null;
            }
        }
        return;
    }
    this.isSpeaking = true;

    const item = this.utteranceQueue.shift();
    if (!item || !item.text.trim()) {
        this.isSpeaking = false;
        this.processQueue();
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(item.text);
    const selectedVoice = this.getAvailableVoices().find(v => v.name === this.settings.voiceName);
    utterance.voice = selectedVoice || this.voice;
    if (utterance.voice) {
        utterance.lang = utterance.voice.lang;
    }
    
    utterance.rate = item.rate ?? this.settings.rate;
    utterance.pitch = item.pitch ?? this.settings.pitch;

    utterance.onend = () => {
        setTimeout(() => {
            this.isSpeaking = false;
            this.processQueue();
        }, item.pause);
    };

    utterance.onerror = (event) => {
        console.error("TTS Utterance Error:", event.error, "for text:", `"${item.text}"`);
        this.isSpeaking = false;
        this.processQueue();
    };
    
    window.speechSynthesis.speak(utterance);
  }

  public speak(text: string, rate?: number, pitch?: number): Promise<void> {
    return new Promise(async (resolve) => {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      this.stop();

      const cleanedText = text.replace(/\*/g, '');
      const chunks: string[] = cleanedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

      if (chunks.length === 0 && cleanedText.trim().length > 0) {
        chunks.push(cleanedText);
      }
      
      this.utteranceQueue = chunks
          .map(chunk => chunk.trim())
          .filter(chunk => chunk.length > 0)
          .map(chunk => ({
              text: chunk,
              pause: 300, 
              rate,
              pitch
          }));

      if (this.utteranceQueue.length > 0) {
          this.utteranceQueue[this.utteranceQueue.length - 1].pause = 0;
      }

      this.currentSequenceResolver = resolve;
      this.processQueue();
    });
  }

  public speakSimple(text: string) {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }
      this.stop(); // Detener cualquier locución en curso
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = this.getAvailableVoices().find(v => v.name === this.settings.voiceName);
      utterance.voice = selectedVoice || this.voice;

      if (utterance.voice) {
        utterance.lang = utterance.voice.lang;
      }
      utterance.rate = this.settings.rate;
      utterance.pitch = this.settings.pitch;
      
      utterance.onerror = (event) => {
        console.error("TTS Simple Speak Error:", event.error, "for text:", `"${text}"`);
      };

      window.speechSynthesis.speak(utterance);
  }

  public speakSequence(script: { text: string; pause: number }[]): Promise<void> {
      return new Promise(async (resolve) => {
        if (!script || script.length === 0 || typeof window === 'undefined' || !window.speechSynthesis) {
            resolve();
            return;
        }

        this.stop();
        this.utteranceQueue = script.map(item => ({
            text: item.text,
            pause: item.pause,
        }));
        this.currentSequenceResolver = resolve;
        this.processQueue();
      });
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        this.utteranceQueue = [];
        this.isSpeaking = false;
        if (this.currentSequenceResolver) {
            this.currentSequenceResolver();
            this.currentSequenceResolver = null;
        }
        window.speechSynthesis.cancel();
    }
  }
}

const ttsService = new TtsService();
export default ttsService;