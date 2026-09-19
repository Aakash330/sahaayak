import { callGemini, AiError } from './client';

export interface GuidedTaskResult {
  task: string;
  steps: string[];
  safetyNotes: string[];
  title?: string;
}

/**
 * Sanitizes plain text by removing any HTML tags or script injection attempts
 */
function sanitizePlainText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Ensures system never claims it performed external actions like entering OTP, making payment, etc.
 */
function sanitizeStepInstruction(text: string): string {
  let cleaned = sanitizePlainText(text);
  cleaned = cleaned.replace(/Sahaayak (has )?(entered|paid|submitted|completed)/gi, 'You can now enter');
  cleaned = cleaned.replace(/we have (made the payment|entered your (otp|pin|password))/gi, 'Please complete the payment on the official screen');
  return cleaned;
}

export function validateGuidedTaskResult(data: any): GuidedTaskResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const rawTask = typeof data.task === 'string' ? data.task : (typeof data.title === 'string' ? data.title : '');
  const task = sanitizePlainText(rawTask) || 'Guided Task';

  if (!Array.isArray(data.steps)) {
    throw new AiError('Steps must be an array', 'validation');
  }

  const steps: string[] = data.steps
    .map((item: any) => {
      if (typeof item === 'string') {
        return sanitizeStepInstruction(item);
      }
      if (typeof item === 'object' && item !== null) {
        return sanitizeStepInstruction(item.instruction || item.step || item.text || '');
      }
      return '';
    })
    .filter((s: string) => s.length > 0);

  if (steps.length === 0) {
    throw new AiError('Task must contain at least one step', 'validation');
  }

  const defaultSafetyNotes = [
    'Sahaayak guides you step-by-step, but you perform the real actions yourself on the official website or app.',
    'Never share your OTP, PIN, password, CVV, or banking credentials with anyone.',
    'Sahaayak will never enter passwords or make payments on your behalf.',
  ];

  let rawSafetyNotes: string[] = [];
  if (Array.isArray(data.safetyNotes)) {
    rawSafetyNotes = data.safetyNotes
      .map((item: any) => (typeof item === 'string' ? sanitizePlainText(item) : ''))
      .filter((item: string) => item.length > 0);
  }

  const safetyNotes = rawSafetyNotes.length > 0 ? rawSafetyNotes : defaultSafetyNotes;

  const hasExternalActionDisclaimer = safetyNotes.some((note) =>
    note.toLowerCase().includes('official') || note.toLowerCase().includes('yourself')
  );
  if (!hasExternalActionDisclaimer) {
    safetyNotes.push('You perform the real actions yourself on the official website or counter.');
  }

  return {
    task,
    steps,
    safetyNotes,
    title: task,
  };
}

export async function breakIntoSteps(taskDescription: string): Promise<GuidedTaskResult> {
  const trimmed = taskDescription ? taskDescription.trim() : '';
  if (!trimmed) {
    throw new AiError('Task description cannot be empty', 'validation');
  }

  if (trimmed.length > 2000) {
    throw new AiError('Task description is too long. Please keep it under 2000 characters.', 'validation');
  }

  const systemInstruction = `
You are Sahaayak's "Do It With Me" Guide for senior citizens.
Your mission is to help seniors accomplish everyday digital and physical tasks by breaking them into calm, sequential, bite-sized steps.

THE SENIOR SHOULD NEVER RECEIVE A HUGE PARAGRAPH OF INSTRUCTIONS.
Break the task into 3 to 6 short, discrete steps.

EXAMPLE:
Task: "Pay my electricity bill"
Steps:
1. Open your electricity provider's official website or app.
2. Look for "Bill Payment".
3. Enter the bill number shown on your bill.
4. Review the amount before making the payment.

IMPORTANT SECURITY RULES:
- Sahaayak must guide the user but NEVER pretend it has performed an external action.
- You must NOT claim to enter OTP, enter PIN, enter password, make payment, or submit banking transactions.
- The user performs the real action.
- Always include helpful safety notes reminding the user that they perform every transaction themselves and never to share credentials.

OUTPUT FORMAT:
Respond with strictly valid JSON only:
{
  "task": "Title of the task",
  "steps": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "safetyNotes": [
    "Never share OTP, PIN, or password with anyone.",
    "Review the payment details carefully on the official portal before confirming."
  ]
}
  `.trim();

  return callGemini<GuidedTaskResult>(trimmed, systemInstruction, validateGuidedTaskResult);
}
