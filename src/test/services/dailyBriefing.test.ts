import { describe, it, expect } from 'vitest';
import { validateBriefingResult } from '../../services/gemini/dailyBriefing';
import { DailyItem } from '../../models';

describe('Daily Briefing Gemini Validator', () => {
  const originalItems: DailyItem[] = [
    {
      id: 'item-1',
      title: 'Electricity bill',
      category: 'Bills',
      reason: 'Original reason',
      suggestedAction: 'Original action',
      priority: 'low',
      status: 'pending'
    }
  ];

  it('allows Gemini to update reason and action safely', () => {
    const aiResponse = {
      greeting: 'Good morning!',
      items: [
        {
          id: 'item-1',
          reason: 'Better summarized reason',
          suggestedAction: 'Clear action',
          priority: 'high'
        }
      ]
    };

    const result = validateBriefingResult(aiResponse, originalItems);
    
    expect(result.greeting).toBe('Good morning!');
    expect(result.items[0].reason).toBe('Better summarized reason');
    expect(result.items[0].suggestedAction).toBe('Clear action');
    expect(result.items[0].priority).toBe('high');
    
    // Original title and category should NOT be altered by AI
    expect(result.items[0].title).toBe('Electricity bill');
  });

  it('rejects hallucinated items invented by AI', () => {
    const aiResponse = {
      items: [
        {
          id: 'item-1',
          reason: 'Valid',
          suggestedAction: 'Valid',
          priority: 'high'
        },
        {
          id: 'fake-item-2', // AI invented this
          reason: 'Fake',
          suggestedAction: 'Fake',
          priority: 'high'
        }
      ]
    };

    const result = validateBriefingResult(aiResponse, originalItems);
    
    expect(result.items.length).toBe(1); // Invented item is dropped
    expect(result.items[0].id).toBe('item-1');
  });

  it('handles malformed AI response', () => {
    // Missing items array completely
    const aiResponse = {
      greeting: 'Hello'
    };

    const result = validateBriefingResult(aiResponse, originalItems);
    
    // Falls back to original items if items array is missing/malformed
    expect(result.items).toEqual(originalItems);
    expect(result.greeting).toBe('Hello');
  });

  it('reverts invalid priority to original', () => {
    const aiResponse = {
      items: [
        {
          id: 'item-1',
          reason: 'Valid',
          suggestedAction: 'Valid',
          priority: 'CRITICAL_RED_ALERT' // Invalid enum
        }
      ]
    };

    const result = validateBriefingResult(aiResponse, originalItems);
    
    // Reverts to 'low' from originalItems
    expect(result.items[0].priority).toBe('low');
  });
});
