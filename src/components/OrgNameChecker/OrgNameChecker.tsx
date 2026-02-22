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
 * - Debounced availability checking via npm registry API
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
 * @param onAvailabilityChange - Optional callback fired when availability status changes
 * @param onValidationError - Optional callback fired when validation errors occur
 * @param placeholder - Placeholder text for the input field (default: "Enter npm organization name")
 * @param autoFocus - Whether the input should be auto-focused on mount (default: false)
 *
 * @returns A complete form interface with input, validation, and availability feedback
 */
export function OrgNameChecker({
  onAvailabilityChange,
  onValidationError,
  onUserExistenceChange,
  onUserValidationError,
  userPlaceholder = 'Enter npm user name',
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
  const [userName, setUserName] = useState('');
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

  // Notify parent of validation errors
  useEffect(() => {
    onValidationError?.(validationErrors.map((error) => error.message));
  }, [validationErrors, onValidationError]);

  // Notify parent of user existence changes
  useEffect(() => {
    onUserExistenceChange?.(userExists);
  }, [userExists, onUserExistenceChange]);

  // Notify parent of user validation errors
  useEffect(() => {
    onUserValidationError?.(
      userValidation.errors.map((error) => error.message),
    );
  }, [userValidation.errors, onUserValidationError]);

  // Handle user name input change
  const handleUserInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setUserName(value);
    const validation = validateUserName(value);
    setUserValidation(validation);

    // If user validation passes, check user existence
    if (validation.isValid) {
      checkUserExistsFunc(value);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setOrgName(value);

    // Note: checkAvailability is already debounced in the hook
    // We call it on every change and let the hook handle debouncing
    /* v8 ignore start */
    if (value) {
      checkAvailability(value);
    }
    /* v8 ignore end */
  };

  const errorId = validationErrors.length > 0 ? 'validation-errors' : undefined;
  const hasError = validationErrors.length > 0;
  const userErrorId =
    userValidation.errors.length > 0 ? 'user-validation-errors' : undefined;
  const hasUserError = userValidation.errors.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* User Name Input */}
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="user-name-input"
          className="text-sm font-medium text-gray-700"
        >
          NPM User Name
        </label>

        <input
          ref={inputRef}
          id="user-name-input"
          type="text"
          value={userName}
          onChange={handleUserInputChange}
          placeholder={userPlaceholder}
          aria-label="User name"
          aria-describedby={userErrorId}
          aria-invalid={hasUserError}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none md:max-w-[600px]"
        />
      </div>

      {/* User Validation Errors */}
      <ErrorMessage
        validationErrors={userValidation.errors.map((error) => error.message)}
        apiError={userApiError ?? undefined}
        showTechnicalDetails
        onRetry={() => {
          if (userName && userValidation.isValid) {
            checkUserExistsFunc(userName);
          }
        }}
      />

      {/* User Existence Status */}
      <AvailabilityIndicator
        isAvailable={userExists === false ? true : null}
        isChecking={isCheckingUser}
      />

      {/* Organization Name Input */}
      <div className="flex flex-col space-y-2">
        <label
          htmlFor="org-name-input"
          className="text-sm font-medium text-gray-700"
        >
          NPM Organization Name
        </label>

        <input
          id="org-name-input"
          type="text"
          value={orgName}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label="Organization name"
          aria-describedby={errorId}
          aria-invalid={hasError}
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-blue-500 focus:outline-none md:max-w-[600px]"
          disabled={!userValidation.isValid || userExists === true}
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
    </div>
  );
}
