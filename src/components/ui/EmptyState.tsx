import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-12 text-center bg-white rounded-3xl border border-stone-200/90 shadow-[0_2px_14px_rgba(40,30,20,0.04)]">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 border border-amber-200 shadow-2xs">
        <Sparkles className="w-10 h-10 text-amber-700" aria-hidden="true" />
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mb-3">{title}</h3>
      <p className="text-lg sm:text-xl text-stone-600 mb-8 max-w-md leading-relaxed font-sans">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
