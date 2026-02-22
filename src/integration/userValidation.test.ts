import { act, renderHook } from '@testing-library/react';
import { useUserExistenceChecker } from 'src/hooks/useUserExistenceChecker';
import { checkUserExists } from 'src/utils/npmRegistry';
import { validateOrganizationName } from 'src/utils/validation';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock the npm registry utilities
vi.mock('src/utils/npmRegistry', () => ({
  checkUserExists: vi.fn(),
  createApiError: vi.fn(),
}));

describe('User Validation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Validation + API Integration', () => {
    it('should not call API for invalid user names', () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      // Test various invalid inputs
      const invalidInputs = [
        '', // Empty
        '1invalid', // Starts with number
        '-invalid', // Starts with hyphen
        '_invalid', // Starts with underscore
        'invalid-', // Ends with hyphen
        'invalid_', // Ends with underscore
        'invalid--name', // Consecutive hyphens
        'Invalid', // Uppercase
        'invalid@name', // Invalid characters
        'npm', // Reserved word
      ];

      for (const input of invalidInputs) {
        const validation = validateOrganizationName(input);
        expect(validation.isValid).toBe(false);
        expect(mockCheckUserExists).not.toHaveBeenCalled();
      }
    });

    it('should call API only for valid user names', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Test valid inputs
      const validInputs = [
        'validuser',
        'valid-user',
        'valid_user',
        'valid-user_name123',
        'a', // Single character
        'user123',
        'my-user-name',
        'my_user_name',
        'my-user_name_test',
      ];

      for (const input of validInputs) {
        const validation = validateOrganizationName(input);
        expect(validation.isValid).toBe(true);

        // Reset mock before each API call
        mockCheckUserExists.mockClear();

        // Trigger user existence check
        act(() => {
          result.current.checkUserExists(input);
        });

        await act(async () => {
          await vi.runAllTimersAsync();
        });

        expect(mockCheckUserExists).toHaveBeenCalledWith(input);
        expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle validation errors before API calls', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Start with valid input
      act(() => {
        result.current.checkUserExists('valid-user');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
      expect(result.current.userExists).toBe(false);

      // Now try invalid input
      mockCheckUserExists.mockClear();
      act(() => {
        result.current.checkUserExists('1invalid');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should not call API for invalid input
      expect(mockCheckUserExists).not.toHaveBeenCalled();
      // State should remain from previous valid check
      expect(result.current.userExists).toBe(false);
    });

    it('should handle API errors gracefully with validation context', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      const { createApiError } = await import('src/utils/npmRegistry');
      const mockCreateApiError = vi.mocked(createApiError);
      const networkError = new Error('Network error');
      const apiError = {
        type: 'NETWORK_ERROR' as const,
        message: 'Network error',
        timestamp: new Date(),
      };

      mockCheckUserExists.mockRejectedValueOnce(networkError);
      mockCreateApiError.mockReturnValue(apiError);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Use valid input to trigger API call
      act(() => {
        result.current.checkUserExists('valid-user');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isChecking).toBe(false);
      expect(result.current.userExists).toBeNull();
      expect(result.current.apiError).toEqual(apiError);
      expect(mockCreateApiError).toHaveBeenCalledWith(networkError);
    });
  });

  describe('Real-time Validation Flow', () => {
    it('should handle rapid typing with debouncing', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 300 }),
      );

      // Simulate rapid typing
      act(() => {
        result.current.checkUserExists('a');
      });

      act(() => {
        vi.advanceTimersByTime(100);
        result.current.checkUserExists('ab');
      });

      act(() => {
        vi.advanceTimersByTime(100);
        result.current.checkUserExists('abc');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should only call API once for the final input
      expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
      expect(mockCheckUserExists).toHaveBeenCalledWith('abc');
    });

    it('should cancel previous calls when new input arrives', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 300 }),
      );

      // First call
      act(() => {
        result.current.checkUserExists('first-input');
      });

      // Second call before first completes
      act(() => {
        vi.advanceTimersByTime(150);
        result.current.checkUserExists('second-input');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should only call for the second input
      expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
      expect(mockCheckUserExists).toHaveBeenCalledWith('second-input');
    });

    it('should maintain validation state during API calls', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);

      // Mock a delayed response
      mockCheckUserExists.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => {
              resolve(false);
            }, 1000),
          ),
      );

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Start API call
      act(() => {
        result.current.checkUserExists('valid-user');
      });

      // Should be checking immediately
      expect(result.current.isChecking).toBe(true);
      expect(result.current.userExists).toBeNull();

      // Advance time but don't complete the call yet
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should still be checking
      expect(result.current.isChecking).toBe(true);
      expect(result.current.userExists).toBeNull();

      // Complete the call
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should be done checking
      expect(result.current.isChecking).toBe(false);
      expect(result.current.userExists).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty input correctly', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Try empty input
      act(() => {
        result.current.checkUserExists('');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should not call API for empty input
      expect(mockCheckUserExists).not.toHaveBeenCalled();
      expect(result.current.userExists).toBeNull();
    });

    it('should handle whitespace-only input correctly', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(false);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Try whitespace-only input
      act(() => {
        result.current.checkUserExists('   ');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Should not call API for whitespace-only input
      expect(mockCheckUserExists).not.toHaveBeenCalled();
      expect(result.current.userExists).toBeNull();
    });

    it('should reset state correctly', async () => {
      const mockCheckUserExists = vi.mocked(checkUserExists);
      mockCheckUserExists.mockResolvedValue(true);

      const { result } = renderHook(() =>
        useUserExistenceChecker({ debounceMs: 0 }),
      );

      // Perform a successful check
      act(() => {
        result.current.checkUserExists('valid-user');
      });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.userExists).toBe(true);
      expect(result.current.lastChecked).toBeInstanceOf(Date);

      // Reset state
      act(() => {
        result.current.reset();
      });

      expect(result.current.userExists).toBeNull();
      expect(result.current.isChecking).toBe(false);
      expect(result.current.apiError).toBeNull();
      expect(result.current.lastChecked).toBeNull();
    });
  });
});
