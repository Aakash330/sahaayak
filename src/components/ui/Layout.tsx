import React from 'react';
import { useTextSize } from '../../accessibility/TextSizeContext';
import { Settings, ShieldCheck, Heart } from 'lucide-react';
import { Button } from './Button';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-hidden">
        {children}
      </main>
      <footer className="py-6 px-4 text-center border-t border-stone-200/80 bg-white/60 text-stone-600 text-base">
        <p className="flex items-center justify-center gap-2 font-medium">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-500" aria-hidden="true" />
          <span>Sahaayak • Designed with care, dignity, and patience for seniors.</span>
        </p>
      </footer>
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

  const textSizeLabels: Record<string, string> = {
    normal: 'Normal',
    large: 'Large (A+)',
    'extra-large': 'Biggest (A++)',
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_1px_6px_rgba(40,30,20,0.03)]">
      <div className="flex items-center gap-3">
        <div 
          className="w-11 h-11 bg-gradient-to-br from-[#1E3A5F] to-[#13253D] text-white flex items-center justify-center rounded-2xl font-serif font-bold text-2xl shadow-sm border border-[#152B47]/40 select-none" 
          aria-hidden="true"
        >
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 tracking-tight">
              Sahaayak
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full">
              सहायक
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-stone-600 tracking-wide">
            Your Trustworthy Senior Daily Companion
          </p>
        </div>
      </div>
      
      {/* Skip to main content link for screen readers and keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 bg-[#1E3A5F] text-white px-6 py-3 rounded-2xl z-50 font-bold shadow-xl border-2 border-white ring-4 ring-amber-400 focus:outline-hidden"
      >
        Skip to main content
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Private & Safe</span>
        </div>

        <div role="region" aria-label="Text size settings">
          <Button 
            variant="secondary" 
            onClick={cycleTextSize} 
            icon={Settings} 
            className="!px-3.5 !py-2 !min-h-[48px] border-stone-300 hover:border-amber-400 bg-white focus-visible:ring-4 focus-visible:ring-[#1E3A5F]"
          >
            <span className="sr-only">Change text size (current: {textSize})</span>
            <div className="flex items-center gap-1.5 text-stone-800" aria-hidden="true">
              <span className="text-base font-bold text-[#1E3A5F]">Aa</span>
              <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-300">
                {textSizeLabels[textSize] || 'Normal'}
              </span>
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
};

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 ${className}`}>
      {children}
    </div>
  );
};
