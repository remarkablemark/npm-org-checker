import { ValidationErrorType } from 'src/types';

import { validateOrganizationName, validateUserName } from './validation';

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

describe('validateUserName', () => {
  it('should validate a correct user name', () => {
    const result = validateUserName('my-user');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should validate a user name with underscores', () => {
    const result = validateUserName('my_user');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should validate a user name with mixed hyphens and underscores', () => {
    const result = validateUserName('my-user_name');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('should reject empty string with multiple error types', () => {
    const result = validateUserName('');

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);

    const errorTypes = result.errors.map((e) => e.type);
    expect(errorTypes).toContain(ValidationErrorType.EMPTY);
    expect(errorTypes).toContain(ValidationErrorType.TOO_SHORT);
  });

  it('should reject whitespace-only string', () => {
    const result = validateUserName('   ');

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);

    const errorTypes = result.errors.map((e) => e.type);
    expect(errorTypes).toContain(ValidationErrorType.EMPTY);
    expect(errorTypes).toContain(ValidationErrorType.TOO_SHORT);
  });

  it('should reject names that are too short', () => {
    const result = validateUserName('');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.TOO_SHORT),
    ).toBe(true);
  });

  it('should reject names that are too long', () => {
    const longName = 'a'.repeat(215);
    const result = validateUserName(longName);

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.TOO_LONG),
    ).toBe(true);
  });

  it('should reject names starting with a number', () => {
    const result = validateUserName('1user');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject names starting with a hyphen', () => {
    const result = validateUserName('-user');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject names starting with an underscore', () => {
    const result = validateUserName('_user');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject names ending with a hyphen', () => {
    const result = validateUserName('user-');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_END),
    ).toBe(true);
  });

  it('should reject names ending with an underscore', () => {
    const result = validateUserName('user_');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_END),
    ).toBe(true);
  });

  it('should reject names with consecutive hyphens', () => {
    const result = validateUserName('user--name');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.CONSECUTIVE_HYPHENS,
      ),
    ).toBe(true);
  });

  it('should reject names with uppercase letters', () => {
    const result = validateUserName('MyUser');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.INVALID_CHARACTERS,
      ),
    ).toBe(true);
  });

  it('should reject names with invalid characters', () => {
    const result = validateUserName('user@name');

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
      const result = validateUserName(word);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.type === ValidationErrorType.RESERVED_WORD),
      ).toBe(true);
    });
  });

  it('should accept valid single character names', () => {
    const result = validateUserName('a');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with numbers', () => {
    const result = validateUserName('user123');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with hyphens', () => {
    const result = validateUserName('my-user-name');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with underscores', () => {
    const result = validateUserName('my_user_name');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid names with mixed hyphens and underscores', () => {
    const result = validateUserName('my-user_name_test');

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept maximum length valid names', () => {
    const validName = 'a' + 'b'.repeat(212) + 'c'; // 214 characters
    const result = validateUserName(validName);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should have user-specific error messages', () => {
    const result = validateUserName('');

    expect(result.errors.some((e) => e.message.includes('User name'))).toBe(
      true,
    );
  });
});
