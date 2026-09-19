import React from 'react';

/**
 * VisuallyHidden component for screen readers
 */
export const VisuallyHidden: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

/**
 * AriaLive component for dynamic updates like AI responses
 */
export const LiveAnnouncer: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
};
