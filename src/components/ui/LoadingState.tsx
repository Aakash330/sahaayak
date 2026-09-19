import React from 'react';
import { Loader2 } from 'lucide-react';
import { LiveAnnouncer } from '../../accessibility';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-stone-600">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-6" aria-hidden="true" />
      <p className="text-xl font-medium text-center">{message}</p>
      <LiveAnnouncer message={message} />
    </div>
  );
};
