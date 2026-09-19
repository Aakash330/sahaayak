import { callGemini, AiError } from './client';
import { sanitizePlainText, safeStringArray, MAX_INPUT_LENGTH } from '../../utils/sanitize';

export interface UnderstandResult {
  simpleExplanation: string;
  importantDetails: string[];
  whatToDo: string[];
  warnings: string[];
}

export function validateUnderstandResult(data: unknown): UnderstandResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const record = data as Record<string, unknown>;
  const explanation = sanitizePlainText(record.simpleExplanation);

  return {
    simpleExplanation: explanation || 'Could not generate an explanation.',
    importantDetails: safeStringArray(record.importantDetails),
    whatToDo: safeStringArray(record.whatToDo),
    warnings: safeStringArray(record.warnings),
  };
}

export async function explainMessage(text: string): Promise<UnderstandResult> {
  const trimmed = text ? text.trim() : '';
  if (!trimmed) {
    throw new AiError('Message text cannot be empty', 'validation');
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new AiError(`Message is too long. Please keep it under ${MAX_INPUT_LENGTH} characters.`, 'validation');
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

export function validateAnalyzedMessage(data: unknown): AnalyzedMessage {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const record = data as Record<string, unknown>;
  const validSafety = ['safe', 'warning', 'danger'];
  const safety = typeof record.safety === 'string' && validSafety.includes(record.safety)
    ? record.safety
    : 'safe';

  return {
    summary:
      typeof record.summary === 'string' && record.summary.trim()
        ? record.summary.trim()
        : 'No summary provided.',
    actionRequired: Boolean(record.actionRequired),
    safety: safety as 'safe' | 'warning' | 'danger',
    nextSteps: safeStringArray(record.nextSteps),
  };
}

