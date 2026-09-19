import { useState } from 'react';
import { checkSafety, SafetyCheckResult } from '../../services/gemini/safety';
import { useReadAloud } from '../../hooks';
import { copyToClipboard, MAX_INPUT_LENGTH, getErrorMessage } from '../../utils';

export function useSafetyCheck() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SafetyCheckResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { speak, stop, isSpeaking, supported: ttsSupported } = useReadAloud();

  const handleCheck = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (trimmed.length > MAX_INPUT_LENGTH) {
      setError(`Message is too long. Please keep it under ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    stop();

    try {
      const safetyResult = await checkSafety(trimmed);
      setResult(safetyResult);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Could not verify safety at this moment. Please ask a trusted family member.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    if (!result) return;
    if (isSpeaking) {
      stop();
      return;
    }

    const narrative = `
      Assessment: ${result.assessment}.
      ${result.warningSigns.length > 0 ? `Warning signs found: ${result.warningSigns.join('. ')}.` : 'No obvious warning signs found.'}
      Things to avoid: ${result.avoidActions.join('. ')}.
      Safe actions to take: ${result.safeActions.join('. ')}.
    `.trim();

    speak(narrative);
  };

  const handleCopy = async () => {
    if (!result) return;
    const textToCopy = `
Sahaayak Safety Assessment:
${result.assessment}

${result.warningSigns.length > 0 ? `WARNING SIGNS:\n${result.warningSigns.map((item) => `• ${item}`).join('\n')}\n` : ''}
THINGS TO AVOID:
${result.avoidActions.map((item) => `• ${item}`).join('\n')}

SAFE ACTIONS:
${result.safeActions.map((item) => `• ${item}`).join('\n')}
    `.trim();

    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasWarningSigns = result ? result.warningSigns.length > 0 : false;

  return {
    inputText,
    setInputText,
    loading,
    error,
    clearError: () => setError(null),
    result,
    hasWarningSigns,
    copied,
    isSpeaking,
    ttsSupported,
    handleCheck,
    handleReadAloud,
    handleCopy,
  };
}
