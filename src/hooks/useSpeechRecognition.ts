import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const win = window as SpeechRecognitionWindow;
  return win.SpeechRecognition || win.webkitSpeechRecognition;
}

export interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(() => {
    return Boolean(getSpeechRecognitionConstructor());
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionClass) {
      setSupported(false);
      setError("Voice isn't available on this browser. You can type instead.");
      return;
    }

    // Abort any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    try {
      const recognition = new SpeechRecognitionClass();
      // Single turn only - never continuously listen
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript;
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        setTranscript(currentText);

        if (finalTranscript && optionsRef.current?.onResult) {
          optionsRef.current.onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('Microphone permission was not granted. You can type instead.');
        } else if (event.error === 'no-speech') {
          setError('No voice was heard. You can tap to try again or type instead.');
        } else {
          setError("Voice isn't available on this browser. You can type instead.");
        }
        if (optionsRef.current?.onError) {
          optionsRef.current.onError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (optionsRef.current?.onEnd) {
          optionsRef.current.onEnd();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setError("Voice isn't available on this browser. You can type instead.");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    supported,
    startListening,
    stopListening,
    setTranscript,
    resetTranscript: () => setTranscript(''),
  };
}
