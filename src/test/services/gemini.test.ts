import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callGemini, AiError, clearAiCache } from '../../services/gemini/client';
import { validateAnalyzedMessage } from '../../services/gemini/understand';

describe('Gemini Service Client', () => {
  const dummyValidator = (data: any) => data;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAiCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles valid Gemini response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: '{"success": true}' }),
    } as Response);

    const result = await callGemini('test prompt', 'system prompt', dummyValidator);
    expect(result).toEqual({ success: true });
  });

  it('handles malformed JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ text: '{invalid json' }),
    } as Response);

    await expect(callGemini('test', 'system', dummyValidator)).rejects.toMatchObject({
      type: 'parsing',
    });
  });

  it('handles empty response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ text: '' }),
    } as Response);

    await expect(callGemini('test', 'system', dummyValidator)).rejects.toMatchObject({
      type: 'empty',
    });
  });

  it('handles API failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    } as Response);

    await expect(callGemini('test', 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini('test', 'system', dummyValidator)).rejects.toHaveProperty(
      'type',
      'network'
    );
  });

  it('rejects prompts over 5000 characters', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const longPrompt = 'a'.repeat(5001);
    await expect(callGemini(longPrompt, 'system', dummyValidator)).rejects.toThrow(AiError);
    await expect(callGemini(longPrompt, 'system', dummyValidator)).rejects.toHaveProperty(
      'type',
      'validation'
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('serves repeated identical queries from cache without extra network requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ text: '{"cached": true}' }),
    } as Response);

    const first = await callGemini('test prompt', 'system', dummyValidator);
    const second = await callGemini('test prompt', 'system', dummyValidator);

    expect(first).toEqual({ cached: true });
    expect(second).toEqual({ cached: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('deduplicates simultaneous in-flight requests for the same prompt', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({ text: '{"deduped": true}' }),
      } as Response;
    });

    const [first, second] = await Promise.all([
      callGemini('concurrent prompt', 'system', dummyValidator),
      callGemini('concurrent prompt', 'system', dummyValidator),
    ]);

    expect(first).toEqual({ deduped: true });
    expect(second).toEqual({ deduped: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe('Gemini Validators', () => {
  it('handles valid analyzed message data', () => {
    const data = {
      summary: 'Test summary',
      actionRequired: true,
      safety: 'safe' as const,
      nextSteps: ['step 1'],
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
