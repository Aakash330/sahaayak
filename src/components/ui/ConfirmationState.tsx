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
    <div className="flex flex-col items-center justify-center p-8 text-center bg-green-50 rounded-2xl border border-green-100">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-700" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold text-green-900 mb-4">{title}</h3>
      <p className="text-xl text-green-800 mb-8 max-w-md">{message}</p>
      
      <Button onClick={onContinue} variant="primary">
        {continueLabel}
      </Button>
      <LiveAnnouncer message={`${title}. ${message}`} />
    </div>
  );
};
