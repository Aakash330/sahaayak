import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { UnderstandFeature } from '../../src/features/understand/UnderstandFeature';
import * as geminiService from '../../src/services/gemini/understand';

vi.mock('../../src/services/gemini/understand', () => ({
  explainMessage: vi.fn(),
}));

describe('UnderstandFeature Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial input state correctly', () => {
    render(<UnderstandFeature />);
    expect(screen.getByRole('heading', { name: /Make this easier to understand/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Button should be disabled when empty
    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    expect(explainButton).toBeDisabled();
  });

  it('prevents submission if input is over 2000 chars', async () => {
    render(<UnderstandFeature />);
    const textbox = screen.getByRole('textbox');
    
    // In actual browser, maxLength prevents typing, but we can bypass it in tests sometimes or just test the internal logic.
    // However, the component relies on maxLength attribute on textarea.
    expect(textbox).toHaveAttribute('maxLength', '2000');
  });

  it('calls explainMessage API and renders the structured result', async () => {
    const mockResult = {
      simpleExplanation: 'This is a simple explanation.',
      importantDetails: ['Important point 1'],
      whatToDo: ['Do this thing'],
      warnings: ['Watch out for this scam']
    };
    
    vi.mocked(geminiService.explainMessage).mockResolvedValueOnce(mockResult);

    render(<UnderstandFeature />);
    
    const textbox = screen.getByRole('textbox');
    await userEvent.type(textbox, 'Complicated message here');
    
    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    expect(explainButton).not.toBeDisabled();
    
    await userEvent.click(explainButton);
    
    expect(geminiService.explainMessage).toHaveBeenCalledWith('Complicated message here');
    
    expect(await screen.findByText('This is a simple explanation.')).toBeInTheDocument();
    expect(screen.getByText('Important point 1')).toBeInTheDocument();
    expect(screen.getByText('Do this thing')).toBeInTheDocument();
    expect(screen.getByText('Watch out for this scam')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Copy text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Help me do this/i })).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(geminiService.explainMessage).mockRejectedValueOnce(new Error('Network failure'));

    render(<UnderstandFeature />);
    
    const textbox = screen.getByRole('textbox');
    await userEvent.type(textbox, 'Complicated message');
    
    const explainButton = screen.getByRole('button', { name: /Explain this to me/i });
    await userEvent.click(explainButton);
    
    expect(await screen.findByText('Network failure')).toBeInTheDocument();
  });
});
