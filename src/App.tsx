import { useState } from 'react';
import { TextSizeProvider } from './accessibility/TextSizeContext';
import { AppShell } from './components/ui';
import { Dashboard } from './features/dashboard/Dashboard';
import { UnderstandFeature } from './features/understand/UnderstandFeature';
import { SafetyFeature } from './features/safety/SafetyFeature';
import { GuidedTask } from './features/guided-task/GuidedTask';
import { VoiceFeature } from './features/voice/VoiceFeature';
import { RemindersFeature } from './features/reminders/RemindersFeature';
import { DailyItem } from './models';
import {
  Sun,
  BookOpen,
  ShieldAlert,
  ListOrdered,
  Volume2,
  Clock,
} from 'lucide-react';

export type AppView =
  | 'dashboard'
  | 'understand'
  | 'safety'
  | 'guided'
  | 'voice'
  | 'reminders';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [understandInitialText, setUnderstandInitialText] = useState('');
  const [guidedInitialTask, setGuidedInitialTask] = useState('');

  // Navigation handlers
  const handleExplainFromDashboard = (item: DailyItem) => {
    setUnderstandInitialText(`${item.title}\n\nContext: ${item.reason}\nSuggested: ${item.suggestedAction}`);
    setCurrentView('understand');
  };

  const handleHelpMeDoFromDashboard = (item: DailyItem) => {
    setGuidedInitialTask(`${item.title} — ${item.suggestedAction}`);
    setCurrentView('guided');
  };

  const handleHelpMeDoFromUnderstand = (taskSummary: string) => {
    setGuidedInitialTask(taskSummary);
    setCurrentView('guided');
  };

  const handleStartTaskFromReminders = (taskTitle: string) => {
    setGuidedInitialTask(taskTitle);
    setCurrentView('guided');
  };

  const navItems = [
    { id: 'dashboard' as AppView, label: 'My Day', icon: Sun },
    { id: 'understand' as AppView, label: 'Understand', icon: BookOpen },
    { id: 'safety' as AppView, label: 'Check Scam', icon: ShieldAlert },
    { id: 'guided' as AppView, label: 'Do With Me', icon: ListOrdered },
    { id: 'voice' as AppView, label: 'Listen Aloud', icon: Volume2 },
    { id: 'reminders' as AppView, label: 'Reminders', icon: Clock },
  ];

  return (
    <TextSizeProvider>
      <AppShell>
        {/* Accessible Primary Navigation Bar */}
        <nav
          aria-label="Main App Modes"
          className="bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/90 px-3 py-3 sticky top-[69px] z-10 shadow-[0_2px_8px_rgba(40,30,20,0.02)]"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto py-1 no-scrollbar">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[48px] px-4 sm:px-5 py-2.5 rounded-2xl font-semibold text-base sm:text-lg flex items-center gap-2.5 transition-all whitespace-nowrap cursor-pointer shrink-0 border-2 ${
                    isActive
                      ? 'bg-[#1E3A5F] border-[#13253D] text-white shadow-md ring-2 ring-amber-400/40'
                      : 'bg-white border-stone-200/90 text-stone-800 hover:bg-amber-50/70 hover:border-amber-300 shadow-xs'
                  }`}
                >
                  <IconComp
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-amber-300' : 'text-stone-600'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* View Routing */}
        <div className="flex-1">
          {currentView === 'dashboard' && (
            <Dashboard
              userName="Ravi"
              onExplain={handleExplainFromDashboard}
              onHelpMeDo={handleHelpMeDoFromDashboard}
              onViewReminders={() => setCurrentView('reminders')}
            />
          )}

          {currentView === 'understand' && (
            <UnderstandFeature
              initialText={understandInitialText}
              onHelpMeDo={handleHelpMeDoFromUnderstand}
            />
          )}

          {currentView === 'safety' && <SafetyFeature />}

          {currentView === 'guided' && (
            <GuidedTask
              initialTask={guidedInitialTask}
              onReturnToDashboard={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'voice' && (
            <VoiceFeature onNavigate={setCurrentView} />
          )}

          {currentView === 'reminders' && (
            <RemindersFeature
              onStartTask={handleStartTaskFromReminders}
            />
          )}
        </div>
      </AppShell>
    </TextSizeProvider>
  );
}
