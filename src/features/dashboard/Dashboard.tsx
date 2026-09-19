import React, { useState } from 'react';
import { PageContainer, Card, StatusBadge, Button, EmptyState } from '../../components/ui';
import { DailyItem } from '../../models';
import { mockDailyItems } from './mockData';
import { HelpCircle, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { BriefingResult } from '../../services/gemini';
import { saveReminderItem } from '../reminders/RemindersFeature';

interface DashboardProps {
  userName?: string;
  onExplain?: (item: DailyItem) => void;
  onHelpMeDo?: (item: DailyItem) => void;
  onViewReminders?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userName = 'Ravi',
  onExplain,
  onHelpMeDo,
  onViewReminders,
}) => {
  // Synchronously initialize mock items for instant render with zero delay or flicker
  const [data] = useState<BriefingResult>(() => ({
    greeting: `Good morning, ${userName}.\nI've prepared your day.`,
    items: mockDailyItems.slice(0, 3),
  }));
  const [remindedItemIds, setRemindedItemIds] = useState<Set<string>>(new Set());

  const [remindedAnnouncement, setRemindedAnnouncement] = useState('');

  const handleRemindItem = (item: DailyItem) => {
    saveReminderItem({
      title: item.title,
      category: item.category,
      reason: item.reason,
    });
    setRemindedItemIds((prev) => new Set(prev).add(item.id));
    setRemindedAnnouncement(`Reminder saved for: ${item.title}`);
  };

  if (!data || data.items.length === 0) {
    return <EmptyState title="You're all caught up!" message="There are no important tasks requiring your attention today." />;
  }

  return (
    <PageContainer>
      {remindedAnnouncement && (
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {remindedAnnouncement}
        </div>
      )}
      <div className="space-y-8">
        {/* Morning Greeting & Reassurance Banner */}
        <section
          aria-labelledby="today-greeting-heading"
          className="bg-gradient-to-r from-amber-100/70 via-orange-50/50 to-amber-50/40 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(40,30,20,0.03)] relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-300">
                Today's Priorities • Take Your Time
              </span>
              <h2 id="today-greeting-heading" className="text-3xl sm:text-4xl font-bold font-serif text-stone-950 whitespace-pre-line leading-tight" tabIndex={-1}>
                {data.greeting}
              </h2>
              <p className="text-lg text-stone-700 leading-relaxed font-medium">
                Here are {data.items.length} items requiring attention today. Sahaayak will assist you step by step whenever you're ready.
              </p>
            </div>
            {onViewReminders && (
              <Button
                variant="secondary"
                icon={Clock}
                onClick={onViewReminders}
                aria-label="View all saved reminders"
                className="!min-h-[48px] self-start sm:self-center shadow-xs"
              >
                View Reminders
              </Button>
            )}
          </div>
        </section>
        
        <section aria-labelledby="today-priorities-heading" className="space-y-6">
          <h3 id="today-priorities-heading" className="sr-only">
            Today's top priorities
          </h3>
          <ul className="space-y-6 list-none p-0 m-0" aria-label="Today's top priorities">
            {data.items.map((item) => (
              <li key={item.id}>
                <DashboardItem
                  item={item}
                  isReminded={remindedItemIds.has(item.id)}
                  onExplain={() => onExplain?.(item)}
                  onHelpMeDo={() => onHelpMeDo?.(item)}
                  onRemind={() => handleRemindItem(item)}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  );
};

interface DashboardItemProps {
  item: DailyItem;
  isReminded: boolean;
  onExplain: () => void;
  onHelpMeDo: () => void;
  onRemind: () => void;
}

const DashboardItem: React.FC<DashboardItemProps> = ({
  item,
  isReminded,
  onExplain,
  onHelpMeDo,
  onRemind,
}) => {
  const getBadgeStatus = (priority: string) => {
    if (priority === 'high') return 'warning';
    if (priority === 'medium') return 'info';
    return 'neutral';
  };

  return (
    <Card className="focus-within:ring-3 focus-within:ring-[#1E3A5F]/30 focus-within:ring-offset-2 border-stone-200/90 hover:border-amber-300/80 transition-colors">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={getBadgeStatus(item.priority)} label={item.category} />
            {isReminded && (
              <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                Reminder Saved
              </span>
            )}
          </div>
          {item.dueDate && (
            <span className="text-base sm:text-lg font-semibold text-stone-700 bg-stone-100 px-3.5 py-1 rounded-xl border border-stone-200">
              {item.dueDate}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mb-3">{item.title}</h3>
          <div className="space-y-3 bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200/80">
            <p className="text-lg sm:text-xl text-stone-800 leading-relaxed">
              <strong className="text-stone-950 font-bold block mb-1">Why it matters:</strong> 
              {item.reason}
            </p>
            <p className="text-lg sm:text-xl text-stone-800 leading-relaxed">
              <strong className="text-stone-950 font-bold block mb-1">Suggested action:</strong> 
              {item.suggestedAction}
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-3.5 border-t border-stone-200/80 mt-6">
          <Button
            variant="secondary"
            icon={HelpCircle}
            onClick={onExplain}
            aria-label={`Explain this: ${item.title}`}
          >
            Explain this
          </Button>
          <Button
            variant="primary"
            icon={PlayCircle}
            onClick={onHelpMeDo}
            aria-label={`Help me do this: ${item.title}`}
          >
            Help me do this
          </Button>
          <Button
            variant="back"
            icon={isReminded ? CheckCircle2 : Clock}
            onClick={onRemind}
            disabled={isReminded}
            aria-label={isReminded ? `Reminder already saved for ${item.title}` : `Remind me later about ${item.title}`}
            className={isReminded ? 'text-emerald-700 font-semibold' : ''}
          >
            {isReminded ? 'Reminded' : 'Remind me later'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
