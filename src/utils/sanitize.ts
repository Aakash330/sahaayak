/**
 * Text sanitization and validation utilities
 */

/**
 * Strips HTML tags and trims whitespace to ensure safe plain text
 * and prevent XSS or tag injection.
 */
export function sanitizePlainText(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Validates and sanitizes an array of strings.
 * Filters out empty or non-string elements.
 */
export function safeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item) => (typeof item === 'string' ? sanitizePlainText(item) : ''))
    .filter((item) => item.length > 0);
}

/**
 * Maximum character limit for user text inputs across all features
 */
export const MAX_INPUT_LENGTH = 2000;

/**
 * Safely extracts a user-facing error message from any error value.
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred.'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  return fallback;
}
