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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-2xl border border-red-100">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8 text-red-700" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold text-red-900 mb-3">{title}</h3>
      <p className="text-lg text-red-800 mb-8 max-w-md">{message}</p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
      <LiveAnnouncer message={`Error: ${title}. ${message}`} />
    </div>
  );
};
