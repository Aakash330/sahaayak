import { describe, it, expect } from 'vitest';
import { interpretVoiceCommand } from '../../services/voice/commandRouter';

describe('Voice Command Router & Interpretation', () => {
  it('maps "What do I need to do today?" to My Day experience (dashboard)', () => {
    const res = interpretVoiceCommand('What do I need to do today?');
    expect(res.targetView).toBe('dashboard');
    expect(res.label).toBe('My Day');
  });

  it('maps "what to do today" and "my schedule" to My Day experience', () => {
    const res1 = interpretVoiceCommand('What to do today');
    expect(res1.targetView).toBe('dashboard');

    const res2 = interpretVoiceCommand('Show my schedule');
    expect(res2.targetView).toBe('dashboard');
  });

  it('maps "Explain this message." to Understand experience', () => {
    const res = interpretVoiceCommand('Explain this message.');
    expect(res.targetView).toBe('understand');
    expect(res.label).toBe('Understand');
  });

  it('maps "what does this mean" and "simplify this text" to Understand experience', () => {
    const res1 = interpretVoiceCommand('What does this letter mean?');
    expect(res1.targetView).toBe('understand');

    const res2 = interpretVoiceCommand('Please simplify this confusing SMS');
    expect(res2.targetView).toBe('understand');
  });

  it('maps "Is this a scam?" and "suspicious message" to Check Scam experience', () => {
    const res1 = interpretVoiceCommand('Is this a scam?');
    expect(res1.targetView).toBe('safety');
    expect(res1.label).toBe('Check Scam');

    const res2 = interpretVoiceCommand('I got a suspicious warning message');
    expect(res2.targetView).toBe('safety');
  });

  it('maps "Help me pay my bill" and "Do it with me" to Guided Task experience', () => {
    const res1 = interpretVoiceCommand('Help me pay my electricity bill');
    expect(res1.targetView).toBe('guided');
    expect(res1.label).toBe('Do It With Me');

    const res2 = interpretVoiceCommand('Do it with me step by step');
    expect(res2.targetView).toBe('guided');
  });

  it('maps "Remind me to take my medicine" to Reminders experience', () => {
    const res = interpretVoiceCommand('Remind me to take my blood pressure tablet');
    expect(res.targetView).toBe('reminders');
    expect(res.label).toBe('Reminders');
  });

  it('provides a safe fallback view for unknown queries', () => {
    const res = interpretVoiceCommand('Hello assistant');
    expect(res.targetView).toBe('dashboard');
    expect(res.label).toBe('My Day');
  });
});
