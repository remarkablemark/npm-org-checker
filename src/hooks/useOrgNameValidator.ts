import { useCallback, useState } from 'react';
import type { ValidationError } from 'src/types';
import { validateOrganizationName } from 'src/utils/validation';

interface UseOrgNameValidatorReturn {
  value: string;
  isValid: boolean;
  validationErrors: ValidationError[];
  isDirty: boolean;
  setValue: (value: string) => void;
  reset: () => void;
}

/**
 * Hook for validating npm organization names
 * Provides real-time validation as user types
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
