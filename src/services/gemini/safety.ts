import { callGemini, AiError } from './client';

export interface SafetyCheckResult {
  assessment: string;
  warningSigns: string[];
  safeActions: string[];
  avoidActions: string[];
}

/**
 * Sanitizes plain text by removing any HTML tags or script injection attempts
 */
function sanitizePlainText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Ensures system never claims 100% certainty (e.g. replaces "This is definitely a scam" with cautious language)
 */
function enforceCautiousLanguage(text: string): string {
  let cleaned = sanitizePlainText(text);
  cleaned = cleaned.replace(/this is (definitely|certainly|100%) a scam/gi, 'Warning signs found');
  cleaned = cleaned.replace(/is definitely a scam/gi, 'has strong warning signs');
  if (!cleaned) {
    cleaned = 'Warning signs found. Please be cautious with this message.';
  }
  return cleaned;
}

export function validateSafetyResult(data: any): SafetyCheckResult {
  if (!data || typeof data !== 'object') {
    throw new AiError('Response is not an object', 'validation');
  }

  const safeArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => (typeof item === 'string' ? sanitizePlainText(item) : ''))
      .filter((item) => item.length > 0);
  };

  const rawAssessment = typeof data.assessment === 'string' ? data.assessment : (typeof data.summaryTitle === 'string' ? data.summaryTitle : '');
  const assessment = enforceCautiousLanguage(rawAssessment);

  const rawWarningSigns = Array.isArray(data.warningSigns) ? data.warningSigns : (Array.isArray(data.warningFlags) ? data.warningFlags : []);
  const warningSigns = safeArray(rawWarningSigns);

  const defaultSafeActions = [
    'Contact the organization using the phone number or website you already know.',
    'Ask a trusted family member or friend to review this message with you.',
  ];

  const defaultAvoidActions = [
    'Never share any OTP, PIN, password, CVV, or banking credentials.',
    'Do not click on links or call numbers provided in the suspicious message.',
    'Do not transfer money or install any app or APK file.',
  ];

  const rawSafeActions = Array.isArray(data.safeActions) ? data.safeActions : [];
  const rawAvoidActions = Array.isArray(data.avoidActions) ? data.avoidActions : (Array.isArray(data.neverDo) ? data.neverDo : []);

  let safeActions = safeArray(rawSafeActions);
  if (safeActions.length === 0) {
    safeActions = defaultSafeActions;
  } else {
    // Ensure safe alternative is always present
    const hasContactOfficial = safeActions.some((a) =>
      a.toLowerCase().includes('contact') || a.toLowerCase().includes('official')
    );
    if (!hasContactOfficial) {
      safeActions.push('Contact the organization using the phone number or website you already know.');
    }
  }

  let avoidActions = safeArray(rawAvoidActions);
  if (avoidActions.length === 0) {
    avoidActions = defaultAvoidActions;
  }

  return {
    assessment,
    warningSigns,
    safeActions,
    avoidActions,
  };
}

export async function checkSafety(messageText: string): Promise<SafetyCheckResult> {
  const trimmed = messageText ? messageText.trim() : '';
  if (!trimmed) {
    throw new AiError('Message text cannot be empty', 'validation');
  }

  if (trimmed.length > 2000) {
    throw new AiError('Message is too long. Please keep it under 2000 characters.', 'validation');
  }

  const systemInstruction = `
You are Sahaayak's Senior Safety Assistant helping seniors identify warning signs in suspicious messages, SMS, emails, or phone calls.

GOAL:
Help seniors identify warning signs in suspicious messages (such as "Your bank account will be blocked today. Click this link immediately...").

IMPORTANT LANGUAGE RULES:
- The system should NOT say: "This is definitely a scam."
- Instead, use cautious language such as: "Warning signs found" or "Caution advised".
- NEVER claim 100% certainty.
- Always provide a safe alternative such as: "Contact the organization using the phone number or website you already know."

POSSIBLE WARNING SIGNS TO CHECK FOR:
- urgency (e.g. "act in 24 hours", "power cut tonight")
- pressure
- suspicious request for credentials
- unusual payment request
- unknown sender
- suspicious link
- request for OTP/PIN/password

NEVER ask the user to enter:
- OTP
- PIN
- password
- CVV
- full card number
- banking credentials

OUTPUT FORMAT:
Respond with strictly valid JSON only:
{
  "assessment": "Cautious summary statement, e.g. 'Warning signs found in this message.'",
  "warningSigns": [
    "Urgency: claims account will be blocked immediately",
    "Suspicious link: asks to click an unverified website link"
  ],
  "safeActions": [
    "Contact the organization using the phone number or website you already know.",
    "Show this message to a family member or trusted friend."
  ],
  "avoidActions": [
    "Do not click the link in the message.",
    "Never share any OTP, PIN, password, or card CVV."
  ]
}
  `.trim();

  return callGemini<SafetyCheckResult>(trimmed, systemInstruction, validateSafetyResult);
}
