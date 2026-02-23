import type { ErrorMessageProps } from './ErrorMessage.types';

/**
 * Comprehensive error display component for validation and API errors.
 *
 * This component handles both user input validation errors and API-related errors:
 * - Validation errors: Real-time feedback on input format issues
 * - API errors: Network, server, or npm registry problems
 * - Retry functionality for recoverable errors
 * - Technical details for debugging (optional)
 *
 * Display Priority:
 * 1. Validation errors (shown first, multiple errors supported)
 * 2. API errors (shown only if no validation errors)
 *
 * Accessibility Features:
 * - ARIA live region for screen reader announcements
 * - Semantic HTML structure
 * - High contrast error indicators
 * - Keyboard navigation support
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   validationErrors={['Name too short', 'Invalid characters']}
 *   apiError={networkError}
 *   showTechnicalDetails={true}
 *   onRetry={() => retryCheck()}
 * />
 * ```
 *
 * @param validationErrors - Array of validation error message strings
 * @param apiError - API error object with type, message, and metadata
 * @param showTechnicalDetails - Whether to show technical error details (default: false)
 * @param onRetry - Optional callback for retry action on recoverable errors
 *
 * @returns Error display component or null if no errors present
 */
export function ErrorMessage({
  validationErrors = [],
  apiError,
  showTechnicalDetails = false,
  onRetry,
}: ErrorMessageProps) {
  // Don't render anything if there are no errors
  if (validationErrors.length === 0 && !apiError) {
    return null;
  }

  // Determine which error to show (validation errors take priority)
  const showValidationErrors = validationErrors.length > 0;
  const currentError = showValidationErrors ? null : apiError;

  // Determine if retry should be shown
  const recoverableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
  const showRetry =
    currentError && recoverableErrors.includes(currentError.type) && onRetry;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="animate-in fade-in text-red-600 duration-200 dark:text-red-400"
    >
      {showValidationErrors ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg" aria-hidden="true">
              ⚠️
            </span>
            <h3 className="font-medium">Validation Errors</h3>
          </div>
          <ul className="ml-6 list-inside list-disc space-y-1">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : (
        currentError && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg" aria-hidden="true">
                ❌
              </span>
              <span className="font-medium">Error</span>
            </div>
            <div>{currentError.message}</div>

            {showTechnicalDetails && (
              <details className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                <summary className="cursor-pointer font-mono text-xs text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-1 font-mono text-xs text-red-600 dark:text-red-400">
                  <div>Type: {currentError.type}</div>
                  {currentError.statusCode && (
                    <div>Status Code: {currentError.statusCode}</div>
                  )}
                  <div>Timestamp: {currentError.timestamp.toISOString()}</div>
                </div>
              </details>
            )}

            {showRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 dark:focus:ring-red-400"
              >
                Retry
              </button>
            )}
          </div>
        )
      )}
    </div>
  );
}
