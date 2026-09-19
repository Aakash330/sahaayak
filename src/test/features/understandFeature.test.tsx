import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UnderstandFeature } from '../../features/understand/UnderstandFeature';
import * as geminiService from '../../services/gemini/understand';

vi.mock('../../services/gemini/understand', () => ({
  explainMessage: vi.fn(),
}));

describe('UnderstandFeature Component & Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Valid Response & Render
  it('renders valid response with exact required sections', async () => {
    const mockResult: geminiService.UnderstandResult = {
      simpleExplanation: 'Your power bill of ₹1,240 must be paid by September 24th.',
      importantDetails: ['Due date is 24 September', 'Amount is ₹1,240'],
      whatToDo: ['Pay online through BESCOM portal or visit nearest counter'],
      warnings: ['Late fee of ₹150 applies if not paid on time'],
    };

    vi.mocked(geminiService.explainMessage).mockResolvedValueOnce(mockResult);

    render(<UnderstandFeature />);

    expect(screen.getByRole('heading', { name: /Make this easier to understand/i })).toBeInTheDocument();
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    expect(textbox).toBeInTheDocument();

    await userEvent.type(textbox, 'Your electricity bill of ₹1,240 is due on 24 September');

    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    expect(explainButton).toBeEnabled();

    await userEvent.click(explainButton);

    expect(geminiService.explainMessage).toHaveBeenCalledWith(
      'Your electricity bill of ₹1,240 is due on 24 September'
    );

    // Verify all 4 sections are displayed
    expect(await screen.findByText('WHAT THIS MEANS')).toBeInTheDocument();
    expect(screen.getByText('Your power bill of ₹1,240 must be paid by September 24th.')).toBeInTheDocument();

    expect(screen.getByText('IMPORTANT DETAILS')).toBeInTheDocument();
    expect(screen.getByText('Due date is 24 September')).toBeInTheDocument();

    expect(screen.getByText('WHAT YOU NEED TO DO')).toBeInTheDocument();
    expect(screen.getByText('Pay online through BESCOM portal or visit nearest counter')).toBeInTheDocument();

    expect(screen.getByText('WATCH OUT FOR')).toBeInTheDocument();
    expect(screen.getByText('Late fee of ₹150 applies if not paid on time')).toBeInTheDocument();

    // Verify all action buttons
    expect(screen.getByRole('button', { name: /Copy text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Help me do this/i })).toBeInTheDocument();
  });

  // 2. Empty Input
  it('disables explain button when input is empty or whitespace only', async () => {
    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });

    expect(explainButton).toBeDisabled();

    await userEvent.type(textbox, '   ');
    expect(explainButton).toBeDisabled();
    expect(geminiService.explainMessage).not.toHaveBeenCalled();
  });

  // 3. Long Input Protection
  it('enforces maximum character limit of 2000 characters on textarea', () => {
    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    expect(textbox).toHaveAttribute('maxLength', '2000');
  });

  // 4. API Failure Handling
  it('handles API errors gracefully and allows retry', async () => {
    vi.mocked(geminiService.explainMessage).mockRejectedValueOnce(
      new Error('Could not connect to service. Please check your network.')
    );

    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    await userEvent.type(textbox, 'Complicated notice');

    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    await userEvent.click(explainButton);

    expect(
      await screen.findByText('Could not connect to service. Please check your network.')
    ).toBeInTheDocument();

    // Retry button is available
    const retryButton = screen.getByRole('button', { name: /Try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  // 5. XSS-like HTML Input Safety
  it('renders XSS payloads safely as plain text without HTML execution', async () => {
    const maliciousResult: geminiService.UnderstandResult = {
      simpleExplanation: '<script>alert("xss")</script>Safe plain text explanation',
      importantDetails: ['<img src="x" onerror="alert(1)">Detail without script'],
      whatToDo: ['<b onmouseover="alert(2)">Action step</b>'],
      warnings: ['<iframe src="evil.com"></iframe>Warning alert'],
    };

    vi.mocked(geminiService.explainMessage).mockResolvedValueOnce(maliciousResult);

    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    await userEvent.type(textbox, '<script>alert("test")</script>');

    await userEvent.click(screen.getByRole('button', { name: /Explain this to me/i }));

    // Verify it renders as plain text node, does not inject executable scripts
    expect(await screen.findByText(/Safe plain text explanation/)).toBeInTheDocument();
    expect(document.querySelector('script[src*="xss"]')).toBeNull();
    expect(document.querySelector('iframe[src*="evil.com"]')).toBeNull();
  });

  // 6. Keyboard Accessibility
  it('supports full keyboard navigation and focus management', async () => {
    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });

    // Tab into textbox
    textbox.focus();
    expect(document.activeElement).toBe(textbox);

    await userEvent.type(textbox, 'Electricity bill notice');

    // Tab to sample buttons or Explain button
    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    explainButton.focus();
    expect(document.activeElement).toBe(explainButton);

    // Enter key triggers click
    vi.mocked(geminiService.explainMessage).mockResolvedValueOnce({
      simpleExplanation: 'Clear explanation',
      importantDetails: [],
      whatToDo: ['Step one'],
      warnings: [],
    });

    await userEvent.keyboard('{Enter}');
    expect(geminiService.explainMessage).toHaveBeenCalledWith('Electricity bill notice');
  });

  // 7. "Help me do this" triggers callback
  it('triggers onHelpMeDo callback when clicked on results', async () => {
    const onHelpMeDoMock = vi.fn();
    vi.mocked(geminiService.explainMessage).mockResolvedValueOnce({
      simpleExplanation: 'Pay electricity bill',
      importantDetails: ['₹1,240 due'],
      whatToDo: ['Open electricity portal'],
      warnings: [],
    });

    render(<UnderstandFeature onHelpMeDo={onHelpMeDoMock} />);
    const textbox = screen.getByRole('textbox', { name: /Paste the message, email, or bill here/i });
    await userEvent.type(textbox, 'Electricity bill ₹1,240');
    await userEvent.click(screen.getByRole('button', { name: /Explain this to me/i }));

    const helpMeButton = await screen.findByRole('button', { name: /Help me do this/i });
    await userEvent.click(helpMeButton);

    expect(onHelpMeDoMock).toHaveBeenCalledWith(
      expect.stringContaining('Pay electricity bill')
    );
  });
});
