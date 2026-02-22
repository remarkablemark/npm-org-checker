export type ApiErrorType =
  | 'NETWORK_ERROR'
  | 'CORS_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  timestamp: Date;
}

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
