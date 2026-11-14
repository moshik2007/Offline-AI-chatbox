// Native Browser Speech Synthesis (TTS) & Speech Recognition (STT) Service

export type SpeechLang = 'en-US' | 'en-IN' | 'ta-IN';

export interface RecognitionCallbacks {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (friendlyMessage: string, errorCode?: string) => void;
}

export interface RecognitionInstance {
  start: () => void;
  stop: () => void;
  abort: () => void;
  setLang: (lang: SpeechLang) => void;
}

export class SpeechService {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static isSpeaking: boolean = false;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  static getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  static speak(text: string, onEnd?: () => void, rate = 1.0): boolean {
    if (!this.synth) return false;

    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted for speech.')
      .replace(/[#*_`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = this.getVoices();
      const localVoice =
        voices.find((v) => v.localService && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
      if (localVoice) {
        utterance.voice = localVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.isSpeaking = true;
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      return false;
    }
  }

  static stop(): void {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    } catch {
      // ignore
    }
  }

  static getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }

  private static mapRecognitionError(code: string): string {
    switch (code) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone permission denied. Please allow mic access in your browser.';
      case 'no-speech':
        return 'No speech detected. Please speak clearly near your microphone.';
      case 'audio-capture':
        return 'No microphone detected on this device.';
      case 'network':
        return 'Browser speech engine needs an on-device speech pack or connection.';
      case 'aborted':
        return 'Voice dictation stopped.';
      default:
        return `Voice recognition error (${code}). Please try again.`;
    }
  }

  // Speech Recognition (uses on-device speech model when supported by browser/OS)
  static createRecognition(
    callbacks: RecognitionCallbacks,
    initialLang: SpeechLang = 'en-US'
  ): RecognitionInstance | null {
    if (typeof window === 'undefined') return null;
    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return null;

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = initialLang;

      // Hint browser to prefer on-device / offline speech recognition when supported (Chrome 139+)
      if ('processLocally' in recognition) {
        try {
          recognition.processLocally = true;
        } catch {
          // ignore if read-only or unsupported
        }
      }

      recognition.onstart = () => {
        callbacks.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (interimTranscript && callbacks.onInterim) {
          callbacks.onInterim(interimTranscript);
        }
        if (finalTranscript.trim()) {
          callbacks.onFinal(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        const code = event?.error || 'unknown';
        callbacks.onError?.(this.mapRecognitionError(code), code);
      };

      recognition.onend = () => {
        callbacks.onEnd?.();
      };

      return {
        start: () => recognition.start(),
        stop: () => recognition.stop(),
        abort: () => recognition.abort(),
        setLang: (lang: SpeechLang) => {
          recognition.lang = lang;
        },
      };
    } catch {
      return null;
    }
  }
}
