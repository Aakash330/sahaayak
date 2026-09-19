/**
 * Reminders storage service for local client-side persistence
 */

export interface SavedReminder {
  id: string;
  title: string;
  category: string;
  reason: string;
  createdAt: string;
  completed?: boolean;
}

const STORAGE_KEY = 'sahaayak_saved_reminders';

export function getSavedReminders(): SavedReminder[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function updateSavedReminders(reminders: SavedReminder[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    // LocalStorage write fallback
  }
}

export function saveReminderItem(
  reminder: Omit<SavedReminder, 'id' | 'createdAt'>
): SavedReminder {
  const existing = getSavedReminders();
  const newReminder: SavedReminder = {
    ...reminder,
    id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    completed: false,
  };
  const updated = [newReminder, ...existing];
  updateSavedReminders(updated);
  return newReminder;
}
