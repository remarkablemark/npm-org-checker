import { useEffect, useRef } from 'react';

import { useAvailabilityChecker } from '../../hooks/useAvailabilityChecker';
import { useOrgNameValidator } from '../../hooks/useOrgNameValidator';
import { AvailabilityIndicator } from '../AvailabilityIndicator';
import { ErrorMessage } from '../ErrorMessage';
import type { OrgNameCheckerProps } from './OrgNameChecker.types';

/**
 * Component for checking npm organization name availability
 * Provides real-time validation and availability checking with visual feedback
 */
export function OrgNameChecker({
  onAvailabilityChange,
  onValidationError,
  placeholder = 'Enter npm organization name',
  autoFocus = false,
}: OrgNameCheckerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    value: orgName,
    isValid,
    validationErrors,
    setValue: setOrgName,
  } = useOrgNameValidator();

  const { isAvailable, isChecking, apiError, checkAvailability } =
    useAvailabilityChecker({ debounceMs: 300 });

  // Handle auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Notify parent of availability changes
  useEffect(() => {
    onAvailabilityChange?.(isAvailable);
  }, [isAvailable, onAvailabilityChange]);

  // Notify parent of validation errors
  useEffect(() => {
    onValidationError?.(validationErrors.map((error) => error.message));
  }, [validationErrors, onValidationError]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrgName(value);

    // Trigger availability check if input is valid
    if (value && isValid) {
      checkAvailability(value);
    }
  };

  const errorId = validationErrors.length > 0 ? 'validation-errors' : undefined;
  const hasError = validationErrors.length > 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="org-name-input"
          className="text-sm font-medium text-gray-700"
        >
          npm Organization Name
        </label>

        <input
          ref={inputRef}
          id="org-name-input"
          type="text"
          value={orgName}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Organization name"
          aria-describedby={errorId}
          aria-invalid={hasError}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none md:max-w-[600px]"
        />
      </div>

      {/* Validation Errors */}
      <ErrorMessage
        validationErrors={validationErrors.map((error) => error.message)}
        apiError={apiError ?? undefined}
        showTechnicalDetails
        onRetry={() => {
          if (orgName && isValid) {
            checkAvailability(orgName);
          }
        }}
      />

      {/* Availability Status */}
      <AvailabilityIndicator
        isAvailable={isAvailable}
        isChecking={isChecking}
      />
    </div>
  );
}
