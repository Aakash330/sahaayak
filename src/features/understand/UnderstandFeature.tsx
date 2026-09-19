import React, { useState } from 'react';
import { PageContainer, Card, Button, LoadingState, ErrorState, StatusBadge } from '../../components/ui';
import { explainMessage, UnderstandResult } from '../../services/gemini';
import { useReadAloud } from '../../hooks/useReadAloud';
import { PlayCircle, Volume2, Square, Copy, CheckCircle2 } from 'lucide-react';
import { LiveAnnouncer } from '../../accessibility';

export const UnderstandFeature: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<UnderstandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const { speak, stop, isSpeaking, supported: ttsSupported } = useReadAloud();

  const handleExplain = async () => {
    if (!input.trim()) return;
    
    // Security: Stop unreasonably long inputs to prevent token exhaustion or DoS
    if (input.length > 2000) {
      setError(new Error('Input is too long. Please paste a shorter message.'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedResult = await explainMessage(input);
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
Explanation: ${result.simpleExplanation}
Important Details: ${result.importantDetails.join(', ')}
What to do: ${result.whatToDo.join(', ')}
Warnings: ${result.warnings.join(', ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const handleReadAloud = () => {
    if (!result) return;
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `
        Here is what this means. ${result.simpleExplanation}.
        Important details are: ${result.importantDetails.join('. ')}.
        What you need to do: ${result.whatToDo.join('. ')}.
        ${result.warnings.length > 0 ? `Please watch out for: ${result.warnings.join('. ')}` : ''}
      `;
      speak(textToRead);
    }
  };

  if (loading) {
    return <LoadingState message="Reading and simplifying your message..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error.message || 'We could not explain this message right now.'} 
        onRetry={() => setError(null)} 
      />
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        
        {/* Input Section */}
        <Card>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Make this easier to understand</h2>
          <label htmlFor="message-input" className="block text-xl font-medium text-stone-700 mb-3">
            Paste the message, email, or bill here:
          </label>
          <textarea
            id="message-input"
            className="w-full h-48 p-4 text-xl border-2 border-stone-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-colors bg-white resize-none"
            placeholder="e.g. Your electricity bill of ₹1,240 is due on 24 September..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
          />
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleExplain} 
              disabled={!input.trim()}
              className="w-full sm:w-auto"
            >
              Explain this to me
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6" role="region" aria-label="Explanation results">
            <LiveAnnouncer message="Explanation ready. Below is what this means." />
            
            <Card className="border-l-8 border-l-blue-600">
              <h3 className="text-2xl font-bold text-stone-900 mb-3 uppercase tracking-wide text-blue-900">
                What this means
              </h3>
              <p className="text-xl text-stone-800 leading-relaxed">
                {result.simpleExplanation}
              </p>
            </Card>

            {(result.importantDetails.length > 0 || result.warnings.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-6">
                {result.importantDetails.length > 0 && (
                  <Card>
                    <h3 className="text-xl font-bold text-stone-900 mb-4 uppercase text-stone-600">
                      Important Details
                    </h3>
                    <ul className="space-y-3">
                      {result.importantDetails.map((detail, idx) => (
                        <li key={idx} className="flex gap-3 text-lg text-stone-800">
                          <span className="text-blue-600" aria-hidden="true">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {result.warnings.length > 0 && (
                  <Card className="bg-amber-50 border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4 uppercase">
                      Watch out for
                    </h3>
                    <ul className="space-y-3">
                      {result.warnings.map((warning, idx) => (
                        <li key={idx} className="flex gap-3 text-lg text-amber-900 font-medium">
                          <span className="text-amber-700" aria-hidden="true">!</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            {result.whatToDo.length > 0 && (
              <Card className="border-l-8 border-l-green-600">
                <h3 className="text-2xl font-bold text-stone-900 mb-4 uppercase tracking-wide text-green-900">
                  What you need to do
                </h3>
                <ol className="space-y-4">
                  {result.whatToDo.map((step, idx) => (
                    <li key={idx} className="flex gap-4 text-xl text-stone-800 bg-stone-50 p-4 rounded-xl">
                      <span className="flex-shrink-0 w-8 h-8 bg-green-200 text-green-900 rounded-full flex items-center justify-center font-bold text-lg" aria-hidden="true">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

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
              
              <Button variant="primary" icon={PlayCircle}>
                Help me do this
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
