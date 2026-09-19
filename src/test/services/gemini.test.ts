import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callGemini, AiError, ai } from '../../src/services/gemini/client';
import { validateAnalyzedMessage } from '../../src/services/gemini/understand';

// Mock the GoogleGenAI instance
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn(),
      },
    })),
  };
});

describe('Gemini Service Client', () => {
  const dummyValidator = (data: any) => data;
  const generateContentMock = ai.models.generateContent as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles valid Gemini response', async () => {
    generateContentMock.mockResolvedValueOnce({ text: '{"success": true}' });
    
    const result = await callGemini('test prompt', 'system prompt', dummyValidator);
    expect(result).toEqual({ success: true });
  });

  it('handles malformed JSON', async () => {
    generateContentMock.mockResolvedValueOnce({ text: '{invalid json' });
    
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toHaveProperty('type', 'parsing');
  });

  it('handles empty response', async () => {
    generateContentMock.mockResolvedValueOnce({ text: '' });
    
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toHaveProperty('type', 'empty');
  });

  it('handles API failure', async () => {
    generateContentMock.mockRejectedValueOnce(new Error('API Down'));
    
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toHaveProperty('type', 'network');
  });

  it('rejects prompts over 5000 characters', async () => {
    const longPrompt = 'a'.repeat(5001);
    await expect(callGemini(longPrompt, 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini(longPrompt, 'system', dummyValidator)).rejects.toHaveProperty('type', 'validation');
    expect(generateContentMock).not.toHaveBeenCalled();
  });

  it('handles timeout', async () => {
    // Mock an API call that never resolves
    generateContentMock.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 20000)));
    
    // We mock timers to speed up the test
    vi.useFakeTimers();
    const promise = callGemini('test', 'system', dummyValidator);
    vi.advanceTimersByTime(16000); // Advance past 15s timeout
    
    await expect(promise).rejects.toThrow(AiError);
    await expect(promise).rejects.toHaveProperty('type', 'timeout');
    vi.useRealTimers();
  });
});

describe('Gemini Validators', () => {
  it('handles valid analyzed message data', () => {
    const data = {
      summary: 'Test summary',
      actionRequired: true,
      safety: 'safe',
      nextSteps: ['step 1']
    };
    const result = validateAnalyzedMessage(data);
    expect(result).toEqual(data);
  });

  it('safely handles missing fields by applying defaults', () => {
    const result = validateAnalyzedMessage({});
    expect(result.summary).toBe('No summary provided.');
    expect(result.actionRequired).toBe(false);
    expect(result.safety).toBe('safe');
    expect(result.nextSteps).toEqual([]);
  });

  it('safely handles invalid enum values for safety', () => {
    const result = validateAnalyzedMessage({ safety: 'weird_value' });
    expect(result.safety).toBe('safe'); // Fallback to safe
  });

  it('safely filters invalid items in nextSteps array', () => {
    const result = validateAnalyzedMessage({ nextSteps: ['valid', 123, null, 'valid2'] });
    expect(result.nextSteps).toEqual(['valid', 'valid2']);
  });

  it('throws validation error if root is not an object', () => {
    expect(() => validateAnalyzedMessage(null)).toThrow(AiError);
    expect(() => validateAnalyzedMessage('string')).toThrow(AiError);
  });
});
