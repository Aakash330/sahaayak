import React from 'react';
import {
  PageContainer,
  Card,
  Button,
  LoadingState,
  ErrorState,
  ProgressIndicator,
  ConfirmationState,
} from '../../components/ui';
import {
  CheckCircle2,
  ListOrdered,
  Volume2,
  Square,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useGuidedTask } from './useGuidedTask';
import { LiveAnnouncer } from '../../accessibility';

interface GuidedTaskProps {
  initialTask?: string;
  onReturnToDashboard?: () => void;
}

const PRESET_TASKS = [
  'Pay my electricity bill',
  'Book an appointment with my doctor',
  'Order monthly prescription medicines',
  'Check my pension life certificate status',
];

export const GuidedTask: React.FC<GuidedTaskProps> = ({
  initialTask = '',
  onReturnToDashboard,
}) => {
  const {
    taskInput,
    setTaskInput,
    loading,
    error,
    clearError,
    taskPlan,
    currentStepIndex,
    isCompleted,
    isPaused,
    announcement,
    totalSteps,
    currentStep,
    nextStepPreview,
    isSpeaking,
    ttsSupported,
    handleGenerateSteps,
    handleNext,
    handlePrev,
    handlePause,
    handleResume,
    handleReadStep,
    handleReset,
  } = useGuidedTask({ initialTask });

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        <LiveAnnouncer message={announcement} />

        <header className="space-y-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 shadow-2xs" aria-hidden="true">
              <ListOrdered className="w-8 h-8 text-[#1E3A5F]" />
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950">
                Do It With Me
              </h2>
              <p className="text-lg sm:text-xl text-stone-700 font-medium">
                Step-by-step guidance designed for seniors. One patient step at a time.
              </p>
            </div>
          </div>
        </header>

        {/* Security Rule Reminder Badge */}
        <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-300/90 rounded-2xl flex items-start gap-3.5 text-emerald-950 shadow-2xs">
          <ShieldCheck className="w-7 h-7 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-base sm:text-lg font-medium space-y-1">
            <p className="font-bold text-lg text-emerald-950">
              Safe & Private Guidance:
            </p>
            <p className="text-stone-700 leading-relaxed">
              Sahaayak guides you through clear instructions, but <strong>you remain in control</strong>. Sahaayak will never ask for your OTP, PIN, password, CVV, or banking credentials, and will never submit payments on your behalf.
            </p>
          </div>
        </div>

        {/* Task Selection / Input Form (shown if no active plan or when finished) */}
        {!taskPlan && !loading && (
          <Card className="space-y-6 border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)]">
            <div role="form" aria-label="Step-by-step task generator form" className="space-y-6">
              <div className="space-y-2.5">
                <label
                  htmlFor="guided-task-input"
                  className="block text-xl font-bold text-stone-900"
                >
                  What task would you like guidance on?
                </label>
                <textarea
                  id="guided-task-input"
                  rows={3}
                  maxLength={2000}
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  aria-describedby="guided-task-hint guided-task-counter"
                  placeholder="Pay my electricity bill"
                  className="w-full p-5 text-xl border-2 border-stone-300 rounded-2xl focus:border-[#1E3A5F] focus:ring-4 focus:ring-[#1E3A5F]/15 outline-none transition-all placeholder:text-stone-500 bg-white font-sans shadow-inner"
                />
                <div className="flex justify-between text-sm font-medium text-stone-700">
                  <span id="guided-task-hint">Enter any online or offline task</span>
                  <span id="guided-task-counter">{taskInput.length} / 2000 characters</span>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2.5 pt-3 border-t border-stone-200/80">
                <p className="text-base font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  Or pick an everyday task:
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_TASKS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setTaskInput(preset);
                        handleGenerateSteps(preset);
                      }}
                      className="min-h-[48px] px-4 py-2.5 text-base font-medium rounded-xl bg-white hover:bg-amber-50 active:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 border-2 border-stone-200 hover:border-amber-300 focus-visible:ring-4 focus-visible:ring-[#1E3A5F] focus-visible:outline-hidden transition-all cursor-pointer text-left shadow-2xs"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleGenerateSteps()}
                  disabled={loading || !taskInput.trim()}
                  className="w-full sm:w-auto text-xl py-3.5 px-8"
                >
                  Start Step-by-Step Guide
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <LoadingState message="Preparing calm, step-by-step guidance..." />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            message={error}
            onRetry={() => handleGenerateSteps()}
          />
        )}

        {/* Paused State */}
        {taskPlan && isPaused && !isCompleted && (
          <Card className="space-y-6 text-center py-8 border-2 border-amber-300 bg-amber-50/50">
            <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-800 rounded-full flex items-center justify-center">
              <Pause className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-stone-900">
                Task Paused
              </h3>
              <p className="text-xl text-stone-700 leading-relaxed">
                Take your time. You are at <strong>Step {currentStepIndex + 1} of {totalSteps}</strong>. There is no rush, and your progress is saved right here.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button
                variant="primary"
                onClick={handleResume}
                icon={Play}
                className="text-xl py-3 px-6"
              >
                Resume Task
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                icon={RotateCcw}
              >
                Exit / Do This Later
              </Button>
            </div>
          </Card>
        )}

        {/* Active Step-by-Step Execution (One or two steps visible at a time) */}
        {taskPlan && !isPaused && !isCompleted && (
          <section className="space-y-6" role="region" aria-label="Guided task steps" aria-live="polite">
            {/* Header info */}
            <div className="bg-gradient-to-r from-amber-100/70 to-orange-50/50 border border-amber-200/90 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-2xs">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-md border border-amber-300">
                  Current Task
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mt-1.5">
                  {taskPlan.task}
                </h3>
              </div>
              <Button
                variant="secondary"
                onClick={handlePause}
                icon={Pause}
                className="shrink-0 bg-white shadow-2xs"
              >
                Pause / Do this later
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
              <ProgressIndicator
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                label="Task completion progress"
              />
            </div>

            {/* Primary Current Step Card (Step 1 of 2 visible) */}
            <Card className="space-y-6 border-l-8 border-l-[#1E3A5F] border-stone-200/90 shadow-[0_4px_20px_rgba(40,30,20,0.06)] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
                <span className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1E3A5F] tracking-wide">
                  STEP {currentStepIndex + 1} OF {totalSteps}
                </span>
                {ttsSupported && (
                  <Button
                    variant="secondary"
                    onClick={handleReadStep}
                    icon={isSpeaking ? Square : Volume2}
                    aria-label={isSpeaking ? 'Stop reading step aloud' : 'Read step aloud'}
                    className="!py-2 !px-4"
                  >
                    {isSpeaking ? 'Stop' : 'Read Step'}
                  </Button>
                )}
              </div>

              {/* Step Instruction Text */}
              <div className="p-6 sm:p-8 bg-[#FAF8F5] rounded-2xl border-2 border-stone-200/90">
                <p className="text-2xl sm:text-3xl font-serif font-semibold text-stone-950 leading-relaxed">
                  {currentStep}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80">
                <div>
                  {currentStepIndex > 0 ? (
                    <Button
                      variant="back"
                      onClick={handlePrev}
                      icon={ArrowLeft}
                      aria-label="Previous step"
                    >
                      Previous
                    </Button>
                  ) : (
                    <div className="text-stone-500 text-base italic font-medium px-2">
                      First step • Take your time
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  onClick={handleNext}
                  icon={currentStepIndex === totalSteps - 1 ? CheckCircle2 : ArrowRight}
                  className="text-xl py-3.5 px-8"
                  aria-label={
                    currentStepIndex === totalSteps - 1
                      ? 'Finish'
                      : "I've done this, proceed to next step"
                  }
                >
                  {currentStepIndex === totalSteps - 1 ? 'Finish' : "I've done this"}
                </Button>
              </div>
            </Card>

            {/* Next Step Preview Card (Step 2 of 2 visible, if available) */}
            {nextStepPreview && (
              <div className="p-5 bg-stone-100/80 rounded-2xl border border-stone-300/80">
                <span className="text-sm font-bold uppercase tracking-wider text-stone-600 block mb-1">
                  THEN: STEP {currentStepIndex + 2} OF {totalSteps}
                </span>
                <p className="text-xl text-stone-700 font-medium line-clamp-2">
                  {nextStepPreview}
                </p>
              </div>
            )}

            {/* Safety & Self-Service Notes */}
            {taskPlan.safetyNotes && taskPlan.safetyNotes.length > 0 && (
              <div className="p-5 bg-white rounded-2xl border border-stone-200/90 text-stone-700 text-base sm:text-lg space-y-1.5 shadow-2xs">
                <p className="font-bold text-stone-900">Helpful Reminders:</p>
                <ul className="list-disc list-inside space-y-1">
                  {taskPlan.safetyNotes.map((note, idx) => (
                    <li key={idx} className="leading-relaxed">{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Clear Completion State */}
        {isCompleted && (
          <div className="space-y-6">
            <ConfirmationState
              title="Great job! You've finished this task."
              message="You completed all the steps calmly at your own pace. Sahaayak guided you through the instructions, and you took all real actions yourself safely."
              continueLabel="Back to My Day"
              onContinue={() => {
                if (onReturnToDashboard) {
                  onReturnToDashboard();
                } else {
                  handleReset();
                }
              }}
            />

            <div className="text-center">
              <Button variant="secondary" onClick={handleReset} icon={RotateCcw}>
                Start another task
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
