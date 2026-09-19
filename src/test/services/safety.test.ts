import { describe, it, expect } from 'vitest';
import {
  validateSafetyResult,
  checkSafety,
  SafetyCheckResult,
} from '../../services/gemini/safety';
import { AiError } from '../../services/gemini/client';

describe('Safety Service Validator & Security Directives', () => {
  it('validates a well-formed safety result and preserves fields', () => {
    const aiData = {
      assessment: 'Warning signs found in this urgent message.',
      warningSigns: [
        'Urgency: claims account will be suspended immediately',
        'Suspicious link: asks to visit an unverified website',
      ],
      safeActions: [
        'Contact the organization using the phone number or website you already know.',
        'Speak to a trusted family member.',
      ],
      avoidActions: [
        'Do not click the link.',
        'Never share any OTP or PIN.',
      ],
    };

    const result = validateSafetyResult(aiData);
    expect(result.assessment).toBe('Warning signs found in this urgent message.');
    expect(result.warningSigns).toHaveLength(2);
    expect(result.safeActions).toContain(
      'Contact the organization using the phone number or website you already know.'
    );
    expect(result.avoidActions).toContain('Do not click the link.');
  });

  it('replaces absolute claims of certainty with cautious language', () => {
    const rawData = {
      assessment: 'This is definitely a scam! Do not touch it.',
      warningSigns: ['Asks for money'],
      safeActions: [],
      avoidActions: [],
    };

    const result = validateSafetyResult(rawData);
    // Should NOT say "This is definitely a scam"
    expect(result.assessment).not.toMatch(/this is definitely a scam/i);
    expect(result.assessment).toContain('Warning signs found');
  });

  it('always ensures safe alternative "Contact the organization..." is present in safeActions', () => {
    const rawData = {
      assessment: 'Caution advised with unknown sender.',
      warningSigns: ['Unknown number'],
      safeActions: ['Wait for physical letter'],
      avoidActions: ['Do not reply'],
    };

    const result = validateSafetyResult(rawData);
    expect(
      result.safeActions.some((a) =>
        a.includes('Contact the organization using the phone number or website you already know.')
      )
    ).toBe(true);
  });

  it('provides safe fallback arrays if warningSigns, safeActions, or avoidActions are omitted', () => {
    const rawData = {
      assessment: '',
    };

    const result = validateSafetyResult(rawData);
    expect(result.assessment).toBe('Warning signs found. Please be cautious with this message.');
    expect(result.safeActions.length).toBeGreaterThan(0);
    expect(result.avoidActions.length).toBeGreaterThan(0);
    expect(result.avoidActions).toContain(
      'Never share any OTP, PIN, password, CVV, or banking credentials.'
    );
  });

  it('throws validation error if root is not an object', () => {
    expect(() => validateSafetyResult(null)).toThrow(AiError);
    expect(() => validateSafetyResult('scam')).toThrow(AiError);
  });

  it('strips HTML tags and sanitizes potential script injections from all fields', () => {
    const rawDataWithHtml = {
      assessment: '<script>alert(1)</script>Warning signs found',
      warningSigns: ['<b onmouseover="steal()">Urgent KYC link</b>'],
      safeActions: ['<a href="http://evil.com">Click to protect</a>'],
      avoidActions: ['<img src="x" onerror="evil()"/>Avoid sharing OTP'],
    };

    const result = validateSafetyResult(rawDataWithHtml);
    expect(result.assessment).toBe('alert(1)Warning signs found');
    expect(result.warningSigns[0]).toBe('Urgent KYC link');
    expect(result.safeActions[0]).toBe('Click to protect');
    expect(result.avoidActions[0]).toBe('Avoid sharing OTP');
  });

  it('rejects empty input with validation error', async () => {
    await expect(checkSafety('')).rejects.toThrow('Message text cannot be empty');
    await expect(checkSafety('   ')).rejects.toThrow('Message text cannot be empty');
  });

  it('rejects input exceeding 2000 characters with validation error', async () => {
    const longMessage = 'a'.repeat(2001);
    await expect(checkSafety(longMessage)).rejects.toThrow(
      'Message is too long. Please keep it under 2000 characters.'
    );
  });
});
