import { ValidationErrorType } from 'src/types';

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

  // Scope name validation tests - verify existing validation works for scopes
  it('should validate correct scope names', () => {
    const scopeNames = [
      'angular',
      'react',
      'vue',
      'my-scope',
      'test123',
      'scope_name',
    ];

    scopeNames.forEach((scopeName) => {
      const result = validateOrganizationName(scopeName);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should reject invalid scope names with consecutive hyphens', () => {
    const result = validateOrganizationName('scope--name');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.CONSECUTIVE_HYPHENS,
      ),
    ).toBe(true);
  });

  it('should reject scope names starting with hyphen', () => {
    const result = validateOrganizationName('-scope');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_START),
    ).toBe(true);
  });

  it('should reject scope names ending with hyphen', () => {
    const result = validateOrganizationName('scope-');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.type === ValidationErrorType.INVALID_END),
    ).toBe(true);
  });

  it('should reject scope names with uppercase letters', () => {
    const result = validateOrganizationName('MyScope');

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some(
        (e) => e.type === ValidationErrorType.INVALID_CHARACTERS,
      ),
    ).toBe(true);
  });

  it('should reject reserved words as scope names', () => {
    const reservedWords = ['npm', 'node', 'package', 'module'];

    reservedWords.forEach((word) => {
      const result = validateOrganizationName(word);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.type === ValidationErrorType.RESERVED_WORD),
      ).toBe(true);
    });
  });
});

// User Story 1: Unified Name Validation Tests
// These tests verify that validateOrganizationName works for all name types
describe('Unified Name Validation (User Story 1)', () => {
  describe('valid organization names', () => {
    it('should accept valid organization names', () => {
      const validOrgNames = ['my-org', 'testorg', 'company123', 'org_name'];

      validOrgNames.forEach((orgName) => {
        const result = validateOrganizationName(orgName);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('valid scope names', () => {
    it('should accept valid scope names', () => {
      const validScopeNames = [
        'angular',
        'react',
        'vue',
        'my-scope',
        'test123',
      ];

      validScopeNames.forEach((scopeName) => {
        const result = validateOrganizationName(scopeName);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('invalid formats', () => {
    it('should reject names with uppercase letters', () => {
      const invalidNames = ['MyOrg', 'MyScope', 'TEST-ORG'];

      invalidNames.forEach((name) => {
        const result = validateOrganizationName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should reject names starting with numbers', () => {
      const invalidNames = ['123org', '123scope', '1test'];

      invalidNames.forEach((name) => {
        const result = validateOrganizationName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should reject names with special characters', () => {
      const invalidNames = ['org@name', 'scope#test', 'test$org', 'org%name'];

      invalidNames.forEach((name) => {
        const result = validateOrganizationName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const result = validateOrganizationName('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only strings', () => {
      const result = validateOrganizationName('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle extremely long names', () => {
      const longName = 'a'.repeat(215);
      const result = validateOrganizationName(longName);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle names with consecutive hyphens', () => {
      const result = validateOrganizationName('org--name');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle names starting with hyphen', () => {
      const result = validateOrganizationName('-org');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle names ending with hyphen', () => {
      const result = validateOrganizationName('org-');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
