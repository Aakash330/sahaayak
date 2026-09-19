import { callGemini, AiError } from './client';
import { DailyItem, Priority } from '../../models';

export interface BriefingResult {
  greeting: string;
  items: DailyItem[];
}

export function validateBriefingResult(data: any, originalItems: DailyItem[]): BriefingResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Invalid response format', 'validation');
  }
  
  const greeting = typeof data.greeting === 'string' ? data.greeting : 'Good morning. I have prepared your day.';
  
  const items = Array.isArray(data.items) ? data.items.map((item: any) => {
    // SECURITY: Ensure we don't allow Gemini to invent items.
    // We strictly match the returned IDs against our original input IDs.
    const original = originalItems.find(o => o.id === item.id);
    if (!original) return null; // Reject invented items entirely

    // Safely parse priority enum
    let priority: Priority = original.priority;
    if (['high', 'medium', 'low'].includes(item.priority)) {
      priority = item.priority;
    }
    
    // We only allow Gemini to update 'reason' and 'suggestedAction' based on its summary
    return {
      ...original,
      reason: typeof item.reason === 'string' ? item.reason : original.reason,
      suggestedAction: typeof item.suggestedAction === 'string' ? item.suggestedAction : original.suggestedAction,
      priority,
    };
  }).filter(Boolean) as DailyItem[] : originalItems;

  // Do not overwhelm the user - cap at 3 items
  return { greeting, items: items.slice(0, 3) };
}

export async function generateDailyBriefing(name: string, rawItems: DailyItem[]): Promise<BriefingResult> {
  const systemInstruction = `
You are Sahaayak, a calm digital assistant for seniors.
Your task is to summarize the user's daily tasks.

CRITICAL RULE: NEVER invent appointments, dates, amounts, people, bills, or deadlines.
Only use the exact information provided in the input JSON. Do not add any external information or hallucinations.

Format a friendly, calm greeting.
Summarize the 'reason' (Why it matters) and 'suggestedAction' (What to do) for each item concisely.
Prioritize them based on urgency (high, medium, low).

Output JSON exactly in this structure:
{
  "greeting": "Good morning, [Name]. I've prepared your day.",
  "items": [
    {
      "id": "string (MUST EXACTLY MATCH AN ID FROM INPUT)",
      "reason": "short string summarizing why it matters",
      "suggestedAction": "short string summarizing what to do next",
      "priority": "high | medium | low"
    }
  ]
}
  `.trim();

  // Strip out UI-specific fields to save tokens and prevent Gemini confusion
  const inputContext = rawItems.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    reason: item.reason,
    dueDate: item.dueDate,
  }));

  const prompt = `Name: ${name}\nInput Tasks to Summarize:\n${JSON.stringify(inputContext, null, 2)}`;
  
  return callGemini<BriefingResult>(prompt, systemInstruction, (data) => validateBriefingResult(data, rawItems));
}
