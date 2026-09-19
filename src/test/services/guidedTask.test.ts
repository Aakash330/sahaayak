import { describe, it, expect } from 'vitest';
import {
  validateGuidedTaskResult,
  breakIntoSteps,
} from '../../services/gemini/guidedTask';
import { AiError } from '../../services/gemini/client';

describe('GuidedTask Service Validator & Security Directives', () => {
  it('validates a well-formed guided task response', () => {
    const rawData = {
      task: 'Pay my electricity bill',
      steps: [
        "Open your electricity provider's official website or app.",
        'Look for "Bill Payment".',
        'Enter the bill number shown on your bill.',
        'Review the amount before making the payment.',
      ],
      safetyNotes: [
        'Never share OTP or PIN with anyone.',
        'Always check the website URL carefully.',
      ],
    };

    const result = validateGuidedTaskResult(rawData);
    expect(result.task).toBe('Pay my electricity bill');
    expect(result.steps).toHaveLength(4);
    expect(result.steps[0]).toBe("Open your electricity provider's official website or app.");
    expect(result.steps[3]).toBe('Review the amount before making the payment.');
    expect(result.safetyNotes.length).toBeGreaterThanOrEqual(2);
  });

  it('throws validation error if AI response is malformed or not an object', () => {
    expect(() => validateGuidedTaskResult(null)).toThrow(AiError);
    expect(() => validateGuidedTaskResult('invalid json string')).toThrow(AiError);
    expect(() => validateGuidedTaskResult(12345)).toThrow(AiError);
  });

  it('throws validation error if steps is not an array or is missing', () => {
    expect(() => validateGuidedTaskResult({ task: 'Test task' })).toThrow(AiError);
    expect(() => validateGuidedTaskResult({ task: 'Test task', steps: 'step 1' })).toThrow(AiError);
  });

  it('throws validation error if steps array is empty', () => {
    expect(() => validateGuidedTaskResult({ task: 'Test task', steps: [] })).toThrow(AiError);
    expect(() => validateGuidedTaskResult({ task: 'Test task', steps: ['', '   '] })).toThrow(AiError);
  });

  it('sanitizes HTML and script tags from steps and notes', () => {
    const rawData = {
      task: '<script>alert(1)</script>Pay bill',
      steps: [
        '<b onclick="hack()">Step 1: Open website</b>',
        'Step 2: Enter number <img src="x" onerror="steal()"/>',
      ],
      safetyNotes: ['<a href="http://fake.com">Fake link</a>Be cautious'],
    };

    const result = validateGuidedTaskResult(rawData);
    expect(result.task).toBe('alert(1)Pay bill');
    expect(result.steps[0]).toBe('Step 1: Open website');
    expect(result.steps[1]).toBe('Step 2: Enter number');
    expect(result.safetyNotes[0]).toContain('Fake linkBe cautious');
  });

  it('enforces that Sahaayak does not claim external action completion', () => {
    const rawData = {
      task: 'Pay bill',
      steps: [
        'Sahaayak entered your OTP',
        'Sahaayak has paid the bill for you',
      ],
      safetyNotes: [],
    };

    const result = validateGuidedTaskResult(rawData);
    expect(result.steps[0]).not.toMatch(/Sahaayak entered/i);
    expect(result.steps[1]).not.toMatch(/Sahaayak has paid/i);
    expect(result.safetyNotes.some((n) => n.includes('official') || n.includes('yourself'))).toBe(true);
  });

  it('rejects empty input on breakIntoSteps', async () => {
    await expect(breakIntoSteps('')).rejects.toThrow('Task description cannot be empty');
    await expect(breakIntoSteps('   ')).rejects.toThrow('Task description cannot be empty');
  });

  it('rejects overly long prompt input over 2000 characters', async () => {
    const longInput = 'x'.repeat(2001);
    await expect(breakIntoSteps(longInput)).rejects.toThrow('Task description is too long');
  });
});
