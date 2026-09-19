import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GuidedTask } from '../../features/guided-task/GuidedTask';
import * as guidedTaskService from '../../services/gemini/guidedTask';

vi.mock('../../services/gemini/guidedTask', () => ({
  breakIntoSteps: vi.fn(),
  validateGuidedTaskResult: vi.fn(),
}));

describe('GuidedTask Feature ("Do It With Me") Component Tests', () => {
  const mockPlan: guidedTaskService.GuidedTaskResult = {
    task: 'Pay my electricity bill',
    steps: [
      "Open your electricity provider's official website or app.",
      'Look for "Bill Payment".',
      'Enter the bill number shown on your bill.',
      'Review the amount before making the payment.',
    ],
    safetyNotes: [
      'Never share OTP or PIN with anyone.',
      'You perform the real payment yourself.',
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input area, presets, and security reminder', () => {
    render(<GuidedTask />);

    expect(screen.getByRole('heading', { name: /Do It With Me/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Sahaayak will never ask for your OTP, PIN, password, CVV/i)
    ).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', {
      name: /What task would you like guidance on\?/i,
    });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Pay my electricity bill');

    expect(screen.getByRole('button', { name: /Pay my electricity bill/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Start Step-by-Step Guide/i })
    ).toBeDisabled();
  });

  it('handles step progression: Step 1 -> Step 2 -> Step 3 -> Step 4', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Pay my electricity bill');

    const startBtn = screen.getByRole('button', { name: /Start Step-by-Step Guide/i });
    await userEvent.click(startBtn);

    // STEP 1 OF 4
    expect(await screen.findByText('STEP 1 OF 4')).toBeInTheDocument();
    expect(
      screen.getByText("Open your electricity provider's official website or app.")
    ).toBeInTheDocument();

    // Next step preview (1 or 2 steps visible at a time)
    expect(screen.getByText(/THEN: STEP 2 OF 4/i)).toBeInTheDocument();
    expect(screen.getByText('Look for "Bill Payment".')).toBeInTheDocument();

    // Next button labeled "I've done this"
    const nextBtn = screen.getByRole('button', { name: /I've done this/i });
    await userEvent.click(nextBtn);

    // STEP 2 OF 4
    expect(screen.getByText('STEP 2 OF 4')).toBeInTheDocument();
    expect(screen.getByText('Look for "Bill Payment".')).toBeInTheDocument();

    // Advance to STEP 3 OF 4
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));
    expect(screen.getByText('STEP 3 OF 4')).toBeInTheDocument();
    expect(
      screen.getByText('Enter the bill number shown on your bill.')
    ).toBeInTheDocument();
  });

  it('handles previous step: Step 2 back to Step 1', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Pay my electricity bill');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    await screen.findByText('STEP 1 OF 4');
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));
    expect(screen.getByText('STEP 2 OF 4')).toBeInTheDocument();

    // Click Previous
    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    await userEvent.click(prevBtn);

    // Back to Step 1
    expect(screen.getByText('STEP 1 OF 4')).toBeInTheDocument();
    expect(
      screen.getByText("Open your electricity provider's official website or app.")
    ).toBeInTheDocument();
  });

  it('completes the task on final step and displays clear completion state', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Pay my electricity bill');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    await screen.findByText('STEP 1 OF 4');

    // Step 1 -> 2
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));
    // Step 2 -> 3
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));
    // Step 3 -> 4
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));

    // On Step 4 of 4
    expect(screen.getByText('STEP 4 OF 4')).toBeInTheDocument();
    expect(
      screen.getByText('Review the amount before making the payment.')
    ).toBeInTheDocument();

    // Final step button is labeled "Finish"
    const finishBtn = screen.getByRole('button', { name: /Finish/i });
    expect(finishBtn).toBeInTheDocument();
    await userEvent.click(finishBtn);

    // Completion state is displayed
    expect(
      screen.getByText("Great job! You've finished this task.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Start another task/i })
    ).toBeInTheDocument();
  });

  it('handles pause and resume functionality', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Pay my electricity bill');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    await screen.findByText('STEP 1 OF 4');

    const pauseBtn = screen.getByRole('button', { name: /Pause \/ Do this later/i });
    await userEvent.click(pauseBtn);

    expect(screen.getByText('Task Paused')).toBeInTheDocument();
    expect(screen.getByText(/You are at/i)).toBeInTheDocument();

    const resumeBtn = screen.getByRole('button', { name: /Resume Task/i });
    await userEvent.click(resumeBtn);

    expect(screen.getByText('STEP 1 OF 4')).toBeInTheDocument();
  });

  it('handles malformed AI response gracefully', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockRejectedValueOnce(
      new Error('Malformed response from assistant. Please try again.')
    );

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Invalid task');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    expect(
      await screen.findByText('Malformed response from assistant. Please try again.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('handles empty steps error gracefully', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockRejectedValueOnce(
      new Error('No steps were found for this task. Please try again.')
    );

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Do something with no steps');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    expect(
      await screen.findByText('No steps were found for this task. Please try again.')
    ).toBeInTheDocument();
  });

  it('supports keyboard navigation through steps', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    await userEvent.type(textarea, 'Pay my electricity bill');

    const startBtn = screen.getByRole('button', { name: /Start Step-by-Step Guide/i });
    startBtn.focus();
    expect(document.activeElement).toBe(startBtn);

    await userEvent.keyboard('{Enter}');

    await screen.findByText('STEP 1 OF 4');

    const nextBtn = screen.getByRole('button', { name: /I've done this/i });
    nextBtn.focus();
    expect(document.activeElement).toBe(nextBtn);

    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('STEP 2 OF 4')).toBeInTheDocument();
  });

  it('provides screen-reader announcements via aria-live / LiveAnnouncer', async () => {
    vi.mocked(guidedTaskService.breakIntoSteps).mockResolvedValueOnce(mockPlan);

    render(<GuidedTask />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Pay my electricity bill');
    await userEvent.click(screen.getByRole('button', { name: /Start Step-by-Step Guide/i }));

    await screen.findByText('STEP 1 OF 4');

    // Check LiveAnnouncer is rendered with aria-live="polite"
    const announcer = screen.getByText(/Loaded task: Pay my electricity bill/i);
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute('aria-live', 'polite');

    // Advance step
    await userEvent.click(screen.getByRole('button', { name: /I've done this/i }));
    expect(screen.getByText(/Step 2 of 4: Look for "Bill Payment"/i)).toBeInTheDocument();
  });
});
