import React from 'react';
import { PageContainer, Card, Button } from '../../components/ui';
import {
  Volume2,
  Square,
  Sparkles,
  Gauge,
  BookOpen,
  Heart,
  Calendar,
  RotateCcw,
  Mic,
  MicOff,
  ArrowRight,
  ShieldCheck,
  Send,
  Info,
} from 'lucide-react';
import { useVoiceCompanion } from './useVoiceCompanion';
import {
  CommandInterpretation,
  AppView,
} from '../../services/voice/commandRouter';
import { LiveAnnouncer } from '../../accessibility';

interface VoiceFeatureProps {
  onNavigate?: (view: AppView) => void;
}

const VOICE_PRESETS = [
  {
    title: 'Daily Calming Thought',
    icon: Heart,
    text: 'Good day. Remember to breathe deeply, relax your shoulders, and drink a glass of warm water. Take each moment at your own peaceful pace today.',
  },
  {
    title: 'Morning Medicine & Hydration',
    icon: Calendar,
    text: 'Please take your morning blood pressure tablet after your light breakfast. Drink one glass of clean water and sit comfortably for ten minutes.',
  },
  {
    title: 'Eyes & Walking Rest',
    icon: BookOpen,
    text: 'If you have been reading or looking at a screen, gently look out the window at the green trees or distant sky for two minutes to let your eyes rest.',
  },
];

const SUGGESTED_COMMANDS = [
  'What do I need to do today?',
  'Explain this message.',
  'Is this a scam?',
  'Help me pay my electricity bill.',
  'Remind me to take my medicine.',
];

export const VoiceFeature: React.FC<VoiceFeatureProps> = ({ onNavigate }) => {
  const {
    textToRead,
    setTextToRead,
    speed,
    typedCommand,
    setTypedCommand,
    lastInterpretation,
    liveAnnouncement,
    isSpeaking,
    ttsSupported,
    isListening,
    transcript,
    speechError,
    speechSupported,
    handleCommandExecution,
    handleToggleListening,
    handlePlayReadAloud,
    handleStopSpeaking,
    handleSpeedChange,
    handleTextSubmit,
    handleClearText,
    handleSelectPreset,
  } = useVoiceCompanion({ onNavigate });

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-10">
        <LiveAnnouncer message={liveAnnouncement} />

        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3.5">
            <span
              className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 shadow-2xs"
              aria-hidden="true"
            >
              <Volume2 className="w-8 h-8 text-[#1E3A5F]" />
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950">
                Voice & Read Aloud Companion
              </h2>
              <p className="text-lg sm:text-xl text-stone-700 font-medium">
                Speak commands, ask questions, or listen to any message read
                aloud in a calm, clear voice.
              </p>
            </div>
          </div>
        </header>

        {/* Privacy & Safety Note */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-300/90 rounded-2xl flex items-start gap-3.5 text-emerald-950 shadow-2xs">
          <ShieldCheck
            className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-base sm:text-lg space-y-1">
            <p className="font-bold text-lg text-emerald-950">
              Safe & Private Voice:
            </p>
            <p className="text-stone-700 leading-relaxed font-medium">
              Sahaayak does not continuously listen or record your conversations.
              Voice is never the only way: every interaction has a complete,
              accessible text alternative.
            </p>
          </div>
        </div>

        {/* SECTION 1: VOICE COMMANDS & TEXT ALTERNATIVE */}
        <section aria-labelledby="voice-commands-heading">
          <Card className="space-y-6 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)] p-6 sm:p-8">
            <div className="border-b border-stone-200/80 pb-4">
              <h3 id="voice-commands-heading" className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 flex items-center gap-2.5">
                <Mic className="w-7 h-7 text-[#1E3A5F]" aria-hidden="true" />
                Speak to Sahaayak
              </h3>
              <p className="text-base sm:text-lg text-stone-700 font-medium mt-1">
                Tap the microphone to speak, or use the text box below.
              </p>
            </div>

          {/* Speech recognition support check */}
          {!speechSupported ? (
            <div
              className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3.5 shadow-2xs"
              role="alert"
            >
              <Info
                className="w-6 h-6 text-amber-700 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-bold text-lg">
                  Voice isn't available on this browser. You can type instead.
                </p>
                <p className="text-base text-stone-700">
                  Your browser does not support Web Speech recognition. You can
                  use the text input and buttons below for the exact same
                  experience.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Large Microphone Button with Explicit Text Label (Not icon-only) */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleListening}
                  aria-label={
                    isListening
                      ? 'Listening... Tap to stop listening'
                      : 'Start Listening'
                  }
                  aria-pressed={isListening}
                  className={`w-full sm:w-auto min-h-[64px] px-8 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all cursor-pointer border-2 ${
                    isListening
                      ? 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white border-rose-900 shadow-lg ring-4 ring-rose-200 motion-safe:animate-pulse motion-reduce:animate-none'
                      : 'bg-[#1E3A5F] hover:bg-[#152843] active:bg-[#0E1B2E] text-white border-[#152843] shadow-md ring-2 ring-[#1E3A5F]/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-7 h-7" aria-hidden="true" />
                      <span>Listening... Tap to stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-7 h-7" aria-hidden="true" />
                      <span>Start Listening</span>
                    </>
                  )}
                </button>

                {/* Clear Listening Status Text */}
                {isListening && (
                  <div
                    className="flex items-center gap-2.5 text-rose-800 font-bold text-lg"
                    role="status"
                    aria-live="polite"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-600 motion-safe:animate-ping motion-reduce:animate-none" />
                    <span>Listening for your voice... Speak now</span>
                  </div>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="p-5 bg-stone-50 border border-stone-200/90 rounded-2xl shadow-2xs">
                  <span className="text-xs uppercase font-bold text-stone-600 tracking-wider block">
                    Heard so far:
                  </span>
                  <p className="text-xl sm:text-2xl font-serif font-semibold text-stone-950 mt-1">
                    "{transcript}"
                  </p>
                </div>
              )}

              {speechError && (
                <p className="text-base text-amber-900 bg-amber-50 p-4 rounded-xl border border-amber-200 font-medium">
                  {speechError}
                </p>
              )}
            </div>
          )}

          {/* TEXT ALTERNATIVE (MANDATORY REQUIREMENT) */}
          <div className="space-y-4 pt-4 border-t border-stone-200/80">
            <form onSubmit={handleTextSubmit} className="space-y-2.5">
              <label
                htmlFor="voice-text-input"
                className="block text-xl font-bold text-stone-900"
              >
                Or type your question or command (text alternative):
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="voice-text-input"
                  type="text"
                  value={typedCommand}
                  onChange={(e) => setTypedCommand(e.target.value)}
                  placeholder="e.g. What do I need to do today? or Explain this message."
                  className="flex-1 p-5 text-xl border-2 border-stone-300 rounded-2xl focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/15 outline-none transition-all placeholder:text-stone-400 bg-white font-sans shadow-inner"
                />
                <Button
                  variant="primary"
                  type="submit"
                  icon={Send}
                  disabled={!typedCommand.trim()}
                  className="shrink-0 text-xl py-4 px-8"
                  aria-label="Submit command"
                >
                  Send
                </Button>
              </div>
            </form>

            {/* Quick Action Suggestion Chips */}
            <div className="space-y-2.5 pt-2">
              <p className="text-base font-bold text-stone-800">
                You can also tap any everyday request:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {SUGGESTED_COMMANDS.map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCommandExecution(cmd)}
                    className="min-h-[48px] px-4 py-2.5 text-base font-medium rounded-xl bg-white hover:bg-amber-50 active:bg-amber-100 text-stone-800 border-2 border-stone-200 hover:border-amber-300 focus-visible:ring-4 focus-visible:ring-[#1E3A5F] focus-visible:outline-hidden transition-all cursor-pointer text-left shadow-2xs"
                  >
                    "{cmd}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Last Interpretation Result Banner */}
          {lastInterpretation && (
            <div
              className="p-5 sm:p-6 bg-stone-50 border-2 border-[#1E3A5F]/30 rounded-2xl space-y-3 shadow-2xs"
              role="region"
              aria-label="Command outcome"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wider font-bold text-[#1E3A5F] bg-blue-100/70 px-2.5 py-1 rounded-md border border-blue-200">
                  Mapped to: {lastInterpretation.label}
                </span>
                {onNavigate && (
                  <Button
                    variant="primary"
                    onClick={() => onNavigate(lastInterpretation.targetView)}
                    icon={ArrowRight}
                    className="text-base py-2 px-5"
                  >
                    Open {lastInterpretation.label}
                  </Button>
                )}
              </div>
              <p className="text-xl font-serif font-semibold text-stone-950">
                {lastInterpretation.matchedReason}
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* SECTION 2: READ ALOUD & STOP SPEAKING */}
      <section aria-labelledby="read-aloud-heading">
        <Card className="space-y-6 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)] p-6 sm:p-8">
          <div className="border-b border-stone-200/80 pb-4">
            <h3 id="read-aloud-heading" className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 flex items-center gap-2.5">
              <Volume2 className="w-7 h-7 text-[#1E3A5F]" aria-hidden="true" />
              Read Aloud
            </h3>
            <p className="text-base sm:text-lg text-stone-700 font-medium mt-1">
              Listen to messages, reminders, or letters in a calm, clear voice.
            </p>
          </div>

          {/* TTS Fallback banner if not supported */}
          {!ttsSupported && (
            <div
              className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950"
              role="alert"
            >
              <p className="font-bold text-lg">
                Read aloud is not supported on this browser. You can read the
                text directly on screen.
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            <label
              htmlFor="voice-reader-text"
              className="block text-xl font-bold text-stone-900"
            >
              Text to read aloud:
            </label>
            <textarea
              id="voice-reader-text"
              rows={4}
              value={textToRead}
              onChange={(e) => setTextToRead(e.target.value)}
              placeholder="Paste any article, email, SMS, or letter here..."
              className="w-full p-5 text-xl border-2 border-stone-300 rounded-2xl focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/15 outline-none transition-all placeholder:text-stone-400 bg-white font-sans shadow-inner"
            />
          </div>

          {/* Voice Speed Controls */}
          <div className="space-y-3 pt-3 border-t border-stone-200/80">
            <label className="text-base font-bold text-stone-800 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-stone-600" aria-hidden="true" />
              Reading Speed:
            </label>
            <div
              className="flex flex-wrap gap-3"
              role="radiogroup"
              aria-label="Reading Speed"
            >
              {[
                { label: 'Slow & Clear (0.75x)', value: 0.75 },
                { label: 'Comfortable Pace (0.85x)', value: 0.85 },
                { label: 'Normal Pace (1.0x)', value: 1.0 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={speed === opt.value}
                  onClick={() => handleSpeedChange(opt.value)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl text-base font-bold border-2 transition-all cursor-pointer focus-visible:ring-4 focus-visible:ring-[#1E3A5F] focus-visible:outline-hidden ${
                    speed === opt.value
                      ? 'border-[#1E3A5F] bg-blue-50 text-[#1E3A5F] ring-2 ring-[#1E3A5F]/20'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar: Read Aloud and Dedicated Stop Speaking */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80">
            <div className="flex flex-wrap gap-3.5">
              <Button
                variant={isSpeaking ? 'danger' : 'primary'}
                onClick={handlePlayReadAloud}
                icon={isSpeaking ? Square : Volume2}
                disabled={!ttsSupported || !textToRead.trim()}
                className="text-xl py-3.5 px-8"
                aria-label={isSpeaking ? 'Stop Speaking' : 'Read Aloud'}
              >
                {isSpeaking ? 'Stop Speaking' : 'Listen Now'}
              </Button>

              {isSpeaking && (
                <Button
                  variant="danger"
                  onClick={handleStopSpeaking}
                  icon={Square}
                  aria-label="Stop Speaking"
                >
                  Stop Speaking
                </Button>
              )}

              <Button
                variant="back"
                onClick={handleClearText}
                icon={RotateCcw}
                disabled={!textToRead}
                aria-label="Clear Text"
              >
                Clear Text
              </Button>
            </div>

            {/* Speaking animation indicator respecting prefers-reduced-motion */}
            {isSpeaking && (
              <div
                className="flex items-center gap-2.5 px-4 py-2 bg-emerald-100 text-emerald-950 rounded-full font-bold text-base motion-safe:animate-pulse motion-reduce:animate-none border border-emerald-300"
                aria-live="polite"
              >
                <span className="w-3 h-3 rounded-full bg-emerald-700" />
                <span>Reading aloud to you...</span>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Helpful Everyday Presets */}
      <section aria-labelledby="voice-presets-heading" className="space-y-4">
        <h3 id="voice-presets-heading" className="text-2xl font-bold font-serif text-stone-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" aria-hidden="true" />
          Everyday Listening Presets:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VOICE_PRESETS.map((preset, idx) => {
            const IconComp = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Load preset: ${preset.title}`}
                className="space-y-3 p-5 sm:p-6 rounded-2xl border-2 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)] hover:border-[#1E3A5F]/50 hover:shadow-md focus-visible:ring-4 focus-visible:ring-[#1E3A5F] focus-visible:outline-hidden transition-all cursor-pointer bg-white text-left"
                onClick={() => handleSelectPreset(preset)}
              >
                <div className="flex items-center gap-2.5 text-[#1E3A5F] font-bold font-serif text-xl">
                  <IconComp className="w-5 h-5 shrink-0 text-amber-600" aria-hidden="true" />
                  <span>{preset.title}</span>
                </div>
                <p className="text-stone-700 text-base line-clamp-3 leading-relaxed font-sans">
                  {preset.text}
                </p>
                <div className="pt-2">
                  <span className="text-base font-bold text-[#1E3A5F] flex items-center gap-1">
                    Tap to load & listen →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
      </div>
    </PageContainer>
  );
};
