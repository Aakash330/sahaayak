import { useState } from 'react';
import { TextSizeProvider } from './accessibility/TextSizeContext';
import { AppShell } from './components/ui';
import { Dashboard } from './features/dashboard/Dashboard';
import { UnderstandFeature } from './features/understand/UnderstandFeature';
import { Button } from './components/ui';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'understand'>('dashboard');

  return (
    <TextSizeProvider>
      <AppShell>
        {/* Temporary Hackathon Navigation */}
        <div className="bg-white border-b border-stone-200 px-4 py-2 flex gap-4 overflow-x-auto">
          <Button 
            variant={currentView === 'dashboard' ? 'primary' : 'back'} 
            onClick={() => setCurrentView('dashboard')}
            className="!min-h-[40px] !py-2"
          >
            My Day
          </Button>
          <Button 
            variant={currentView === 'understand' ? 'primary' : 'back'} 
            onClick={() => setCurrentView('understand')}
            className="!min-h-[40px] !py-2"
          >
            Understand Message
          </Button>
        </div>

        {currentView === 'dashboard' && <Dashboard userName="Ravi" />}
        {currentView === 'understand' && <UnderstandFeature />}
      </AppShell>
    </TextSizeProvider>
  );
}
