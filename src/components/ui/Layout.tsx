import React from 'react';
import { useTextSize } from '../../accessibility/TextSizeContext';
import { Settings, Home } from 'lucide-react';
import { Button } from './Button';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header />
      <main id="main-content" className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
};

export const Header: React.FC = () => {
  const { textSize, setTextSize } = useTextSize();

  const cycleTextSize = () => {
    if (textSize === 'normal') setTextSize('large');
    else if (textSize === 'large') setTextSize('extra-large');
    else setTextSize('normal');
  };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-blue-700 text-white flex items-center justify-center rounded-xl font-bold text-xl" aria-hidden="true">
          S
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Sahaayak</h1>
      </div>
      
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-1/2 focus:-translate-x-1/2 bg-blue-700 text-white px-4 py-2 rounded-xl z-50"
      >
        Skip to main content
      </a>

      <nav aria-label="Main Navigation">
        <Button variant="secondary" onClick={cycleTextSize} icon={Settings} className="!p-3 !min-w-[48px]">
          <span className="sr-only">Change text size (current: {textSize})</span>
          <span aria-hidden="true" className="text-base font-semibold">Aa</span>
        </Button>
      </nav>
    </header>
  );
};

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-3xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 ${className}`}>
      {children}
    </div>
  );
};
