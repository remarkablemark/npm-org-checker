import type { ValidationError } from 'src/types';
import { ValidationErrorType, type ValidationResult } from 'src/types';

const MIN_LENGTH = 1;
const MAX_LENGTH = 214;
const ORG_NAME_PATTERN = /^[a-z][a-z0-9-_]*[a-z0-9]$/;
const RESERVED_WORDS = ['npm', 'node', 'package', 'module'];

/**
 * Validates a unified name according to npm's naming rules.
 *
 * This function provides comprehensive validation for all npm name types:
 * 1. User names (e.g., "username")
 * 2. Scope names (e.g., "angular", "types")
 * 3. Organization names (e.g., "my-org")
 *
 * The same validation rules apply to all name types - no format detection needed.
 *
 * Validation Rules:
 * - Length: Must be between 1-214 characters
 * - Pattern: Must start with lowercase letter, contain only lowercase letters, numbers, hyphens, and underscores
 * - Hyphens: No consecutive hyphens allowed
 * - Endings: Must end with lowercase letter or number (not hyphen)
 * - Reserved: Cannot use npm reserved words (npm, node, package, module)
 *
 * The function returns a ValidationResult containing:
 * - isValid: Boolean indicating if name passes all validation
 * - errors: Array of ValidationError objects for failed rules
 * - warnings: Array of ValidationError objects for non-critical issues
 *
 * @example
 * ```typescript
 * import { validateOrganizationName } from './validation';
 *
 * // Works for all name types - organizations, scopes, and users
 * const userResult = validateOrganizationName('username');
 * const scopeResult = validateOrganizationName('angular');
 * const orgResult = validateOrganizationName('my-org');
 *
 * if (orgResult.isValid) {
 *   console.log('Organization name is valid!');
 * } else {
 *   console.log('Errors:', orgResult.errors.map(e => e.message));
 * }
 * ```
 *
 * @param name - The name to validate (works for users, scopes, or organizations)
 * @returns ValidationResult with validation status and detailed error information
 */
export function validateOrganizationName(name: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if empty
  if (!name || name.trim() === '') {
    errors.push({
      type: ValidationErrorType.EMPTY,
      message: 'Name is required',
    });
    errors.push({
      type: ValidationErrorType.TOO_SHORT,
      message: `Name must be at least ${MIN_LENGTH.toString()} character long`,
    });
    return { isValid: false, errors, warnings };
  }

  const trimmedName = name.trim();

  // Check length
  /* v8 ignore start */
  if (trimmedName.length < MIN_LENGTH) {
    errors.push({
      type: ValidationErrorType.TOO_SHORT,
      message: `Name must be at least ${MIN_LENGTH.toString()} character long`,
    });
  }
  /* v8 ignore end */

  if (trimmedName.length > MAX_LENGTH) {
    errors.push({
      type: ValidationErrorType.TOO_LONG,
      message: `Name cannot exceed ${MAX_LENGTH.toString()} characters`,
    });
  }

  // Check consecutive hyphens (separate from pattern check for better error messages)
  if (trimmedName.includes('--')) {
    errors.push({
      type: ValidationErrorType.CONSECUTIVE_HYPHENS,
      message: 'Name cannot contain consecutive hyphens',
    });
  }

  // Check pattern
  if (!ORG_NAME_PATTERN.test(trimmedName)) {
    // Check specific pattern violations for better error messages
    if (!/^[a-z]/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_START,
        message: 'Name must start with a lowercase letter',
      });
    }

    if (!/[a-z0-9]$/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_END,
        message: 'Name must end with a lowercase letter or number',
      });
    }

    if (/[A-Z]/.test(trimmedName) || /[^a-z0-9-_]/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_CHARACTERS,
        message:
          'Name can only contain lowercase letters, numbers, hyphens, and underscores',
      });
    }
  }

  // Check reserved words
  if (RESERVED_WORDS.some((word) => word === trimmedName)) {
    errors.push({
      type: ValidationErrorType.RESERVED_WORD,
      message: `"${trimmedName}" is a reserved word and cannot be used as a name`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
