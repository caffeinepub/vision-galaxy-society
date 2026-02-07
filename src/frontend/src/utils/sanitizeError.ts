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
  } else if (typeof error === 'object') {
    // Handle objects with message property
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    } else {
      // Try to stringify the object, but avoid [object Object]
      try {
        const stringified = JSON.stringify(error);
        if (stringified && stringified !== '{}') {
          message = stringified;
        }
      } catch {
        // Ignore stringify errors
      }
    }
  }
  
  // If still no message, use fallback
  if (!message) {
    message = 'An error occurred. Please try again.';
  }

  // Handle backend authorization/approval trap messages
  if (message.includes('Unauthorized:')) {
    // Extract the user-friendly part after "Unauthorized:"
    const parts = message.split('Unauthorized:');
    if (parts.length > 1) {
      const detail = parts[1].trim();
      // Check for specific authorization scenarios
      if (detail.includes('must be approved')) {
        return 'Access denied: Your account is pending approval. Please contact the administrator.';
      } else if (detail.includes('Only secretary') || detail.includes('Only admin')) {
        return 'Access denied: This feature is only available to secretaries and administrators.';
      } else if (detail.includes('Only admins') || detail.includes('Only users')) {
        return 'Access denied: You do not have permission to access this resource.';
      } else if (detail.includes('Can only')) {
        return 'Access denied: ' + detail;
      } else {
        return 'Access denied: ' + detail;
      }
    } else {
      return 'Access denied: You do not have permission to perform this action.';
    }
  }

  // Handle "not found" scenarios that might be authorization issues
  if (message.toLowerCase().includes('not found') && message.toLowerCase().includes('profile')) {
    return 'Unable to load profile. Please ensure you are logged in and try again.';
  }

  // Handle timeout errors
  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('timed out')) {
    return 'Connection timeout: The request took too long to complete. Please check your network connection and try again.';
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
