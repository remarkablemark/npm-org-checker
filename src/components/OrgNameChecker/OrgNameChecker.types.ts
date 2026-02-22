export interface OrgNameCheckerProps {
  /** Callback fired when availability status changes */
  onAvailabilityChange?: (isAvailable: boolean | null) => void;
  /** Callback fired when validation errors occur */
  onValidationError?: (errors: string[]) => void;
  /** Callback fired when user existence status changes */
  onUserExistenceChange?: (userExists: boolean | null) => void;
  /** Callback fired when user validation errors occur */
  onUserValidationError?: (errors: string[]) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Whether the input should be auto-focused */
  autoFocus?: boolean;
}
