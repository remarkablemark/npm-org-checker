import type { AvailabilityIndicatorProps } from './AvailabilityIndicator.types';

/**
 * Component that displays the availability status of an npm organization name
 * Shows visual indicators (✅/❌/spinner) with appropriate colors and text
 */
export function AvailabilityIndicator({
  isAvailable,
  isChecking,
  className = '',
}: AvailabilityIndicatorProps) {
  // Don't render anything if we haven't checked yet and aren't currently checking
  if (isAvailable === null && !isChecking) {
    return <></>;
  }

  // Prioritize checking state over availability
  if (isChecking) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy={isChecking}
        className={`flex items-center gap-2 text-blue-600 ${className}`}
      >
        <div
          className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">Checking...</span>
      </div>
    );
  }

  // Show available state
  if (isAvailable) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 text-green-600 ${className}`}
      >
        <span aria-hidden="true">✅</span>
        <span className="text-sm font-medium">Available</span>
      </div>
    );
  }

  // Show unavailable state
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 text-red-600 ${className}`}
    >
      <span aria-hidden="true">❌</span>
      <span className="text-sm font-medium">Unavailable</span>
    </div>
  );
}
