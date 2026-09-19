import React from 'react';
import {
  PageContainer,
  Card,
  Button,
  LoadingState,
  ErrorState,
} from '../../components/ui';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Square,
  Copy,
  CheckCircle2,
  Sparkles,
  Info,
  XCircle,
} from 'lucide-react';
import { useSafetyCheck } from './useSafetyCheck';
import { LiveAnnouncer } from '../../accessibility';

const SAMPLE_MESSAGES = [
  {
    label: '🏦 Bank Account Block Alert',
    text: 'Your bank account will be blocked today. Click this link immediately to verify your KYC details and prevent suspension.',
  },
  {
    label: '⚡ Electricity Cut Threat',
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Immediately call our electricity officer on 9876543210 to update bill.',
  },
  {
    label: '🧾 Genuine Bill Notice',
    text: 'Your monthly electricity bill for Account #584920 is ₹840. Due date is 25th Sept. Pay online through official portal or municipal counter. Ignore if already paid.',
  },
];

export const SafetyFeature: React.FC = () => {
  const {
    inputText,
    setInputText,
    loading,
    error,
    clearError,
    result,
    hasWarningSigns,
    copied,
    isSpeaking,
    ttsSupported,
    handleCheck,
    handleReadAloud,
    handleCopy,
  } = useSafetyCheck();

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 shadow-2xs" aria-hidden="true">
              <ShieldAlert className="w-8 h-8 text-amber-800" />
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950">
                Check Scam & Fraud Safety
              </h2>
              <p className="text-lg sm:text-xl text-stone-700 font-medium">
                Received a strange message, email, or phone call? Check for warning signs before doing anything.
              </p>
            </div>
          </div>

          {/* Golden Rule Reassurance Card */}
          <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/90 text-stone-800 text-base sm:text-lg flex items-start gap-3.5 shadow-2xs">
            <Info className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="text-stone-950 font-bold">Golden Rule:</strong> Legitimate banks, electricity boards, and government offices will <span className="underline decoration-amber-600 underline-offset-2 font-bold">NEVER</span> ask you for your OTP, PIN, password, or tell you that your account will close in the next hour.
            </p>
          </div>
        </header>

        {/* Input Card */}
        <Card className="space-y-6 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)]">
          <div role="form" aria-label="Scam safety check form" className="space-y-6">
            <div className="space-y-2.5">
              <label
                htmlFor="safety-message-input"
                className="block text-xl font-bold text-stone-900"
              >
                Paste the message or describe the phone call:
              </label>
              <p id="safety-guideline" className="text-stone-700 text-base font-semibold">
                Never enter your OTP, PIN, password, CVV, or bank account numbers here.
              </p>
              <textarea
                id="safety-message-input"
                rows={5}
                maxLength={2000}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                aria-describedby="safety-guideline safety-counter"
                placeholder="Your bank account will be blocked today. Click this link immediately..."
                className="w-full p-5 text-xl border-2 border-stone-300 rounded-2xl focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/15 outline-none transition-all placeholder:text-stone-500 bg-white font-sans shadow-inner"
              />
              <div className="flex flex-wrap justify-between gap-2 text-sm font-medium text-stone-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" aria-hidden="true"></span>
                  Untrusted text check • We never execute links or scripts
                </span>
                <span id="safety-counter">{inputText.length} / 2000 characters</span>
              </div>
            </div>

            {/* Sample Messages */}
            <div className="space-y-2.5 pt-3 border-t border-stone-200/80">
              <p className="text-base font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                Try a common test example:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {SAMPLE_MESSAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => setInputText(sample.text)}
                    aria-label={`Test example: ${sample.label}`}
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
                onClick={handleCheck}
                disabled={loading || !inputText.trim()}
                className="w-full sm:w-auto text-xl py-3.5 px-8"
              >
                {loading ? 'Checking for warning signs...' : 'Check This Message'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <LoadingState message="Checking message for urgency, pressure, and suspicious requests..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            message={error}
            onRetry={() => {
              clearError();
              handleCheck();
            }}
          />
        )}

        {/* Safety Analysis Results */}
        {result && !loading && (
          <section className="space-y-6" role="region" aria-label="Safety assessment results" aria-live="polite">
            <LiveAnnouncer
              message={`Safety check complete. ${result.assessment}`}
            />

            {/* Assessment Verdict Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border-3 shadow-xs space-y-3.5 ${
                hasWarningSigns
                  ? 'bg-amber-50/95 border-amber-500 text-amber-950'
                  : 'bg-emerald-50/95 border-emerald-500 text-emerald-950'
              }`}
            >
              <div className="flex items-start gap-4">
                {hasWarningSigns ? (
                  <AlertTriangle className="w-10 h-10 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="w-10 h-10 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                )}
                <div>
                  <span
                    className={`inline-block px-3.5 py-1 text-base font-bold rounded-xl border ${
                      hasWarningSigns
                        ? 'bg-amber-200/90 text-amber-950 border-amber-400'
                        : 'bg-emerald-200/90 text-emerald-950 border-emerald-400'
                    }`}
                  >
                    {hasWarningSigns ? 'Warning signs found' : 'No obvious warning signs found'}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif mt-2.5 text-stone-950 leading-snug">
                    {result.assessment}
                  </h3>
                </div>
              </div>
            </div>

            {/* Warning Signs List (Large Warning Section) */}
            {result.warningSigns.length > 0 && (
              <Card className="space-y-4 border-2 border-amber-300 bg-amber-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-amber-950">
                  <AlertTriangle className="w-7 h-7 text-amber-700 shrink-0" aria-hidden="true" />
                  <h4 className="text-2xl font-bold font-serif uppercase tracking-wide">
                    WARNING SIGNS IDENTIFIED
                  </h4>
                </div>
                <ul className="space-y-3.5 pt-1">
                  {result.warningSigns.map((sign, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-xl text-stone-900 bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/90 font-medium shadow-2xs"
                    >
                      <span className="text-amber-700 font-bold text-2xl leading-none mt-0.5" aria-hidden="true">
                        ⚠
                      </span>
                      <span className="leading-relaxed">{sign}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Things to Avoid */}
            {result.avoidActions.length > 0 && (
              <Card className="space-y-4 border-2 border-rose-300 bg-rose-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-rose-950">
                  <XCircle className="w-7 h-7 text-rose-700 shrink-0" aria-hidden="true" />
                  <h4 className="text-2xl font-bold font-serif uppercase tracking-wide">
                    THINGS YOU MUST AVOID
                  </h4>
                </div>
                <ul className="space-y-3 pt-1">
                  {result.avoidActions.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-xl text-stone-900 bg-white p-4 rounded-2xl border border-rose-200/90 shadow-2xs"
                    >
                      <span className="text-rose-700 font-bold text-xl leading-none mt-0.5" aria-hidden="true">
                        ✕
                      </span>
                      <span className="font-medium leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Safe Alternative Actions (Prominently Highlighted) */}
            {result.safeActions.length > 0 && (
              <Card className="space-y-4 border-2 border-emerald-300 bg-emerald-50/70 p-6 sm:p-8">
                <div className="flex items-center gap-2.5 text-emerald-950">
                  <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0" aria-hidden="true" />
                  <h4 className="text-2xl font-bold font-serif uppercase tracking-wide">
                    SAFE ACTIONS TO TAKE
                  </h4>
                </div>
                <ul className="space-y-3 pt-1">
                  {result.safeActions.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 text-xl text-stone-900 bg-white p-4 rounded-2xl border border-emerald-200/90 shadow-2xs"
                    >
                      <span className="text-emerald-700 font-bold text-xl leading-none mt-0.5" aria-hidden="true">
                        ✓
                      </span>
                      <span className="leading-relaxed font-medium">{action}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Safe Official Source Contact Reminder */}
            <div className="p-5 bg-white rounded-2xl border border-stone-200/90 text-stone-800 text-base sm:text-lg flex items-start gap-3.5 shadow-2xs">
              <Info className="w-6 h-6 text-[#1E3A5F] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="text-stone-950 font-bold">Always remember:</strong> Never click links or call back phone numbers sent in a suspicious text. Contact the organization using the official customer care number written on your physical passbook, paper electricity bill, or in the official telephone directory.
              </p>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex flex-wrap gap-4">
              {ttsSupported && (
                <Button
                  variant="secondary"
                  onClick={handleReadAloud}
                  icon={isSpeaking ? Square : Volume2}
                >
                  {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={handleCopy}
                icon={copied ? CheckCircle2 : Copy}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Advice'}
              </Button>
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
};
