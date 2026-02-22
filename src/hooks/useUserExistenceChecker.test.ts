import { act, renderHook } from '@testing-library/react';
import { ApiErrorType } from 'src/types';
import { checkUserExists, createApiError } from 'src/utils/npmRegistry';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { useUserExistenceChecker } from './useUserExistenceChecker';

// Mock the npm registry utilities
vi.mock('src/utils/npmRegistry', () => ({
  checkUserExists: vi.fn(),
  createApiError: vi.fn(),
}));

describe('useUserExistenceChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useUserExistenceChecker());

    expect(result.current.userExists).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeNull();
  });

  it('should check user existence for valid user name', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkUserExists('test-user');
    });

    // With 0 debounce, checking should start immediately
    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBe(true);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeInstanceOf(Date);
    expect(mockCheckUserExists).toHaveBeenCalledWith('test-user');
  });

  it('should handle non-existing user', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('non-existing-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeInstanceOf(Date);
  });

  it('should handle network errors', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    const mockCreateApiError = vi.mocked(createApiError);
    const networkError = new Error('Network error');
    const apiError = {
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Network error',
      timestamp: new Date(),
    };

    mockCheckUserExists.mockRejectedValueOnce(networkError);
    mockCreateApiError.mockReturnValueOnce(apiError);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBeNull();
    expect(result.current.apiError).toEqual(apiError);
    expect(result.current.lastChecked).toBeNull();
    expect(mockCreateApiError).toHaveBeenCalledWith(networkError);
  });

  it('should debounce user existence checks', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 300 }),
    );

    act(() => {
      result.current.checkUserExists('test-user');
    });

    // Should not check immediately due to debounce
    expect(mockCheckUserExists).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);

    // Fast-forward through debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckUserExists).toHaveBeenCalledWith('test-user');
    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBe(true);
  });

  it('should cancel previous debounced check when new check is called', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 300 }),
    );

    act(() => {
      result.current.checkUserExists('first-user');
    });

    act(() => {
      vi.advanceTimersByTime(150);
      result.current.checkUserExists('second-user');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should only check the second user name
    expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
    expect(mockCheckUserExists).toHaveBeenCalledWith('second-user');
  });

  it('should not check user existence for empty string', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not call checkUserExists due to early return in performCheck
    expect(mockCheckUserExists).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBeNull();
  });

  it('should not check user existence for whitespace-only string', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkUserExists('   ');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckUserExists).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBeNull();
  });

  it('should reset state correctly', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useUserExistenceChecker());

    // First, perform a check
    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.userExists).toBe(true);
    expect(result.current.lastChecked).toBeInstanceOf(Date);

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.userExists).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeNull();
  });

  it('should handle multiple rapid calls correctly', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 100 }),
    );

    act(() => {
      result.current.checkUserExists('user1');
      result.current.checkUserExists('user2');
      result.current.checkUserExists('user3');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should only check the last one
    expect(mockCheckUserExists).toHaveBeenCalledTimes(1);
    expect(mockCheckUserExists).toHaveBeenCalledWith('user3');
  });

  it('should clear previous error when new check succeeds', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    const mockCreateApiError = vi.mocked(createApiError);

    // First call fails
    mockCheckUserExists.mockRejectedValueOnce(new Error('Network error'));
    mockCreateApiError.mockReturnValueOnce({
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Network error',
      timestamp: new Date(),
    });

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.apiError).not.toBeNull();

    // Second call succeeds
    mockCheckUserExists.mockResolvedValueOnce(true);

    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.apiError).toBeNull();
    expect(result.current.userExists).toBe(true);
  });

  it('should use default debounce time when not specified', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test-user');
    });

    // Default debounce is 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckUserExists).toHaveBeenCalledWith('test-user');
  });

  it('should handle error in performCheck function correctly', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    const mockCreateApiError = vi.mocked(createApiError);
    const testError = new Error('Test error');
    const apiError = {
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Test error',
      timestamp: new Date(),
    };

    mockCheckUserExists.mockRejectedValueOnce(testError);
    mockCreateApiError.mockReturnValueOnce(apiError);

    const { result } = renderHook(() =>
      useUserExistenceChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.userExists).toBeNull();
    expect(result.current.apiError).toEqual(apiError);
    expect(result.current.lastChecked).toBeNull();
    expect(mockCreateApiError).toHaveBeenCalledWith(testError);
  });

  it('should handle user names with underscores', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test_user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.userExists).toBe(false);
    expect(mockCheckUserExists).toHaveBeenCalledWith('test_user');
  });

  it('should handle user names with hyphens', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test-user');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.userExists).toBe(true);
    expect(mockCheckUserExists).toHaveBeenCalledWith('test-user');
  });

  it('should handle user names with mixed characters', async () => {
    const mockCheckUserExists = vi.mocked(checkUserExists);
    mockCheckUserExists.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useUserExistenceChecker());

    act(() => {
      result.current.checkUserExists('test-user_name123');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.userExists).toBe(true);
    expect(mockCheckUserExists).toHaveBeenCalledWith('test-user_name123');
  });
});
