import { useState, useEffect } from 'react';
import { explainMessage, UnderstandResult } from '../../services/gemini/understand';
import { useReadAloud } from '../../hooks';
import { copyToClipboard, MAX_INPUT_LENGTH, getErrorMessage } from '../../utils';

export interface UseUnderstandProps {
  initialText?: string;
}

export function useUnderstand({ initialText = '' }: UseUnderstandProps = {}) {
  const [input, setInput] = useState(initialText);
  const [result, setResult] = useState<UnderstandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { speak, stop, isSpeaking, supported: ttsSupported } = useReadAloud();

  useEffect(() => {
    if (initialText && initialText.trim().length > 0) {
      setInput(initialText);
    }
  }, [initialText]);

  const handleExplain = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_INPUT_LENGTH) {
      setError(`Input is too long. Please paste a shorter message under ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    stop();

    try {
      const parsedResult = await explainMessage(trimmed);
      setResult(parsedResult);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'We could not explain this message right now.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const textToCopy = `
WHAT THIS MEANS
${result.simpleExplanation}

IMPORTANT DETAILS
${result.importantDetails.map((detail) => `• ${detail}`).join('\n')}

WHAT YOU NEED TO DO
${result.whatToDo.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}

${result.warnings.length > 0 ? `WATCH OUT FOR\n${result.warnings.map((w) => `! ${w}`).join('\n')}` : ''}
    `.trim();

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReadAloud = () => {
    if (!result) return;
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `
        What this means: ${result.simpleExplanation}.
        Important details: ${result.importantDetails.join('. ')}.
        What you need to do: ${result.whatToDo.join('. ')}.
        ${result.warnings.length > 0 ? `Watch out for: ${result.warnings.join('. ')}` : ''}
      `.trim();
      speak(textToRead);
    }
  };

  return {
    input,
    setInput,
    result,
    loading,
    error,
    clearError: () => setError(null),
    copied,
    isSpeaking,
    ttsSupported,
    handleExplain,
    handleCopy,
    handleReadAloud,
  };
}
