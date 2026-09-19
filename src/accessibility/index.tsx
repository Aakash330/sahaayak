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
export const LiveAnnouncer: React.FC<{ message: string; priority?: 'polite' | 'assertive' }> = ({
  message,
  priority = 'polite',
}) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};
