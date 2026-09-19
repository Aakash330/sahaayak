import { useState, useEffect, useCallback } from 'react';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
}

export function useReadAloud() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis !== null;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
    } else {
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, options?: SpeakOptions) => {
    if (typeof window === 'undefined' || typeof window.speechSynthesis === 'undefined' || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop current speech

      const utterance = new SpeechSynthesisUtterance(text);
      if (options?.rate !== undefined) {
        utterance.rate = options.rate;
      } else {
        utterance.rate = 0.85; // Slightly slower, calm default for seniors
      }
      if (options?.pitch !== undefined) {
        utterance.pitch = options.pitch;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return { speak, stop, isSpeaking, supported };
}
