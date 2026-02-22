import { useCallback, useState } from 'react';
import type { ValidationError } from 'src/types';
import { validateOrganizationName } from 'src/utils/validation';

interface UseOrgNameValidatorReturn {
  /** Current input value */
  value: string;
  /** Whether the current value passes all validation rules */
  isValid: boolean;
  /** Array of validation errors (empty if valid) */
  validationErrors: ValidationError[];
  /** Whether the user has interacted with the input */
  isDirty: boolean;
  /** Function to update the input value and validate */
  setValue: (value: string) => void;
  /** Function to reset the validator to initial state */
  reset: () => void;
}

/**
 * React hook for real-time npm organization name validation.
 *
 * This hook provides comprehensive validation for npm organization names according to
 * npm's official naming rules and best practices:
 *
 * Validation Rules:
 * - Length: 1-214 characters
 * - Pattern: Must start with letter, contain only lowercase letters, numbers, and hyphens
 * - No consecutive hyphens allowed
 * - Must end with letter or number (not hyphen)
 * - Reserved words are blocked (npm, node, package, module, etc.)
 *
 * Features:
 * - Real-time validation as user types
 * - Dirty state tracking (errors only shown after user interaction)
 * - Multiple error support (shows all applicable validation issues)
 * - Reset functionality for form clearing
 *
 * @example
 * ```tsx
 * const {
 *   value,
 *   isValid,
 *   validationErrors,
 *   isDirty,
 *   setValue,
 *   reset
 * } = useOrgNameValidator();
 *
 * // Use in input field
 * <input
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   aria-invalid={!isValid && isDirty}
 * />
 *
 * // Show errors only when dirty
 * {isDirty && validationErrors.map(error => (
 *   <div key={error.type}>{error.message}</div>
 * ))}
 * ```
 *
 * @returns Object containing validation state and control functions
 */
export function useOrgNameValidator(): UseOrgNameValidatorReturn {
  const [value, setValueState] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  const setValue = useCallback((newValue: string) => {
    setValueState(newValue);
    setIsDirty(true);
  }, []);

  const reset = useCallback(() => {
    setValueState('');
    setIsDirty(false);
  }, []);

  const validationResult = validateOrganizationName(value);

  // Only show validation errors if the field has been touched
  const validationErrors = isDirty ? validationResult.errors : [];

  return {
    value,
    isValid: isDirty ? validationResult.isValid : false,
    validationErrors,
    isDirty,
    setValue,
    reset,
  };
}
