import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SafetyFeature } from '../../features/safety/SafetyFeature';
import * as safetyService from '../../services/gemini/safety';

vi.mock('../../services/gemini/safety', () => ({
  checkSafety: vi.fn(),
}));

describe('SafetyFeature Component & Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input area, instructions not to enter sensitive data, and sample buttons', () => {
    render(<SafetyFeature />);

    expect(screen.getByRole('heading', { name: /Check Scam & Fraud Safety/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Never enter your OTP, PIN, password, CVV, or bank account numbers here/i)
    ).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', {
      name: /Paste the message or describe the phone call/i,
    });
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute(
      'placeholder',
      'Your bank account will be blocked today. Click this link immediately...'
    );

    expect(screen.getByRole('button', { name: /Bank Account Block Alert/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Electricity Cut Threat/i })).toBeInTheDocument();
  });

  it('disables check button when input is empty or whitespace', async () => {
    render(<SafetyFeature />);
    const checkBtn = screen.getByRole('button', { name: /Check This Message/i });
    expect(checkBtn).toBeDisabled();

    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, '   ');
    expect(checkBtn).toBeDisabled();
    expect(safetyService.checkSafety).not.toHaveBeenCalled();
  });

  it('renders assessment with explicit text label "Warning signs found" (not icon alone)', async () => {
    const mockSafetyResult: safetyService.SafetyCheckResult = {
      assessment: 'Multiple warning signs found in this urgent message.',
      warningSigns: [
        'Urgency: claims account will be suspended today',
        'Suspicious link: asks to visit an unverified website',
      ],
      safeActions: [
        'Contact the organization using the phone number or website you already know.',
      ],
      avoidActions: [
        'Do not click the link.',
        'Never share any OTP or PIN.',
      ],
    };

    vi.mocked(safetyService.checkSafety).mockResolvedValueOnce(mockSafetyResult);

    render(<SafetyFeature />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(
      textarea,
      'Your bank account will be blocked today. Click this link immediately...'
    );

    const checkBtn = screen.getByRole('button', { name: /Check This Message/i });
    await userEvent.click(checkBtn);

    expect(safetyService.checkSafety).toHaveBeenCalledWith(
      'Your bank account will be blocked today. Click this link immediately...'
    );

    // Explicit text label for accessibility
    expect(await screen.findByText('Warning signs found')).toBeInTheDocument();
    expect(
      screen.getByText('Multiple warning signs found in this urgent message.')
    ).toBeInTheDocument();

    // Large warning section
    expect(screen.getByText('WARNING SIGNS IDENTIFIED')).toBeInTheDocument();
    expect(
      screen.getByText('Urgency: claims account will be suspended today')
    ).toBeInTheDocument();

    // Avoid and Safe actions
    expect(screen.getByText('THINGS YOU MUST AVOID')).toBeInTheDocument();
    expect(screen.getByText('Never share any OTP or PIN.')).toBeInTheDocument();

    expect(screen.getByText('SAFE ACTIONS TO TAKE')).toBeInTheDocument();
    expect(
      screen.getByText('Contact the organization using the phone number or website you already know.')
    ).toBeInTheDocument();

    // Action buttons
    expect(screen.getByRole('button', { name: /Copy Advice/i })).toBeInTheDocument();
  });

  it('does NOT render clickable hyperlinks or execute external URLs from untrusted text', async () => {
    const untrustedResult: safetyService.SafetyCheckResult = {
      assessment: 'Warning signs found with suspicious link.',
      warningSigns: ['Link http://scam-bank.xyz detected'],
      safeActions: ['Contact your branch'],
      avoidActions: ['Do not click http://scam-bank.xyz'],
    };

    vi.mocked(safetyService.checkSafety).mockResolvedValueOnce(untrustedResult);

    render(<SafetyFeature />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Check link http://scam-bank.xyz');
    await userEvent.click(screen.getByRole('button', { name: /Check This Message/i }));

    await screen.findByText('WARNING SIGNS IDENTIFIED');

    // Ensure no <a> tags were rendered for the link to prevent accidental auto-navigation
    const linkElements = screen.queryAllByRole('link');
    const externalLinks = linkElements.filter((el) =>
      el.getAttribute('href')?.includes('scam-bank.xyz')
    );
    expect(externalLinks).toHaveLength(0);
  });

  it('handles API errors gracefully and allows retry', async () => {
    vi.mocked(safetyService.checkSafety).mockRejectedValueOnce(
      new Error('Unable to connect to safety engine')
    );

    render(<SafetyFeature />);
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Suspicious message text');
    await userEvent.click(screen.getByRole('button', { name: /Check This Message/i }));

    expect(await screen.findByText('Unable to connect to safety engine')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('supports keyboard navigation into the textbox and triggering via enter key', async () => {
    render(<SafetyFeature />);
    const textarea = screen.getByRole('textbox');
    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    await userEvent.type(textarea, 'Urgent electricity cut message');

    const checkBtn = screen.getByRole('button', { name: /Check This Message/i });
    checkBtn.focus();
    expect(document.activeElement).toBe(checkBtn);

    vi.mocked(safetyService.checkSafety).mockResolvedValueOnce({
      assessment: 'Warning signs found',
      warningSigns: ['Urgency'],
      safeActions: ['Contact electricity board directly'],
      avoidActions: ['Do not pay unknown callers'],
    });

    await userEvent.keyboard('{Enter}');
    expect(safetyService.checkSafety).toHaveBeenCalledWith('Urgent electricity cut message');
  });
});
