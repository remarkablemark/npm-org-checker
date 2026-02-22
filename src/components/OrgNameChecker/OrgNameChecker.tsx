import { useEffect, useRef, useState } from 'react';

import { useAvailabilityChecker } from '../../hooks/useAvailabilityChecker';
import { useOrgNameValidator } from '../../hooks/useOrgNameValidator';
import { useUserExistenceChecker } from '../../hooks/useUserExistenceChecker';
import { validateUserName } from '../../utils/validation';
import { AvailabilityIndicator } from '../AvailabilityIndicator';
import { ErrorMessage } from '../ErrorMessage';
import type { OrgNameCheckerProps } from './OrgNameChecker.types';

/**
 * Main component for checking npm organization name availability.
 *
 * This component provides a complete interface for:
 * - Real-time input validation with immediate feedback
 * - User name existence checking via npm registry API
 * - Organization name availability checking via npm registry API
 * - Visual status indicators (available/unavailable/checking)
 * - Comprehensive error handling and display
 * - Full accessibility support (keyboard navigation, screen readers)
 *
 * @example
 * ```tsx
 * <OrgNameChecker
 *   onAvailabilityChange={(isAvailable) => console.log(isAvailable)}
 *   onUserExistenceChange={(userExists) => console.log(userExists)}
 *   onValidationError={(errors) => console.log(errors)}
 *   placeholder="Enter your org name"
 *   autoFocus={true}
 * />
 * ```
 *
 * @param onAvailabilityChange - Optional callback fired when organization availability status changes
 * @param onUserExistenceChange - Optional callback fired when user existence status changes
 * @param onValidationError - Optional callback fired when validation errors occur
 * @param onUserValidationError - Optional callback fired when user validation errors occur
 * @param placeholder - Placeholder text for the input field (default: "Enter npm organization name")
 * @param autoFocus - Whether the input should be auto-focused on mount (default: false)
 *
 * @returns A complete form interface with input, validation, and availability feedback
 */
export function OrgNameChecker({
  onAvailabilityChange,
  onUserExistenceChange,
  onValidationError,
  onUserValidationError,
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

  const {
    userExists,
    isChecking: isCheckingUser,
    apiError: userApiError,
    checkUserExists: checkUserExistsFunc,
  } = useUserExistenceChecker({ debounceMs: 300 });

  // User validation state
  const [userValidation, setUserValidation] = useState(() =>
    validateUserName(''),
  );

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

  // Notify parent of user existence changes
  useEffect(() => {
    onUserExistenceChange?.(userExists);
  }, [userExists, onUserExistenceChange]);

  // Notify parent of validation errors
  useEffect(() => {
    onValidationError?.(validationErrors.map((error) => error.message));
  }, [validationErrors, onValidationError]);

  // Notify parent of user validation errors
  useEffect(() => {
    onUserValidationError?.(
      userValidation.errors.map((error) => error.message),
    );
  }, [userValidation.errors, onUserValidationError]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrgName(value);

    // Validate as user name
    const validation = validateUserName(value);
    setUserValidation(validation);

    // Check user existence if user validation passes
    if (validation.isValid) {
      checkUserExistsFunc(value);
    }

    // Check organization availability if org validation passes
    if (value && isValid) {
      checkAvailability(value);
    }
  };

  const errorId = validationErrors.length > 0 ? 'validation-errors' : undefined;
  const hasError = validationErrors.length > 0;
  const userErrorId =
    userValidation.errors.length > 0 ? 'user-validation-errors' : undefined;
  const hasUserError = userValidation.errors.length > 0;

  return (
    <div className="w-full space-y-4">
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
          aria-describedby={
            `${errorId ?? ''} ${userErrorId ?? ''}`.trim() || undefined
          }
          aria-invalid={hasError || hasUserError}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none md:max-w-[600px]"
        />
      </div>

      {/* User Validation Errors */}
      <ErrorMessage
        validationErrors={userValidation.errors.map((error) => error.message)}
        apiError={userApiError ?? undefined}
        showTechnicalDetails
        /* v8 ignore start */
        onRetry={() => {
          if (orgName && userValidation.isValid) {
            checkUserExistsFunc(orgName);
          }
        }}
        /* v8 ignore end */
      />

      {/* User Existence Status */}
      <AvailabilityIndicator
        isAvailable={userExists === false ? true : null}
        isChecking={isCheckingUser}
      />

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
    </div>
  );
}
