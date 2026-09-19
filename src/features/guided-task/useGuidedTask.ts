import { useState, useEffect } from 'react';
import { breakIntoSteps, GuidedTaskResult } from '../../services/gemini/guidedTask';
import { useReadAloud } from '../../hooks';
import { MAX_INPUT_LENGTH, getErrorMessage } from '../../utils';

export interface UseGuidedTaskProps {
  initialTask?: string;
}

export function useGuidedTask({ initialTask = '' }: UseGuidedTaskProps = {}) {
  const [taskInput, setTaskInput] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskPlan, setTaskPlan] = useState<GuidedTaskResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const { speak, stop, isSpeaking, supported: ttsSupported } = useReadAloud();

  const handleGenerateSteps = async (taskTextToUse?: string) => {
    const text = (taskTextToUse || taskInput).trim();
    if (!text) {
      setError('Please enter a task you want help with.');
      return;
    }

    if (text.length > MAX_INPUT_LENGTH) {
      setError(`Task description is too long. Please keep it under ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    setError(null);
    setTaskPlan(null);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsPaused(false);
    stop();

    try {
      const plan = await breakIntoSteps(text);
      if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0) {
        throw new Error('No steps were found for this task. Please try again.');
      }
      setTaskPlan(plan);
      setAnnouncement(`Loaded task: ${plan.task}. Step 1 of ${plan.steps.length}: ${plan.steps[0]}`);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, 'Could not prepare steps at this time. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTask && initialTask.trim().length > 0) {
      setTaskInput(initialTask);
      handleGenerateSteps(initialTask);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTask]);

  const totalSteps = taskPlan?.steps.length || 0;
  const currentStep = taskPlan?.steps[currentStepIndex] || '';
  const nextStepPreview =
    taskPlan && currentStepIndex + 1 < totalSteps ? taskPlan.steps[currentStepIndex + 1] : null;

  const handleNext = () => {
    stop();
    if (!taskPlan) return;

    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setAnnouncement(
        `Step ${nextIndex + 1} of ${totalSteps}: ${taskPlan.steps[nextIndex]}`
      );
    } else {
      setIsCompleted(true);
      setAnnouncement('Task completed! Great job finishing all the steps.');
    }
  };

  const handlePrev = () => {
    stop();
    if (!taskPlan || currentStepIndex <= 0) return;

    const prevIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevIndex);
    setAnnouncement(
      `Step ${prevIndex + 1} of ${totalSteps}: ${taskPlan.steps[prevIndex]}`
    );
  };

  const handlePause = () => {
    stop();
    setIsPaused(true);
    setAnnouncement(`Task paused at step ${currentStepIndex + 1} of ${totalSteps}.`);
  };

  const handleResume = () => {
    setIsPaused(false);
    setAnnouncement(`Resumed task at step ${currentStepIndex + 1} of ${totalSteps}: ${currentStep}`);
  };

  const handleReadStep = () => {
    if (!currentStep) return;
    if (isSpeaking) {
      stop();
      return;
    }

    const narration = `Step ${currentStepIndex + 1} of ${totalSteps}. ${currentStep}`;
    speak(narration);
  };

  const handleReset = () => {
    stop();
    setTaskPlan(null);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setIsPaused(false);
    setAnnouncement('Ready for a new task.');
  };

  return {
    taskInput,
    setTaskInput,
    loading,
    error,
    clearError: () => setError(null),
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
  };
}
