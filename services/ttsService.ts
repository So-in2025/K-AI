class TtsService {
  private voice: SpeechSynthesisVoice | null = null;
  private isReadyPromise: Promise<void>;
  private isInitialized = false;
  private utteranceQueue: { text: string; pause: number; rate?: number; pitch?: number }[] = [];
  private isSpeaking = false;
  private currentSequenceResolver: (() => void) | null = null;

  constructor() {
    this.isReadyPromise = new Promise((resolve) => {
       if (typeof window !== 'undefined' && window.speechSynthesis) {
          const checkVoices = () => {
              const voices = window.speechSynthesis.getVoices();
              if (voices.length > 0) {
                  const spanishMaleGoogle = voices.find(v => v.lang.startsWith('es-') && v.name.includes('Google') && !v.name.includes('Femenina'));
                  const spanishMale = voices.find(v => v.lang.startsWith('es-') && (v.name.includes('Male') || v.name.includes('Masculino')));
                  const spanishFallback = voices.find(v => v.lang.startsWith('es-'));
                  this.voice = spanishMaleGoogle || spanishMale || spanishFallback || null;
                  resolve();
              }
          };

          if (window.speechSynthesis.getVoices().length > 0) {
              checkVoices();
          } else {
              window.speechSynthesis.onvoiceschanged = () => {
                checkVoices();
                this.isReadyPromise = Promise.resolve();
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
    if (this.voice) {
        utterance.voice = this.voice;
        utterance.lang = this.voice.lang;
    }
    utterance.rate = item.rate || 1;
    utterance.pitch = item.pitch || 1;

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

  public speak(text: string, rate = 1, pitch = 1): Promise<void> {
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
        this.utteranceQueue = [...script];
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