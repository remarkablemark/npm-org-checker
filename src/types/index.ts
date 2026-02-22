/**
 * Type definitions for NPM Organization Name Availability Checker
 */

export const ValidationErrorType = {
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
  INVALID_START: 'INVALID_START',
  INVALID_END: 'INVALID_END',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
  CONSECUTIVE_HYPHENS: 'CONSECUTIVE_HYPHENS',
  RESERVED_WORD: 'RESERVED_WORD',
  EMPTY: 'EMPTY',
} as const;

export type ValidationErrorType =
  (typeof ValidationErrorType)[keyof typeof ValidationErrorType];

export const ApiErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  CORS_ERROR: 'CORS_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorType = (typeof ApiErrorType)[keyof typeof ApiErrorType];

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  timestamp: Date;
}

export interface AvailabilityStatus {
  isAvailable: boolean;
  checkedAt: Date;
  source: 'npm-registry';
}

export interface OrganizationName {
  value: string;
  isValid: boolean;
  validationErrors: ValidationError[];
  isAvailable: boolean | null;
  isChecking: boolean;
  lastChecked: Date | null;
}

export interface ComponentProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  role?: string;
}

export interface InputProps extends ComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export interface AvailabilityIndicatorProps extends ComponentProps {
  isAvailable: boolean | null;
  isChecking: boolean;
}

export interface ErrorMessageProps extends ComponentProps {
  errors: ValidationError[];
  apiError?: ApiError | null;
}

export interface OrgNameCheckerProps extends ComponentProps {
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  debounceMs?: number;
}

export type CheckAvailabilityFunction = (orgName: string) => Promise<boolean>;

export type ValidateOrganizationNameFunction = (
  name: string,
) => ValidationResult;
