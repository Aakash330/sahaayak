import React from 'react';
import { CheckCircle } from 'lucide-react';
import { LiveAnnouncer } from '../../accessibility';
import { Button } from './Button';

interface ConfirmationStateProps {
  title: string;
  message: string;
  onContinue: () => void;
  continueLabel?: string;
}

export const ConfirmationState: React.FC<ConfirmationStateProps> = ({ 
  title, 
  message, 
  onContinue,
  continueLabel = 'Continue'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-emerald-50/80 rounded-3xl border border-emerald-200 shadow-2xs">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 border border-emerald-200">
        <CheckCircle className="w-10 h-10 text-emerald-800" aria-hidden="true" />
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mb-3">{title}</h3>
      <p className="text-lg sm:text-xl text-stone-700 mb-8 max-w-lg leading-relaxed font-sans">{message}</p>
      
      <Button onClick={onContinue} variant="primary" className="text-xl py-3.5 px-8">
        {continueLabel}
      </Button>
      <LiveAnnouncer message={`${title}. ${message}`} />
    </div>
  );
};
