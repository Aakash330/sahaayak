import { callGemini, AiError } from './client';

export interface UnderstandResult {
  simpleExplanation: string;
  importantDetails: string[];
  whatToDo: string[];
  warnings: string[];
}

export function validateUnderstandResult(data: any): UnderstandResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }
  
  const safeString = (val: any) => typeof val === 'string' ? val.trim() : '';
  const safeArray = (arr: any) => Array.isArray(arr) ? arr.map(safeString).filter(Boolean) : [];

  return {
    simpleExplanation: safeString(data.simpleExplanation) || 'Could not generate an explanation.',
    importantDetails: safeArray(data.importantDetails),
    whatToDo: safeArray(data.whatToDo),
    warnings: safeArray(data.warnings),
  };
}

export async function explainMessage(text: string): Promise<UnderstandResult> {
  const systemInstruction = `
You are Sahaayak, a calm digital assistant helping a senior citizen understand a message.
Your task is to convert complicated SMS, emails, bills, or notifications into simple language.

RULES:
- Use simple language. Avoid technical jargon.
- Preserve factual information accurately.
- NEVER invent missing details.
- If information is unclear, explicitly say it is unclear.
- Do not give dangerous financial, legal, or medical certainty.
- Encourage checking official sources when appropriate.
- Do not ask for passwords, PINs, OTPs, or full card numbers.

Format strictly as JSON:
{
  "simpleExplanation": "short paragraph",
  "importantDetails": ["detail 1", "detail 2"],
  "whatToDo": ["step 1", "step 2"],
  "warnings": ["warning 1 (if any, otherwise empty array)"]
}
  `.trim();

  return callGemini<UnderstandResult>(text, systemInstruction, validateUnderstandResult);
}
