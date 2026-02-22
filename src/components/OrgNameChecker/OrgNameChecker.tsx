import { useEffect, useRef } from 'react';
import { useAvailabilityChecker } from 'src/hooks/useAvailabilityChecker';

import { useOrgNameValidator } from '../../hooks/useOrgNameValidator';
import { AvailabilityIndicator } from '../AvailabilityIndicator';
import { ErrorMessage } from '../ErrorMessage';
import type { OrgNameCheckerProps } from './OrgNameChecker.types';

/**
 * Main component for checking npm organization name availability.
 *
 * This component provides a complete interface for:
 * - Real-time input validation with immediate feedback
 * - Organization name availability checking via npm registry API
 * - Visual status indicators (available/unavailable/checking)
 * - Comprehensive error handling and display
 * - Full accessibility support (keyboard navigation, screen readers)
 *
 * @example
 * ```tsx
 * <OrgNameChecker
 *   onAvailabilityChange={(isAvailable) => console.log(isAvailable)}
 *   onValidationError={(errors) => console.log(errors)}
 *   placeholder="Enter your org name"
 *   autoFocus={true}
 * />
 * ```
 *
 * @param onAvailabilityChange - Optional callback fired when organization availability status changes
 * @param onValidationError - Optional callback fired when validation errors occur
 * @param placeholder - Placeholder text for the input field (default: "Enter npm organization name")
 * @param autoFocus - Whether the input should be auto-focused on mount (default: false)
 *
 * @returns A complete form interface with input, validation, and availability feedback
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

  const { isAvailable, isChecking, apiError, orgUrl, checkAvailability } =
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
  };

  // Check organization availability only if validation passes
  useEffect(() => {
    if (orgName && isValid) {
      checkAvailability(orgName);
    }
  }, [orgName, isValid, checkAvailability]);

  const errorId = validationErrors.length > 0 ? 'validation-errors' : undefined;
  const hasError = validationErrors.length > 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="name-input"
          className="text-sm font-medium text-gray-700"
        >
          NPM Organization Name
        </label>

        <input
          ref={inputRef}
          id="name-input"
          type="text"
          value={orgName}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Organization name"
          aria-describedby={errorId ?? undefined}
          aria-invalid={hasError}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none md:max-w-[600px]"
        />
      </div>

      {/* Organization Validation Errors */}
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

      {/* Organization Availability Status */}
      <AvailabilityIndicator
        isAvailable={isAvailable}
        isChecking={isChecking}
      />

      {/* Organization URL Link */}
      {orgUrl && (
        <div className="text-gray-600">
          <p>
            {'See user/organization: '}
            <a
              href={orgUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {orgUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
