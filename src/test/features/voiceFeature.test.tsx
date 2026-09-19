import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoiceFeature } from '../../features/voice/VoiceFeature';

let latestRecognitionInstance: MockSpeechRecognition | null = null;

class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = 'en-US';
  onstart: (() => void) | null = null;
  onresult: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    latestRecognitionInstance = this;
  }

  start() {
    if (this.onstart) {
      this.onstart();
    }
  }

  stop() {
    if (this.onend) {
      this.onend();
    }
  }

  abort() {}
}

class MockSpeechSynthesisUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('VoiceFeature ("Voice & Read Aloud Companion") Component Tests', () => {
  const originalSpeechSynthesis = window.speechSynthesis;
  const originalSpeechRecognition = (window as any).SpeechRecognition;
  const originalWebkitSpeechRecognition = (window as any).webkitSpeechRecognition;
  const originalUtterance = (window as any).SpeechSynthesisUtterance;

  beforeEach(() => {
    vi.clearAllMocks();
    latestRecognitionInstance = null;
    (window as any).SpeechRecognition = MockSpeechRecognition;
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  });

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    (window as any).SpeechRecognition = originalSpeechRecognition;
    (window as any).webkitSpeechRecognition = originalWebkitSpeechRecognition;
    (window as any).SpeechSynthesisUtterance = originalUtterance;
  });

  describe('Browser without Speech API (Fallback states)', () => {
    it('shows fallback message when speech recognition is unavailable on the browser', () => {
      // Ensure SpeechRecognition is deleted
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;

      render(<VoiceFeature />);

      expect(
        screen.getByText("Voice isn't available on this browser. You can type instead.")
      ).toBeInTheDocument();
      // Ensure text alternative is available
      expect(
        screen.getByLabelText(/Or type your question or command \(text alternative\):/i)
      ).toBeInTheDocument();
    });

    it('shows read aloud fallback message when speechSynthesis is unsupported on the browser', () => {
      // Simulate browser without speechSynthesis
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      render(<VoiceFeature />);

      expect(
        screen.getByText(/Read aloud is not supported on this browser/i)
      ).toBeInTheDocument();
    });
  });

  describe('Read Aloud & Stop Speaking', () => {
    let mockSpeak: any;
    let mockCancel: any;

    beforeEach(() => {
      mockSpeak = vi.fn().mockImplementation((utterance: any) => {
        if (utterance && utterance.onstart) {
          utterance.onstart();
        }
      });
      mockCancel = vi.fn();

      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          speak: mockSpeak,
          cancel: mockCancel,
        },
        writable: true,
        configurable: true,
      });

      (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    });

    it('triggers read aloud when "Listen Now" is clicked', async () => {
      render(<VoiceFeature />);

      const readBtn = screen.getByRole('button', { name: /Read Aloud|Listen Now/i });
      expect(readBtn).toBeInTheDocument();

      await userEvent.click(readBtn);

      expect(mockSpeak).toHaveBeenCalled();
    });

    it('stops speaking when "Stop Speaking" is clicked', async () => {
      render(<VoiceFeature />);

      const readBtn = screen.getByRole('button', { name: /Read Aloud|Listen Now/i });
      await userEvent.click(readBtn);

      // After speak() runs with mockSpeak calling onstart, "Stop Speaking" buttons are present
      const stopButtons = screen.getAllByRole('button', { name: /Stop Speaking/i });
      expect(stopButtons.length).toBeGreaterThanOrEqual(1);

      await userEvent.click(stopButtons[0]);

      expect(mockCancel).toHaveBeenCalled();
    });
  });

  describe('Accessible Labels & Design Requirements', () => {
    it('has explicit text labels on microphone button (does not rely only on icon)', () => {
      render(<VoiceFeature />);

      const micBtn = screen.getByRole('button', { name: /Start Listening/i });
      expect(micBtn).toBeInTheDocument();
      // Ensure visible text exists inside button
      expect(micBtn).toHaveTextContent('Start Listening');
    });

    it('updates label and state when listening starts and respects reduced motion', async () => {
      render(<VoiceFeature />);

      const micBtn = screen.getByRole('button', { name: /Start Listening/i });
      await userEvent.click(micBtn);

      const listeningBtn = screen.getByRole('button', { name: /Listening\.\.\. Tap to stop/i });
      expect(listeningBtn).toBeInTheDocument();
      expect(listeningBtn).toHaveTextContent(/Listening\.\.\. Tap to stop/i);

      // Contains motion-safe pulse class to respect prefers-reduced-motion
      expect(listeningBtn.className).toContain('motion-safe:animate-pulse');
      expect(listeningBtn.className).toContain('motion-reduce:animate-none');
    });

    it('has accessible label on text alternative input and submit button', () => {
      render(<VoiceFeature />);

      const input = screen.getByLabelText(/Or type your question or command \(text alternative\):/i);
      expect(input).toBeInTheDocument();

      const goBtn = screen.getByRole('button', { name: /Submit command/i });
      expect(goBtn).toBeInTheDocument();
    });
  });

  describe('Voice & Text Mapping to App Experiences', () => {
    it('maps typed "What do I need to do today?" to My Day experience', async () => {
      const mockNavigate = vi.fn();
      render(<VoiceFeature onNavigate={mockNavigate} />);

      const input = screen.getByLabelText(/Or type your question or command/i);
      await userEvent.type(input, 'What do I need to do today?');

      const goBtn = screen.getByRole('button', { name: /Submit command/i });
      await userEvent.click(goBtn);

      expect(mockNavigate).toHaveBeenCalledWith('dashboard');
      expect(screen.getByText(/Mapped to: My Day/i)).toBeInTheDocument();
    });

    it('maps typed "Explain this message." to Understand experience', async () => {
      const mockNavigate = vi.fn();
      render(<VoiceFeature onNavigate={mockNavigate} />);

      const input = screen.getByLabelText(/Or type your question or command/i);
      await userEvent.type(input, 'Explain this message.');

      const goBtn = screen.getByRole('button', { name: /Submit command/i });
      await userEvent.click(goBtn);

      expect(mockNavigate).toHaveBeenCalledWith('understand');
      expect(screen.getByText(/Mapped to: Understand/i)).toBeInTheDocument();
    });

    it('allows clicking preset suggested commands as a text alternative', async () => {
      const mockNavigate = vi.fn();
      render(<VoiceFeature onNavigate={mockNavigate} />);

      const presetBtn = screen.getByRole('button', { name: /"What do I need to do today\?"/i });
      await userEvent.click(presetBtn);

      expect(mockNavigate).toHaveBeenCalledWith('dashboard');
    });

    it('handles speech recognition result and maps to experience', async () => {
      const mockNavigate = vi.fn();
      render(<VoiceFeature onNavigate={mockNavigate} />);

      const startBtn = screen.getByRole('button', { name: /Start Listening/i });
      await userEvent.click(startBtn);

      expect(latestRecognitionInstance).not.toBeNull();

      // Simulate SpeechRecognition event with final transcript
      act(() => {
        if (latestRecognitionInstance?.onresult) {
          latestRecognitionInstance.onresult({
            results: [
              Object.assign([{ transcript: 'Explain this message.', confidence: 0.95 }], {
                isFinal: true,
                length: 1,
              }),
            ],
          } as any);
        }
      });

      expect(mockNavigate).toHaveBeenCalledWith('understand');
    });
  });
});
