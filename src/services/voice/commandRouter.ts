export type AppView = 'dashboard' | 'understand' | 'safety' | 'guided' | 'voice' | 'reminders';

export interface CommandInterpretation {
  targetView: AppView;
  label: string;
  matchedReason: string;
  spokenFeedback: string;
}

/**
 * Interprets a spoken or typed senior query and maps it to the appropriate feature.
 * Voice must never be the only way: this handles both voice transcripts and typed text.
 */
export function interpretVoiceCommand(query: string): CommandInterpretation {
  const lower = query.toLowerCase().trim();

  // "What do I need to do today?" -> Map to My Day experience
  if (
    lower.includes('today') ||
    lower.includes('my day') ||
    lower.includes('what do i need to do') ||
    lower.includes('what to do') ||
    lower.includes('schedule') ||
    lower.includes('agenda') ||
    lower.includes('routine')
  ) {
    return {
      targetView: 'dashboard',
      label: 'My Day',
      matchedReason: 'Opening your daily overview and priorities.',
      spokenFeedback: 'Taking you to My Day to see what to do today.',
    };
  }

  // "Explain this message." -> Open Understand experience
  if (
    lower.includes('explain') ||
    lower.includes('understand') ||
    lower.includes('mean') ||
    lower.includes('simplify') ||
    lower.includes('read message') ||
    lower.includes('confusing') ||
    lower.includes('clarify') ||
    lower.includes('break down') ||
    lower.includes('what does this') ||
    lower.includes('what is this')
  ) {
    return {
      targetView: 'understand',
      label: 'Understand',
      matchedReason: 'Opening Understand to explain your message in simple words.',
      spokenFeedback: 'Opening Understand so you can easily simplify any message.',
    };
  }

  // "Is this a scam?" / "Check this message" -> Safety experience
  if (
    lower.includes('scam') ||
    lower.includes('suspicious') ||
    lower.includes('fraud') ||
    lower.includes('safe') ||
    lower.includes('safety') ||
    lower.includes('warning') ||
    lower.includes('fake') ||
    lower.includes('block') ||
    lower.includes('urgent') ||
    lower.includes('phishing')
  ) {
    return {
      targetView: 'safety',
      label: 'Check Scam',
      matchedReason: 'Opening Scam Checker to safely look for warning signs.',
      spokenFeedback: 'Opening Scam Checker to review any suspicious message safely.',
    };
  }

  // "Help me pay my bill" / "Do it with me" -> Guided Task
  if (
    lower.includes('do it with me') ||
    lower.includes('do with me') ||
    lower.includes('guided') ||
    lower.includes('step by step') ||
    lower.includes('steps') ||
    lower.includes('pay') ||
    lower.includes('bill') ||
    lower.includes('help me do') ||
    lower.includes('how do i') ||
    lower.includes('walk me through')
  ) {
    return {
      targetView: 'guided',
      label: 'Do It With Me',
      matchedReason: 'Opening step-by-step guidance for your task.',
      spokenFeedback: 'Opening Do It With Me to guide you calmly step by step.',
    };
  }

  // "Reminders" / "Medication"
  if (
    lower.includes('remind') ||
    lower.includes('medicine') ||
    lower.includes('pill') ||
    lower.includes('tablet') ||
    lower.includes('water') ||
    lower.includes('alarm') ||
    lower.includes('doctor')
  ) {
    return {
      targetView: 'reminders',
      label: 'Reminders',
      matchedReason: 'Opening your medication and hydration reminders.',
      spokenFeedback: 'Opening your reminders.',
    };
  }

  // General fallback
  return {
    targetView: 'dashboard',
    label: 'My Day',
    matchedReason: 'Opening My Day to help with: ' + query,
    spokenFeedback: 'Here is your My Day companion.',
  };
}
