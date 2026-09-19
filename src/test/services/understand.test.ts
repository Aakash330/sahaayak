import { describe, it, expect, vi } from 'vitest';
import { validateUnderstandResult } from '../../src/services/gemini/understand';
import { AiError } from '../../src/services/gemini/client';

describe('Understand Service Gemini Validator', () => {
  it('handles valid explanation data', () => {
    const aiResponse = {
      simpleExplanation: 'This is a test.',
      importantDetails: ['Detail 1'],
      whatToDo: ['Step 1'],
      warnings: ['Warning 1']
    };

    const result = validateUnderstandResult(aiResponse);
    expect(result).toEqual(aiResponse);
  });

  it('provides safe defaults for missing fields', () => {
    const aiResponse = {};
    const result = validateUnderstandResult(aiResponse);
    
    expect(result.simpleExplanation).toBe('Could not generate an explanation.');
    expect(result.importantDetails).toEqual([]);
    expect(result.whatToDo).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('safely filters invalid array items (e.g. nested objects or numbers)', () => {
    const aiResponse = {
      importantDetails: ['Valid detail', 123, { bad: 'data' }, 'Another valid'],
    };
    
    const result = validateUnderstandResult(aiResponse);
    expect(result.importantDetails).toEqual(['Valid detail', 'Another valid']);
  });

  it('throws validation error if root is not an object', () => {
    expect(() => validateUnderstandResult(null)).toThrow(AiError);
    expect(() => validateUnderstandResult('just a string')).toThrow(AiError);
  });
});
