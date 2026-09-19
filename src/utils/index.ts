/**
 * Common Utility Functions
 */

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export * from './sanitize';
export * from './clipboard';
