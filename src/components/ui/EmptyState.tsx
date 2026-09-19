import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-stone-200">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-blue-600" aria-hidden="true" />
      </div>
      <h3 className="text-2xl font-bold text-stone-900 mb-4">{title}</h3>
      <p className="text-xl text-stone-600 mb-8 max-w-md">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
