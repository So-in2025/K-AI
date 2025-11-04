class TtsService {
  private voice: SpeechSynthesisVoice | null = null;
  private isReadyPromise: Promise<void>;
  private isInitialized = false;
  private utteranceQueue: { text: string; pause: number; rate?: number; pitch?: number }[] = [];
  private isSpeaking = false;

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
                // Re-resolve promise if voices change after initial load
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
        if(this.utteranceQueue.length === 0) this.isSpeaking = false;
        return;
    }
    this.isSpeaking = true;

    const item = this.utteranceQueue.shift();
    if (!item || !item.text.trim()) { // Skip empty items
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
        this.processQueue(); // Try next item
    };
    
    window.speechSynthesis.speak(utterance);
  }

  public async speak(text: string, rate = 1, pitch = 1) {
    await this.isReadyPromise;
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stop();

    // Chunk the text into sentences to avoid "text-too-long" errors.
    // Fix: Explicitly type `chunks` as string[] to resolve type inference issue where it could be inferred as `never[]`.
    const chunks: string[] = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    if (chunks.length === 0 && text.trim().length > 0) {
      chunks.push(text);
    }
    
    this.utteranceQueue = chunks
        .map(chunk => chunk.trim())
        .filter(chunk => chunk.length > 0) // Remove empty chunks
        .map(chunk => ({
            text: chunk,
            pause: 200, // Short pause between sentences
            rate,
            pitch
        }));

    if (this.utteranceQueue.length > 0) {
        // No pause after the last sentence
        this.utteranceQueue[this.utteranceQueue.length - 1].pause = 0;
    }

    this.processQueue();
  }

  public async speakSequence(script: { text: string; pause: number }[]) {
      await this.isReadyPromise;
      if (!script || script.length === 0 || typeof window === 'undefined' || !window.speechSynthesis) return;

      this.stop();
      this.utteranceQueue = [...script];
      this.processQueue();
  }

  public stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        this.utteranceQueue = [];
        this.isSpeaking = false;
        window.speechSynthesis.cancel();
    }
  }
}

const ttsService = new TtsService();
export default ttsService;