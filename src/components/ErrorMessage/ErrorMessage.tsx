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
    <div role="alert" aria-live="assertive" className="text-red-600">
      {showValidationErrors ? (
        <div>
          <h3 className="sr-only">Validation Errors</h3>
          <ul className="list-inside list-disc space-y-1">
            {validationErrors.map((error) => (
              <li key={error} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        currentError && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{currentError.message}</div>

            {showTechnicalDetails && (
              <details className="text-xs">
                <summary className="cursor-pointer font-mono opacity-75 hover:opacity-100">
                  Technical Details
                </summary>
                <div className="mt-2 space-y-1 font-mono opacity-75">
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
                className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:outline-none"
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
