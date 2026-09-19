import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from './Button';
import { LiveAnnouncer } from '../../accessibility';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-10 text-center bg-rose-50/80 rounded-3xl border border-rose-200 shadow-2xs">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 border border-rose-200">
        <AlertOctagon className="w-8 h-8 text-rose-800" aria-hidden="true" />
      </div>
      <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-950 mb-3">{title}</h3>
      <p className="text-lg sm:text-xl text-stone-700 mb-8 max-w-md leading-relaxed font-sans">{message}</p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="primary" className="text-xl py-3 px-7">
          Try Again
        </Button>
      )}
      <LiveAnnouncer message={`Error: ${title}. ${message}`} />
    </div>
  );
};
