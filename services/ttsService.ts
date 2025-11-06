import { ITtsSettings } from '../types';
import { TTS_SETTINGS_KEY } from '../constants';

class TtsService {
  private voice: SpeechSynthesisVoice | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private settings: ITtsSettings = { voiceName: null, rate: 1, pitch: 1 };
  
  private isReadyPromise: Promise<void>;
  private isInitialized = false;
  private utteranceQueue: { text: string; pause: number; rate?: number; pitch?: number }[] = [];
  private isSpeaking = false;
  private currentSequenceResolver: (() => void) | null = null;

  constructor() {
    this.isReadyPromise = new Promise((resolve) => {
       if (typeof window !== 'undefined' && window.speechSynthesis) {
          const checkVoices = () => {
              this.voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es-'));
              if (this.voices.length > 0) {
                  const storedSettings = localStorage.getItem(TTS_SETTINGS_KEY);
                  if (storedSettings) {
                      this.settings = JSON.parse(storedSettings);
                  }
                  
                  const preferredVoice = this.voices.find(v => v.name === this.settings.voiceName);
                  const spanishMaleGoogle = this.voices.find(v => v.name.includes('Google') && !v.name.includes('Femenina'));
                  const spanishMale = this.voices.find(v => v.name.includes('Male') || v.name.includes('Masculino'));
                  this.voice = preferredVoice || spanishMaleGoogle || spanishMale || this.voices[0] || null;
                  
                  if (this.voice && !this.settings.voiceName) {
                      this.settings.voiceName = this.voice.name;
                  }
                  resolve();
              }
          };

          if (window.speechSynthesis.getVoices().length > 0) {
              checkVoices();
          } else {
              window.speechSynthesis.onvoiceschanged = () => {
                checkVoices();
              };
          }
       } else {
          resolve();
       }
    });
  }
  
  public init() {
    if (!this.isInitialized && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        this.isInitialized = true;
    }
  }

  public getAvailableVoices = (): SpeechSynthesisVoice[] => this.voices;
  public getSettings = (): ITtsSettings => this.settings;
  
  public updateSettings(newSettings: Partial<ITtsSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(this.settings));
      this.voice = this.voices.find(v => v.name === this.settings.voiceName) || this.voice;
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
    const selectedVoice = this.voices.find(v => v.name === this.settings.voiceName);
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
      await this.isReadyPromise;
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

  public speakSequence(script: { text: string; pause: number }[]): Promise<void> {
      return new Promise(async (resolve) => {
        await this.isReadyPromise;
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