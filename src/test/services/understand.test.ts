import { describe, it, expect, vi } from 'vitest';
import {
  validateUnderstandResult,
  explainMessage,
} from '../../services/gemini/understand';
import { AiError } from '../../services/gemini/client';
import * as clientModule from '../../services/gemini/client';

describe('Understand Service: Validator & Security', () => {
  // 1. Valid response
  it('handles valid explanation data correctly', () => {
    const aiResponse = {
      simpleExplanation: 'This is a test explanation.',
      importantDetails: ['Detail 1'],
      whatToDo: ['Step 1'],
      warnings: ['Warning 1'],
    };

    const result = validateUnderstandResult(aiResponse);
    expect(result).toEqual(aiResponse);
  });

  // 2. Malformed / Empty response handling
  it('provides safe defensive defaults for missing fields or malformed data', () => {
    const aiResponse = {};
    const result = validateUnderstandResult(aiResponse);

    expect(result.simpleExplanation).toBe('Could not generate an explanation.');
    expect(result.importantDetails).toEqual([]);
    expect(result.whatToDo).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('throws validation error if root is not an object or null', () => {
    expect(() => validateUnderstandResult(null)).toThrow(AiError);
    expect(() => validateUnderstandResult('just a string')).toThrow(AiError);
    expect(() => validateUnderstandResult(123)).toThrow(AiError);
  });

  it('safely filters invalid array items (e.g. nested objects or numbers)', () => {
    const aiResponse = {
      importantDetails: ['Valid detail', 123, { bad: 'data' }, 'Another valid'],
    };

    const result = validateUnderstandResult(aiResponse);
    expect(result.importantDetails).toEqual(['Valid detail', 'Another valid']);
  });

  // 3. XSS and HTML stripping
  it('strips HTML tags and sanitizes output to plain text', () => {
    const aiResponseWithHtml = {
      simpleExplanation: '<b>Important:</b> <script>alert("xss")</script>Please pay bill.',
      importantDetails: ['<img src="x" onerror="evil()"/>Due date 24 Sept'],
      whatToDo: ['<a href="javascript:steal()">Click here</a>Pay online'],
      warnings: ['<iframe src="malicious.site"></iframe>Beware of scam calls'],
    };

    const result = validateUnderstandResult(aiResponseWithHtml);

    expect(result.simpleExplanation).toBe('Important: alert("xss")Please pay bill.');
    expect(result.importantDetails[0]).toBe('Due date 24 Sept');
    expect(result.whatToDo[0]).toBe('Click herePay online');
    expect(result.warnings[0]).toBe('Beware of scam calls');
  });

  // 4. Input constraints (empty input & long input)
  it('rejects empty input with validation error', async () => {
    await expect(explainMessage('')).rejects.toThrow('Message text cannot be empty');
    await expect(explainMessage('   ')).rejects.toThrow('Message text cannot be empty');
  });

  it('rejects inputs longer than 2000 characters', async () => {
    const veryLongInput = 'a'.repeat(2001);
    await expect(explainMessage(veryLongInput)).rejects.toThrow(
      'Message is too long. Please keep it under 2000 characters.'
    );
  });
});
