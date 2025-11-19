/**
 * Error utility functions for notification service
 * 
 * @module ErrorUtils
 * @description Shared utilities for error handling and categorization
 */

/**
 * Determines if an error is retryable based on error properties
 * 
 * @function isRetryableError
 * @description Categorizes errors as retryable or non-retryable based on error codes,
 * status codes, and error messages. Network errors, timeouts, and rate limits are
 * typically retryable, while authentication and validation errors are not.
 * 
 * @param {any} error - Error object to analyze
 * @returns {boolean} True if the error is retryable, false otherwise
 * 
 * @example
 * ```typescript
 * const isRetryable = isRetryableError(error);
 * if (isRetryable) {
 *   // Retry the operation
 * } else {
 *   // Mark as non-retryable failure
 * }
 * ```
 */
export function isRetryableError(error: any): boolean {
  // Network errors and timeouts are retryable
  if (
    error.code === 'ETIMEDOUT' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNRESET' ||
    error.message?.includes('timeout') ||
    error.message?.includes('network')
  ) {
    return true;
  }

  // Rate limits and service unavailable are retryable
  if (
    error.statusCode === 429 ||
    error.statusCode === 503 ||
    error.statusCode === 502 ||
    error.message?.includes('rate limit') ||
    error.message?.includes('service unavailable')
  ) {
    return true;
  }

  // Authentication and authorization errors are NOT retryable
  if (
    error.statusCode === 401 ||
    error.statusCode === 403 ||
    error.message?.includes('unauthorized') ||
    error.message?.includes('forbidden')
  ) {
    return false;
  }

  // Validation errors are NOT retryable
  if (
    error.statusCode === 400 ||
    error.message?.includes('invalid') ||
    error.message?.includes('not found') ||
    error.message?.includes('bad request')
  ) {
    return false;
  }

  // Default to retryable for unknown errors (conservative approach)
  return true;
}

/**
 * Extracts error message from various error types
 * 
 * @function getErrorMessage
 * @description Safely extracts error message from error objects of different types
 * 
 * @param {any} error - Error object
 * @returns {string} Error message
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Unknown error occurred';
}

/**
 * Extracts error code from error object
 * 
 * @function getErrorCode
 * @description Safely extracts error code from error objects
 * 
 * @param {any} error - Error object
 * @returns {string | undefined} Error code if available
 */
export function getErrorCode(error: any): string | undefined {
  return error?.code || error?.statusCode?.toString() || error?.errorCode;
}

