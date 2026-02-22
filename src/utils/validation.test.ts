import { ValidationErrorType } from 'src/types';
import { describe, expect } from 'vitest';

import { validateOrganizationName } from './validation';

describe('validateOrganizationName', () => {
  it('should validate a correct organization name', () => {
    const result = validateOrganizationName('my-org');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should reject empty string with multiple error types', () => {
    const result = validateOrganizationName('');

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);

    const errorTypes = result.errors.map((e) => e.type);
    expect(errorTypes).toContain(ValidationErrorType.EMPTY);
    expect(errorTypes).toContain(ValidationErrorType.TOO_SHORT);
  });

  it('should reject whitespace-only string', () => {
    const result = validateOrganizationName('   ');

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);

    const errorTypes = result.errors.map((e) => e.type);
    expect(errorTypes).toContain(ValidationErrorType.EMPTY);
    expect(errorTypes).toContain(ValidationErrorType.TOO_SHORT);
  });

  it('should reject names that are too short', () => {
    const result = validateOrganizationName('');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.TOO_SHORT),
    ).toBe(true);
  });

  it('should reject names that are too long', () => {
    const longName = 'a'.repeat(215);
    const result = validateOrganizationName(longName);

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.TOO_LONG),
    ).toBe(true);
  });

  it('should reject names starting with a number', () => {
    const result = validateOrganizationName('1org');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject names starting with a hyphen', () => {
    const result = validateOrganizationName('-org');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject names ending with a hyphen', () => {
    const result = validateOrganizationName('org-');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_END),
    ).toBe(true);
  });

  it('should reject names with consecutive hyphens', () => {
    const result = validateOrganizationName('org--name');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.CONSECUTIVE_HYPHENS,
      ),
    ).toBe(true);
  });

  it('should reject names with uppercase letters', () => {
    const result = validateOrganizationName('MyOrg');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.INVALID_CHARACTERS,
      ),
    ).toBe(true);
  });

  it('should reject names with invalid characters', () => {
    const result = validateOrganizationName('org_name');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.INVALID_CHARACTERS,
      ),
    ).toBe(true);
  });

  it('should reject reserved words', () => {
    const reservedWords = ['npm', 'node', 'package', 'module'];

    reservedWords.forEach((word) => {
      const result = validateOrganizationName(word);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.type === ValidationErrorType.RESERVED_WORD),
      ).toBe(true);
    });
  });

  it('should accept valid single character names', () => {
    const result = validateOrganizationName('a');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with numbers', () => {
    const result = validateOrganizationName('org123');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with hyphens', () => {
    const result = validateOrganizationName('my-org-name');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept maximum length valid names', () => {
    const validName = 'a' + 'b'.repeat(212) + 'c'; // 214 characters
    const result = validateOrganizationName(validName);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
