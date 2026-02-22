export interface AvailabilityIndicatorProps {
  /** Whether the name is available (null = unknown/not checked) */
  isAvailable: boolean | null;
  /** Whether an availability check is in progress */
  isChecking: boolean;
  /** Additional CSS class names */
  className?: string;
}
