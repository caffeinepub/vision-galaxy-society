/**
 * Sanitizes error messages for safe display to users.
 * Removes sensitive information and provides user-friendly error messages.
 */
export function sanitizeError(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  // Extract message from various error types
  let message = '';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  } else {
    message = String(error);
  }

  // Truncate overly long messages
  if (message.length > 500) {
    message = message.substring(0, 500) + '...';
  }

  // Remove potential sensitive patterns (tokens, keys, etc.)
  message = message.replace(/[a-zA-Z0-9]{32,}/g, '[REDACTED]');
  message = message.replace(/token[:\s]*[^\s]+/gi, 'token: [REDACTED]');
  message = message.replace(/key[:\s]*[^\s]+/gi, 'key: [REDACTED]');
  message = message.replace(/secret[:\s]*[^\s]+/gi, 'secret: [REDACTED]');
  
  // If message is empty or only whitespace after sanitization
  if (!message.trim()) {
    return 'An error occurred while loading the application. Please try again.';
  }

  return message.trim();
}
