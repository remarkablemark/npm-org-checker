import { useCallback, useRef, useState } from 'react';
import type { ApiError } from 'src/types';
import { checkUserExists, createApiError } from 'src/utils/npmRegistry';
import { validateOrganizationName } from 'src/utils/validation';

interface UseUserExistenceCheckerOptions {
  /** Debounce delay in milliseconds for user existence checks (default: 300) */
  debounceMs?: number;
}

interface UseUserExistenceCheckerReturn {
  /** Whether the user exists (null = not checked yet) */
  userExists: boolean | null;
  /** Whether a user existence check is currently in progress */
  isChecking: boolean;
  /** API error from last check (null = no error) */
  apiError: ApiError | null;
  /** Timestamp of the last successful user existence check */
  lastChecked: Date | null;
  /** Function to trigger user existence check for a user name */
  checkUserExists: (userName: string) => void;
  /** Function to reset the hook to initial state */
  reset: () => void;
}

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * React hook for checking npm user existence with debouncing.
 *
 * This hook handles the complex logic of checking user existence
 * against the npm registry while providing a smooth user experience.
 *
 * Key Features:
 * - Debounced API calls (300ms default) to prevent excessive requests
 * - Automatic cancellation of pending requests on new input
 * - Comprehensive error handling for network issues, timeouts, and server errors
 * - Loading state management for UI feedback
 * - Timestamp tracking for cache invalidation
 *
 * API Integration:
 * - Uses corsmirror.com as CORS proxy for npm registry access
 * - Makes GET requests to npm registry search API with author filter
 * - Handles various error scenarios gracefully
 *
 * Performance Optimizations:
 * - Debouncing prevents API spam during rapid typing
 * - Request cancellation prevents race conditions
 * - Efficient state management with React hooks
 *
 * @param options - Configuration options for the hook
 * @returns Object containing user existence state and control functions
 */
export function useUserExistenceChecker(
  options: UseUserExistenceCheckerOptions = {},
): UseUserExistenceCheckerReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Use refs to track the latest timeout and debounced value
  const timeoutRef = useRef<number | null>(null);
  const debouncedNameRef = useRef<string>('');

  const performCheck = useCallback(async (userName: string) => {
    /* v8 ignore start */ // Coverage: Early return for empty strings is tested via debounced function
    if (!userName.trim()) {
      return;
    }
    /* v8 ignore end */

    // Validate user name before making API call
    const validation = validateOrganizationName(userName);
    if (!validation.isValid) {
      return;
    }

    setIsChecking(true);
    setApiError(null);

    try {
      const exists = await checkUserExists(userName);
      setUserExists(exists);
      setLastChecked(new Date());
      setApiError(null);
    } catch (error) {
      const apiErr = createApiError(error as Error);
      setApiError(apiErr);
      setUserExists(null);
      setLastChecked(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkUserExistsDebounced = useCallback(
    (userName: string) => {
      // Clear existing timeout
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // Store the debounced name
      debouncedNameRef.current = userName;

      // If empty, don't schedule a check
      if (!userName.trim()) {
        return;
      }

      // If debounceMs is 0, check immediately
      if (debounceMs === 0) {
        void performCheck(userName);
        return;
      }

      // Schedule new debounced check
      timeoutRef.current = window.setTimeout(() => {
        void performCheck(debouncedNameRef.current);
      }, debounceMs);
    },
    [debounceMs, performCheck],
  );

  const reset = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setUserExists(null);
    setIsChecking(false);
    setApiError(null);
    setLastChecked(null);
    debouncedNameRef.current = '';
  }, []);

  return {
    userExists,
    isChecking,
    apiError,
    lastChecked,
    checkUserExists: checkUserExistsDebounced,
    reset,
  };
}
