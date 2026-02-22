import type { ApiError } from 'src/types';
import { ApiErrorType } from 'src/types';

const TIMEOUT_MS = 10000; // 10 second timeout
const CORS_PROXY_URL = 'https://corsmirror.com/v1?url=';

/**
 * Checks if an npm organization name is available by making a HEAD request
 * to the npm registry via a CORS proxy
 *
 * @param orgName - The organization name to check
 * @returns Promise<boolean> - true if available, false if taken
 * @throws Error - For network or API errors
 */
export async function checkAvailability(orgName: string): Promise<boolean> {
  const controller = new AbortController();
  /* v8 ignore start */ // Coverage: Timeout callback is hard to test reliably
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  /* v8 ignore end */

  try {
    const url = `${CORS_PROXY_URL}https://npmjs.org/org/${encodeURIComponent(orgName)}`;

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 404 means the organization doesn't exist (available)
    // 200 means it exists (taken)
    if (response.status === 404) {
      return true; // Available
    }

    if (response.status === 200) {
      return false; // Taken
    }

    // For other status codes, throw an error
    throw new Error(
      response.statusText || `HTTP ${response.status.toString()}`,
    );
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle AbortError (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(error.message || 'Request timeout');
    }

    // Re-throw the error to be handled by the caller
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unknown error occurred');
  }
}

/**
 * Creates an ApiError from a generic error based on error type
 *
 * @param error - The original error
 * @returns ApiError - Typed API error
 */
export function createApiError(
  error: Error | { status?: number; message?: string },
): ApiError {
  const timestamp = new Date();

  // Handle AbortError (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      type: ApiErrorType.TIMEOUT_ERROR,
      message: error.message || 'Request timeout',
      timestamp,
    };
  }

  // Handle TypeError (CORS issues)
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return {
      type: ApiErrorType.CORS_ERROR,
      message: error.message,
      timestamp,
    };
  }

  // Handle network errors
  if (error instanceof Error && error.message.includes('Network')) {
    return {
      type: ApiErrorType.NETWORK_ERROR,
      message: error.message,
      timestamp,
    };
  }

  // Handle server errors with status codes
  if (
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 500
  ) {
    return {
      type: ApiErrorType.SERVER_ERROR,
      message: (error as Error).message || 'Server error',
      statusCode: error.status,
      timestamp,
    };
  }

  // Default to unknown error
  return {
    type: ApiErrorType.UNKNOWN_ERROR,
    message: (error as Error).message || 'Unknown error occurred',
    timestamp,
  };
}
