import React from 'react';
import { PageContainer, Card, Button, EmptyState } from '../../components/ui';
import { Clock, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '../../utils';
import { useReminders } from './useReminders';

export {
  type SavedReminder,
  getSavedReminders,
  saveReminderItem,
} from '../../services/reminders/remindersStorage';

export const RemindersFeature: React.FC<{
  onStartTask?: (taskTitle: string) => void;
}> = ({ onStartTask }) => {
  const {
    reminders,
    activeCount,
    completedCount,
    handleToggleDone,
    handleDelete,
    handleClearAllCompleted,
  } = useReminders();

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 shadow-2xs" aria-hidden="true">
              <Clock className="w-8 h-8 text-[#1E3A5F]" />
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-950">
                Your Saved Reminders
              </h2>
              <p className="text-lg sm:text-xl text-stone-700 font-medium">
                Things you postponed to attend to at a more comfortable time.
              </p>
            </div>
          </div>
        </header>

        {reminders.length === 0 ? (
          <EmptyState
            title="No pending reminders"
            message="When you click 'Remind me later' on any task in My Day, it will appear here so you never forget it."
          />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-stone-700 font-semibold text-lg">
                {reminders.filter((r) => !r.completed).length} active reminder(s)
              </span>
              {reminders.some((r) => r.completed) && (
                <button
                  type="button"
                  onClick={handleClearAllCompleted}
                  className="text-stone-600 hover:text-stone-900 text-base font-medium underline cursor-pointer"
                >
                  Clear completed
                </button>
              )}
            </div>

            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className={`transition-all p-5 sm:p-6 rounded-2xl ${
                    reminder.completed
                      ? 'bg-stone-100/70 border-stone-200 opacity-75'
                      : 'bg-white border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleDone(reminder.id)}
                        className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer shrink-0 ${
                          reminder.completed
                            ? 'bg-emerald-700 border-emerald-800 text-white shadow-2xs'
                            : 'border-stone-400 bg-stone-50 hover:border-emerald-700 hover:bg-emerald-50/50'
                        }`}
                        aria-label={reminder.completed ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {reminder.completed && <CheckCircle2 className="w-6 h-6" />}
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                            {reminder.category}
                          </span>
                          <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(new Date(reminder.createdAt))}
                          </span>
                        </div>
                        <h3
                          className={`text-xl sm:text-2xl font-bold font-serif ${
                            reminder.completed
                              ? 'line-through text-stone-500'
                              : 'text-stone-950'
                          }`}
                        >
                          {reminder.title}
                        </h3>
                        {reminder.reason && (
                          <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-sans">{reminder.reason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onStartTask && !reminder.completed && (
                        <Button
                          variant="secondary"
                          onClick={() => onStartTask(reminder.title)}
                          className="!min-h-[44px] !py-2 !px-4 text-base font-bold shadow-2xs"
                        >
                          Do Now
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(reminder.id)}
                        className="p-2.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        aria-label="Delete reminder"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
