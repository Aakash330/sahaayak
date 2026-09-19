import React from 'react';
import { Loader2 } from 'lucide-react';
import { LiveAnnouncer } from '../../accessibility';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading, please wait...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-stone-700">
      <Loader2 className="w-12 h-12 animate-spin text-[#1E3A5F] mb-6" aria-hidden="true" />
      <p className="text-xl font-serif font-semibold text-center text-stone-900">{message}</p>
      <LiveAnnouncer message={message} />
    </div>
  );
};
