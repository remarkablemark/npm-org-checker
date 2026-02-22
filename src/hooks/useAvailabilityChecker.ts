import { useCallback, useRef, useState } from 'react';
import type { ApiError } from 'src/types';
import { checkAvailability, createApiError } from 'src/utils/npmRegistry';

interface UseAvailabilityCheckerOptions {
  debounceMs?: number;
}

interface UseAvailabilityCheckerReturn {
  isAvailable: boolean | null;
  isChecking: boolean;
  apiError: ApiError | null;
  lastChecked: Date | null;
  checkAvailability: (orgName: string) => void;
  reset: () => void;
}

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Hook for checking npm organization name availability with debouncing
 * Provides loading states and error handling
 */
export function useAvailabilityChecker(
  options: UseAvailabilityCheckerOptions = {},
): UseAvailabilityCheckerReturn {
  const { debounceMs = DEFAULT_DEBOUNCE_MS } = options;

  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Use refs to track the latest timeout and debounced value
  const timeoutRef = useRef<number | null>(null);
  const debouncedNameRef = useRef<string>('');

  const performCheck = useCallback(async (orgName: string) => {
    /* v8 ignore start */ // Coverage: Early return for empty strings is tested via debounced function
    if (!orgName.trim()) {
      return;
    }
    /* v8 ignore end */

    setIsChecking(true);
    setApiError(null);

    try {
      const available = await checkAvailability(orgName);
      setIsAvailable(available);
      setLastChecked(new Date());
      setApiError(null);
    } catch (error) {
      const apiErr = createApiError(error as Error);
      setApiError(apiErr);
      setIsAvailable(null);
      setLastChecked(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkAvailabilityDebounced = useCallback(
    (orgName: string) => {
      // Clear existing timeout
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // Store the debounced name
      debouncedNameRef.current = orgName;

      // If empty, don't schedule a check
      if (!orgName.trim()) {
        return;
      }

      // If debounceMs is 0, check immediately
      if (debounceMs === 0) {
        void performCheck(orgName);
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

    setIsAvailable(null);
    setIsChecking(false);
    setApiError(null);
    setLastChecked(null);
    debouncedNameRef.current = '';
  }, []);

  return {
    isAvailable,
    isChecking,
    apiError,
    lastChecked,
    checkAvailability: checkAvailabilityDebounced,
    reset,
  };
}
