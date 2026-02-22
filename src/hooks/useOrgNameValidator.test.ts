import { act, renderHook } from '@testing-library/react';
import { ValidationErrorType } from 'src/types';
import { describe, expect } from 'vitest';

import { useOrgNameValidator } from './useOrgNameValidator';

describe('useOrgNameValidator', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    expect(result.current.value).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toHaveLength(0);
    expect(result.current.isDirty).toBe(false);
  });

  it('should validate a correct organization name', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('my-org');
    });

    expect(result.current.value).toBe('my-org');
    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toHaveLength(0);
    expect(result.current.isDirty).toBe(true);
  });

  it('should validate empty string and show too short error', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('');
    });

    expect(result.current.value).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors.length).toBeGreaterThan(0);
    expect(result.current.isDirty).toBe(true);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.TOO_SHORT,
      ),
    ).toBe(true);
  });

  it('should validate name that is too long', () => {
    const { result } = renderHook(() => useOrgNameValidator());
    const longName = 'a'.repeat(215);

    act(() => {
      result.current.setValue(longName);
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.TOO_LONG,
      ),
    ).toBe(true);
  });

  it('should validate name starting with number', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('1org');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.INVALID_START,
      ),
    ).toBe(true);
  });

  it('should validate name starting with hyphen', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('-org');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.INVALID_START,
      ),
    ).toBe(true);
  });

  it('should validate name ending with hyphen', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('org-');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.INVALID_END,
      ),
    ).toBe(true);
  });

  it('should validate name with consecutive hyphens', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('org--name');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.CONSECUTIVE_HYPHENS,
      ),
    ).toBe(true);
  });

  it('should validate name with uppercase letters', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('MyOrg');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.INVALID_CHARACTERS,
      ),
    ).toBe(true);
  });

  it('should validate reserved words', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('npm');
    });

    expect(result.current.isValid).toBe(false);
    expect(
      result.current.validationErrors.some(
        (error) => error.type === ValidationErrorType.RESERVED_WORD,
      ),
    ).toBe(true);
  });

  it('should clear validation errors when valid name is set', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    // Set invalid name first
    act(() => {
      result.current.setValue('1org');
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors.length).toBeGreaterThan(0);

    // Then set valid name
    act(() => {
      result.current.setValue('valid-org');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toHaveLength(0);
  });

  it('should handle whitespace correctly', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('  my-org  ');
    });

    expect(result.current.value).toBe('  my-org  ');
    expect(result.current.isValid).toBe(true); // Should trim for validation
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    // Set a value first
    act(() => {
      result.current.setValue('my-org');
    });

    expect(result.current.value).toBe('my-org');
    expect(result.current.isDirty).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('');
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toHaveLength(0);
    expect(result.current.isDirty).toBe(false);
  });

  it('should validate single character names', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('a');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toHaveLength(0);
  });

  it('should validate names with numbers', () => {
    const { result } = renderHook(() => useOrgNameValidator());

    act(() => {
      result.current.setValue('org123');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toHaveLength(0);
  });
});
