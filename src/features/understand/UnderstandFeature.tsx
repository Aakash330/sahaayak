import React, { useState, useEffect } from 'react';
import {
  PageContainer,
  Card,
  Button,
  LoadingState,
  ErrorState,
} from '../../components/ui';
import { explainMessage, UnderstandResult } from '../../services/gemini';
import { useReadAloud } from '../../hooks';
import {
  PlayCircle,
  Volume2,
  Square,
  Copy,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FileText,
  Info,
  ListOrdered,
} from 'lucide-react';
import { LiveAnnouncer } from '../../accessibility';

interface UnderstandFeatureProps {
  initialText?: string;
  onHelpMeDo?: (taskText: string) => void;
}

const SAMPLE_MESSAGES = [
  {
    label: '⚡ Electricity Bill Due',
    text: 'Your electricity bill of ₹1,240 is due on 24 September. Avoid late payment fee of ₹150 by paying on time via BESCOM portal or nearby counter.',
  },
  {
    label: '🏥 Health Check Reminder',
    text: 'Reminder: Your fasting blood glucose test is scheduled for tomorrow at 8:00 AM at Apollo Clinic. Do not consume food or tea for 10 hours prior to sample collection.',
  },
  {
    label: '🏛️ Pension Life Certificate',
    text: 'Dear Pensioner, submit your Digital Life Certificate (Jeevan Pramaan) before 30 November at your nearest post office or bank branch to ensure uninterrupted monthly pension.',
  },
];

export const UnderstandFeature: React.FC<UnderstandFeatureProps> = ({
  initialText = '',
  onHelpMeDo,
}) => {
  const [input, setInput] = useState(initialText);
  const [result, setResult] = useState<UnderstandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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

    // Security: Stop unreasonably long inputs to prevent token exhaustion or DoS
    if (trimmed.length > 2000) {
      setError(new Error('Input is too long. Please paste a shorter message under 2000 characters.'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    stop();

    try {
      const parsedResult = await explainMessage(trimmed);
      setResult(parsedResult);
    } catch (err: any) {
      setError(err);
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

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Main Input Section */}
        <Card className="space-y-6 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 bg-amber-100 text-amber-900 rounded-xl" aria-hidden="true">
                <FileText className="w-6 h-6 text-[#1E3A5F]" />
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950">
                Make this easier to understand
              </h2>
            </div>
            <p className="text-lg sm:text-xl text-stone-700 leading-relaxed font-medium">
              Paste any complicated SMS, bill, medical instruction, letter, or notice. Sahaayak will explain it in calm, plain words.
            </p>
          </div>

          <div
            role="form"
            aria-label="Text simplification form"
            className="space-y-6"
          >
            <div className="space-y-2.5">
              <label
                htmlFor="message-input"
                className="block text-xl font-bold text-stone-900"
              >
                Paste the message, email, or bill here:
              </label>
              <textarea
                id="message-input"
                rows={5}
                maxLength={2000}
                aria-describedby="message-input-hint message-input-counter"
                className="w-full p-5 text-xl border-2 border-stone-300 rounded-2xl focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/15 outline-none transition-all bg-white placeholder:text-stone-500 font-sans shadow-inner"
                placeholder="Your electricity bill of ₹1,240 is due on 24 September..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap justify-between gap-2 text-sm font-medium text-stone-700">
                <span id="message-input-hint" className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true"></span>
                  Plain text only • Never paste passwords or bank PINs
                </span>
                <span id="message-input-counter">{input.length} / 2000 characters</span>
              </div>
            </div>

            {/* Quick Sample Messages */}
            <div className="space-y-2.5 pt-3 border-t border-stone-200/80">
              <p className="text-base font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                Or try a sample message:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {SAMPLE_MESSAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => setInput(sample.text)}
                    aria-label={`Try sample: ${sample.label}`}
                    className="min-h-[48px] px-4 py-2.5 text-base font-medium rounded-xl bg-white hover:bg-amber-50 active:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 border-2 border-stone-200 hover:border-amber-300 focus-visible:ring-4 focus-visible:ring-[#1E3A5F] focus-visible:outline-hidden transition-all cursor-pointer text-left shadow-2xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={handleExplain}
                disabled={loading || !input.trim()}
                className="w-full sm:w-auto text-xl py-3.5 px-8"
              >
                {loading ? 'Reading & Simplifying...' : 'Explain this to me'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <LoadingState message="Reading and simplifying your message into calm plain language..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            message={error.message || 'We could not explain this message right now.'}
            onRetry={() => {
              setError(null);
              handleExplain();
            }}
          />
        )}

        {/* Results Section */}
        {result && !loading && (
          <section className="space-y-6" role="region" aria-label="Explanation results" aria-live="polite">
            <LiveAnnouncer message="Explanation ready. Below is what this means." />

            {/* WHAT THIS MEANS */}
            <Card className="border-l-8 border-l-[#1E3A5F] bg-[#FAF8F5] space-y-3 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#1E3A5F]">
                <Info className="w-7 h-7 shrink-0" aria-hidden="true" />
                <h3 className="text-2xl font-bold font-serif uppercase tracking-wide">
                  WHAT THIS MEANS
                </h3>
              </div>
              <p className="text-xl sm:text-2xl text-stone-900 leading-relaxed font-medium pt-1">
                {result.simpleExplanation}
              </p>
            </Card>

            {/* IMPORTANT DETAILS */}
            {result.importantDetails.length > 0 && (
              <Card className="space-y-4 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-stone-900">
                  <FileText className="w-6 h-6 text-[#1E3A5F] shrink-0" aria-hidden="true" />
                  <h3 className="text-xl font-bold font-serif uppercase tracking-wide text-stone-950">
                    IMPORTANT DETAILS
                  </h3>
                </div>
                <ul className="space-y-3">
                  {result.importantDetails.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3.5 text-lg sm:text-xl text-stone-800">
                      <span className="text-amber-600 font-bold text-2xl leading-none mt-0.5" aria-hidden="true">
                        •
                      </span>
                      <span className="leading-relaxed">{detail}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* WHAT YOU NEED TO DO */}
            {result.whatToDo.length > 0 && (
              <Card className="border-l-8 border-l-emerald-600 space-y-4 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-emerald-950">
                  <ListOrdered className="w-7 h-7 shrink-0 text-emerald-700" aria-hidden="true" />
                  <h3 className="text-2xl font-bold font-serif uppercase tracking-wide">
                    WHAT YOU NEED TO DO
                  </h3>
                </div>
                <ol className="space-y-3.5">
                  {result.whatToDo.map((step, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-xl text-stone-900 bg-white p-4 sm:p-5 rounded-2xl border-2 border-emerald-100 shadow-2xs"
                    >
                      <span
                        className="shrink-0 w-9 h-9 bg-emerald-100 text-emerald-900 rounded-full flex items-center justify-center font-bold text-lg border border-emerald-300"
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed font-medium">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* WATCH OUT FOR */}
            {result.warnings.length > 0 && (
              <Card className="bg-amber-50/80 border-2 border-amber-300 space-y-3.5 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-amber-950">
                  <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0" aria-hidden="true" />
                  <h3 className="text-xl font-bold font-serif uppercase tracking-wide text-amber-950">
                    WATCH OUT FOR
                  </h3>
                </div>
                <ul className="space-y-3">
                  {result.warnings.map((warning, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3.5 text-lg sm:text-xl text-amber-950 font-medium"
                    >
                      <span className="text-amber-700 font-bold text-xl" aria-hidden="true">
                        !
                      </span>
                      <span className="leading-relaxed">{warning}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              {ttsSupported && (
                <Button
                  variant="secondary"
                  onClick={handleReadAloud}
                  icon={isSpeaking ? Square : Volume2}
                >
                  {isSpeaking ? 'Stop reading' : 'Read Aloud'}
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={handleCopy}
                icon={copied ? CheckCircle2 : Copy}
              >
                {copied ? 'Copied!' : 'Copy text'}
              </Button>

              <Button
                variant="primary"
                icon={PlayCircle}
                onClick={() => {
                  const taskSummary = result
                    ? `${result.simpleExplanation} Tasks: ${result.whatToDo.join(', ')}`
                    : input;
                  onHelpMeDo?.(taskSummary);
                }}
              >
                Help me do this
              </Button>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};
