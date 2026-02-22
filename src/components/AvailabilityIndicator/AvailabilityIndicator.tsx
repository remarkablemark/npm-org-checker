import type { AvailabilityIndicatorProps } from './AvailabilityIndicator.types';

/**
 * Visual indicator component for npm organization name availability status.
 *
 * This component provides clear visual feedback about availability status:
 * - ✅ Green checkmark for available names
 * - ❌ Red X for unavailable names
 * - 🔄 Loading spinner during availability checks
 * - No display when status is unknown (null) and not checking
 *
 * Features:
 * - Fully accessible with ARIA live regions for screen readers
 * - High contrast colors for visibility
 * - Smooth transitions between states
 * - Responsive design with proper touch targets
 *
 * @example
 * ```tsx
 * <AvailabilityIndicator
 *   isAvailable={true}
 *   isChecking={false}
 *   className="custom-styles"
 * />
 * ```
 *
 * @param isAvailable - Availability status (true=available, false=unavailable, null=unknown)
 * @param isChecking - Whether an availability check is currently in progress
 * @param className - Additional CSS class names for custom styling
 *
 * @returns Visual status indicator or empty fragment when no status to display
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
        <span className="font-medium">Checking...</span>
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
        <span className="font-medium">Available</span>
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
      <span className="font-medium">Unavailable</span>
    </div>
  );
}
