import type { ApiError } from 'src/types';

export interface ErrorMessageProps {
  /** Array of validation error messages */
  validationErrors?: string[];
  /** API error object if present */
  apiError?: ApiError;
  /** Whether to show technical details */
  showTechnicalDetails?: boolean;
  /** Callback for retry action */
  onRetry?: () => void;
}
