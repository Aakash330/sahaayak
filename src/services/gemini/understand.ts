import { callGemini, AiError } from './client';

export interface UnderstandResult {
  simpleExplanation: string;
  importantDetails: string[];
  whatToDo: string[];
  warnings: string[];
}

/**
 * Sanitizes string to ensure safe plain text output and prevent HTML injection
 */
function sanitizePlainText(val: unknown): string {
  if (typeof val !== 'string') return '';
  // Strip any HTML tags to guarantee plain text
  return val.replace(/<[^>]*>?/gm, '').trim();
}

export function validateUnderstandResult(data: any): UnderstandResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => (typeof item === 'string' ? sanitizePlainText(item) : ''))
      .filter((item) => item.length > 0);
  };

  const explanation = sanitizePlainText(data.simpleExplanation);

  return {
    simpleExplanation: explanation || 'Could not generate an explanation.',
    importantDetails: safeArray(data.importantDetails),
    whatToDo: safeArray(data.whatToDo),
    warnings: safeArray(data.warnings),
  };
}

export async function explainMessage(text: string): Promise<UnderstandResult> {
  const trimmed = text ? text.trim() : '';
  if (!trimmed) {
    throw new AiError('Message text cannot be empty', 'validation');
  }

  if (trimmed.length > 2000) {
    throw new AiError('Message is too long. Please keep it under 2000 characters.', 'validation');
  }

  const systemInstruction = `
You are Sahaayak, a calm digital assistant helping a senior citizen understand a message.
Your task is to convert complicated SMS, emails, bills, notifications, or website messages into simple, plain language.

RULES & GUIDELINES:
- Use simple language.
- Avoid technical jargon.
- Preserve factual information accurately.
- Do not invent missing details.
- If information is unclear, explicitly say it is unclear.
- Do not give dangerous financial/legal/medical certainty.
- Encourage checking official sources when appropriate.
- Keep explanations short and scannable.
- Never ask for passwords, PINs, OTPs, or full card numbers.
- Output PLAIN TEXT ONLY inside the JSON fields. Never use HTML tags or Markdown headers.

Format strictly as JSON:
{
  "simpleExplanation": "short paragraph explanation",
  "importantDetails": ["detail 1", "detail 2"],
  "whatToDo": ["action 1", "action 2"],
  "warnings": ["warning 1 (if any, otherwise empty array)"]
}
  `.trim();

  return callGemini<UnderstandResult>(trimmed, systemInstruction, validateUnderstandResult);
}

export interface AnalyzedMessage {
  summary: string;
  actionRequired: boolean;
  safety: 'safe' | 'warning' | 'danger';
  nextSteps: string[];
}

export function validateAnalyzedMessage(data: any): AnalyzedMessage {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const validSafety = ['safe', 'warning', 'danger'];
  const safety = validSafety.includes(data.safety) ? data.safety : 'safe';

  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter((item) => typeof item === 'string' && item.trim().length > 0);
  };

  return {
    summary:
      typeof data.summary === 'string' && data.summary.trim()
        ? data.summary.trim()
        : 'No summary provided.',
    actionRequired: Boolean(data.actionRequired),
    safety: safety as 'safe' | 'warning' | 'danger',
    nextSteps: safeArray(data.nextSteps),
  };
}
