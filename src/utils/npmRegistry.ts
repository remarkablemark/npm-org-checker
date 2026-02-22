import type { ApiError } from 'src/types';
import { ApiErrorType } from 'src/types';

const TIMEOUT_MS = 10000; // 10 second timeout
const CORS_PROXY_URL = 'https://corsmirror.com/v1?url=';

interface NpmSearchResponse {
  objects?: {
    package: {
      name: string;
      version: string;
      description: string;
    };
    score: {
      final: number;
      detail: {
        quality: number;
        popularity: number;
        maintenance: number;
      };
    };
    searchScore: number;
  }[];
  total: number;
  time: string;
}

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
 *   const isAvailable = await checkOrgAvailability('my-org');
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
export async function checkOrgAvailability(orgName: string): Promise<boolean> {
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
 * Checks if a user exists on npm registry via the search API.
 *
 * This function handles the complexity of checking npm user existence:
 *
 * Technical Implementation:
 * - Uses corsmirror.com as CORS proxy to bypass browser restrictions
 * - Makes GET requests to npm registry search API with author filter
 * - Response contains objects array - user exists if array has items
 * - Uses search API which is designed for this type of query
 *
 * Error Handling:
 * - Network timeouts (10 second limit)
 * - CORS proxy failures
 * - npm registry server errors
 * - Invalid response format parsing
 *
 * Performance Considerations:
 * - GET requests with size=1 parameter for minimal data transfer
 * - Timeout prevents hanging requests
 * - Proper error cleanup and resource management
 *
 * @example
 * ```typescript
 * import { checkUserExists } from './npmRegistry';
 *
 * try {
 *   const exists = await checkUserExists('some-user');
 *   console.log(exists ? 'User exists' : 'User not found');
 * } catch (error) {
 *   console.error('Failed to check user:', error);
 * }
 * ```
 *
 * @param userName - The user name to check (must be valid npm user name)
 * @returns Promise that resolves to boolean: true if user exists, false if not found
 * @throws ApiError for network, timeout, or server errors with detailed error information
 */
export async function checkUserExists(userName: string): Promise<boolean> {
  const controller = new AbortController();
  /* v8 ignore start */ // Coverage: Timeout callback is hard to test reliably
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  /* v8 ignore end */

  try {
    const url = `${CORS_PROXY_URL}https://registry.npmjs.org/-/v1/search?text=author:${encodeURIComponent(userName)}&size=1`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status.toString()}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as NpmSearchResponse;

    // User exists if the search returns any packages by that author
    return (data.objects?.length ?? 0) > 0;
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
 * Checks name availability with sequential user and organization validation.
 *
 * This function implements the complete validation flow:
 * 1. First checks if user exists on npm registry
 * 2. Only checks organization availability if user doesn't exist
 * 3. Returns true only if both user doesn't exist AND organization is available
 *
 * This approach optimizes API calls by avoiding unnecessary organization checks
 * when the user name already exists (which would make the organization unavailable).
 *
 * @example
 * ```typescript
 * import { checkNameAvailability } from './npmRegistry';
 *
 * try {
 *   const isAvailable = await checkNameAvailability('my-name');
 *   console.log(isAvailable ? 'Available!' : 'Not available');
 * } catch (error) {
 *   console.error('Failed to check name:', error);
 * }
 * ```
 *
 * @param name - The name to check for both user existence and organization availability
 * @returns Promise<boolean> - true if name is available, false if not available
 * @throws ApiError for network, timeout, or server errors
 */
export async function checkNameAvailability(name: string): Promise<boolean> {
  // Step 1: Check if user exists
  const userExists = await checkUserExists(name);

  // Step 2: If user exists, name is not available
  if (userExists) {
    return false;
  }

  // Step 3: User doesn't exist, check organization availability
  const orgAvailable = await checkOrgAvailability(name);
  return orgAvailable;
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
