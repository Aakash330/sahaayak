import { useState, useCallback } from 'react';
import {
  SavedReminder,
  getSavedReminders,
  updateSavedReminders,
} from '../../services/reminders/remindersStorage';

export function useReminders() {
  const [reminders, setReminders] = useState<SavedReminder[]>(() => getSavedReminders());

  const refreshReminders = useCallback(() => {
    setReminders(getSavedReminders());
  }, []);

  const handleToggleDone = useCallback((id: string) => {
    setReminders((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      );
      updateSavedReminders(updated);
      return updated;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setReminders((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      updateSavedReminders(updated);
      return updated;
    });
  }, []);

  const handleClearAllCompleted = useCallback(() => {
    setReminders((prev) => {
      const updated = prev.filter((r) => !r.completed);
      updateSavedReminders(updated);
      return updated;
    });
  }, []);

  const activeCount = reminders.filter((r) => !r.completed).length;
  const completedCount = reminders.length - activeCount;

  return {
    reminders,
    activeCount,
    completedCount,
    handleToggleDone,
    handleDelete,
    handleClearAllCompleted,
    refreshReminders,
  };
}
