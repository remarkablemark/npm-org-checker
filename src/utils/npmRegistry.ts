import type { ApiError } from 'src/types';
import { ApiErrorType } from 'src/types';

const TIMEOUT_MS = 10000; // 10 second timeout
const CORS_PROXY_URL = 'https://corsmirror.com/v1?url=';

/**
 * Checks if an npm organization name is available by making a HEAD request
 * to the npm registry via a CORS proxy.
 *
 * This function handles the complexity of checking npm organization availability:
 *
 * Technical Implementation:
 * - Uses corsmirror.com as CORS proxy to bypass browser restrictions
 * - Makes HTTP HEAD requests to npmjs.com/org/\{orgName\}
 * - 200 status = organization exists (not available)
 * - 404 status = organization doesn't exist (available)
 * - Other status codes indicate server/network issues
 *
 * Error Handling:
 * - Network timeouts (10 second limit)
 * - CORS proxy failures
 * - npm registry server errors
 * - Invalid organization names
 *
 * Performance Considerations:
 * - HEAD requests are lightweight (no body transfer)
 * - Timeout prevents hanging requests
 * - Proper error cleanup and resource management
 *
 * @example
 * ```typescript
 * import { checkAvailability } from './npmRegistry';
 *
 * try {
 *   const isAvailable = await checkAvailability('my-org');
 *   console.log(isAvailable ? 'Available!' : 'Not available');
 * } catch (error) {
 *   console.error('Failed to check availability:', error);
 * }
 * ```
 *
 * @param orgName - The organization name to check (must be valid npm org name)
 * @returns Promise that resolves to boolean: true if available, false if taken
 * @throws ApiError for network, timeout, or server errors with detailed error information
 */
export async function checkAvailability(orgName: string): Promise<boolean> {
  const controller = new AbortController();
  /* v8 ignore start */ // Coverage: Timeout callback is hard to test reliably
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  /* v8 ignore end */

  try {
    const url = `${CORS_PROXY_URL}https://www.npmjs.com/org/${encodeURIComponent(orgName)}`;

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
