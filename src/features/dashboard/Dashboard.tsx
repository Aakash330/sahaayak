import React, { useState, useEffect } from 'react';
import { PageContainer, Card, StatusBadge, Button, LoadingState, ErrorState, EmptyState } from '../../components/ui';
import { DailyItem } from '../../models';
import { mockDailyItems } from './mockData';
import { HelpCircle, PlayCircle, Clock } from 'lucide-react';
import { generateDailyBriefing, BriefingResult } from '../../services/gemini';

export const Dashboard: React.FC<{ userName?: string }> = ({ userName = 'Ravi' }) => {
  const [data, setData] = useState<BriefingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadBriefing = async () => {
      try {
        setLoading(true);
        // We use mock data immediately for reliability.
        // In a real flow we could pass real fetched items to generateDailyBriefing.
        setData({
          greeting: `Good morning, ${userName}.\nI've prepared your day.`,
          items: mockDailyItems.slice(0, 3)
        });
        setLoading(false);
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    
    loadBriefing();
    return () => { mounted = false; };
  }, [userName]);

  if (loading) return <LoadingState message="Preparing your day..." />;
  if (error) return <ErrorState message="Could not load your daily tasks." onRetry={() => window.location.reload()} />;
  if (!data || data.items.length === 0) {
    return <EmptyState title="You're all caught up!" message="There are no important tasks requiring your attention today." />;
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-stone-900 whitespace-pre-line" tabIndex={-1}>
          {data.greeting}
        </h2>
        
        <div className="space-y-6" role="list" aria-label="Today's top priorities">
          {data.items.map((item) => (
            <DashboardItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

const DashboardItem: React.FC<{ item: DailyItem }> = ({ item }) => {
  const getBadgeStatus = (priority: string) => {
    if (priority === 'high') return 'warning';
    if (priority === 'medium') return 'info';
    return 'neutral';
  };

  return (
    <Card role="listitem" className="focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={getBadgeStatus(item.priority)} label={item.category} />
          {item.dueDate && (
            <span className="text-lg font-medium text-stone-600">{item.dueDate}</span>
          )}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-stone-900 mb-4">{item.title}</h3>
          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
            <p className="text-lg text-stone-800">
              <strong className="text-stone-900 font-semibold block mb-1">Why it matters:</strong> 
              {item.reason}
            </p>
            <p className="text-lg text-stone-800">
              <strong className="text-stone-900 font-semibold block mb-1">Suggested action:</strong> 
              {item.suggestedAction}
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap gap-4 border-t border-stone-200 mt-6">
          <Button variant="secondary" icon={HelpCircle}>Explain this</Button>
          <Button variant="primary" icon={PlayCircle}>Help me do this</Button>
          <Button variant="back" icon={Clock}>Remind me later</Button>
        </div>
      </div>
    </Card>
  );
};
