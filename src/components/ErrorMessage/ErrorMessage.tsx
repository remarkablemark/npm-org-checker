import type { ErrorMessageProps } from './ErrorMessage.types';

/**
 * Component that displays validation and API errors with proper accessibility
 * Prioritizes validation errors over API errors and provides retry functionality
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
      className="animate-in fade-in text-red-600 duration-200"
    >
      {showValidationErrors ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="text-sm font-medium">Validation Errors</h3>
          </div>
          <ul className="ml-6 list-inside list-disc space-y-1">
            {validationErrors.map((error) => (
              <li key={error} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        currentError && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Error</span>
            </div>
            <div className="text-sm">{currentError.message}</div>

            {showTechnicalDetails && (
              <details className="rounded-md border border-red-200 bg-red-50 p-3">
                <summary className="cursor-pointer font-mono text-xs text-red-700 hover:text-red-900">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-1 font-mono text-xs text-red-600">
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
                className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none"
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
