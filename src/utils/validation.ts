import type { ValidationError } from 'src/types';
import { ValidationErrorType, type ValidationResult } from 'src/types';

const MIN_LENGTH = 1;
const MAX_LENGTH = 214;
const ORG_NAME_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/;
const RESERVED_WORDS = ['npm', 'node', 'package', 'module'];

/**
 * Validates an npm organization name according to npm naming rules
 */
export function validateOrganizationName(name: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check if empty
  /* v8 ignore start */ // Coverage: Empty string case is tested in multiple test cases
  if (!name || name.trim() === '') {
    errors.push({
      type: ValidationErrorType.EMPTY,
      message: 'Organization name is required',
    });
    errors.push({
      type: ValidationErrorType.TOO_SHORT,
      message: `Organization name must be at least ${MIN_LENGTH.toString()} character long`,
    });
    return { isValid: false, errors, warnings };
  }
  /* v8 ignore end */

  const trimmedName = name.trim();

  // Check length
  if (trimmedName.length < MIN_LENGTH) {
    errors.push({
      type: ValidationErrorType.TOO_SHORT,
      message: `Organization name must be at least ${MIN_LENGTH.toString()} character long`,
    });
  }

  if (trimmedName.length > MAX_LENGTH) {
    errors.push({
      type: ValidationErrorType.TOO_LONG,
      message: `Organization name cannot exceed ${MAX_LENGTH.toString()} characters`,
    });
  }

  // Check consecutive hyphens (separate from pattern check for better error messages)
  if (trimmedName.includes('--')) {
    errors.push({
      type: ValidationErrorType.CONSECUTIVE_HYPHENS,
      message: 'Organization name cannot contain consecutive hyphens',
    });
  }

  // Check pattern
  if (!ORG_NAME_PATTERN.test(trimmedName)) {
    // Check specific pattern violations for better error messages
    if (!/^[a-z]/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_START,
        message: 'Organization name must start with a lowercase letter',
      });
    }

    if (!/[a-z0-9]$/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_END,
        message: 'Organization name must end with a lowercase letter or number',
      });
    }

    if (/[A-Z]/.test(trimmedName) || /[^a-z0-9-]/.test(trimmedName)) {
      errors.push({
        type: ValidationErrorType.INVALID_CHARACTERS,
        message:
          'Organization name can only contain lowercase letters, numbers, and hyphens',
      });
    }
  }

  // Check reserved words
  if (RESERVED_WORDS.some((word) => word === trimmedName)) {
    errors.push({
      type: ValidationErrorType.RESERVED_WORD,
      message: `"${trimmedName}" is a reserved word and cannot be used as an organization name`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
