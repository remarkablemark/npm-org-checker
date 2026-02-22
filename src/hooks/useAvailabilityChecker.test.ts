import { act, renderHook } from '@testing-library/react';
import { ApiErrorType } from 'src/types';
import { checkNameAvailability, createApiError } from 'src/utils/npmRegistry';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { useAvailabilityChecker } from './useAvailabilityChecker';

// Mock the npm registry utilities
vi.mock('src/utils/npmRegistry', () => ({
  checkNameAvailability: vi.fn(),
  createApiError: vi.fn(),
}));

describe('useAvailabilityChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAvailabilityChecker());

    expect(result.current.isAvailable).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeNull();
  });

  it('should check availability for valid organization name', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkAvailability('test-org');
    });

    // With 0 debounce, checking should start immediately
    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBe(true);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeInstanceOf(Date);
    expect(mockCheckNameAvailability).toHaveBeenCalledWith('test-org');
  });

  it('should handle taken organization name', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useAvailabilityChecker());

    act(() => {
      result.current.checkAvailability('taken-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeInstanceOf(Date);
  });

  it('should handle network errors', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    const mockCreateApiError = vi.mocked(createApiError);
    const networkError = new Error('Network error');
    const apiError = {
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Network error',
      timestamp: new Date(),
    };

    mockCheckNameAvailability.mockRejectedValueOnce(networkError);
    mockCreateApiError.mockReturnValueOnce(apiError);

    const { result } = renderHook(() => useAvailabilityChecker());

    act(() => {
      result.current.checkAvailability('test-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
    expect(result.current.apiError).toEqual(apiError);
    expect(result.current.lastChecked).toBeNull();
    expect(mockCreateApiError).toHaveBeenCalledWith(networkError);
  });

  it('should debounce availability checks', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 300 }),
    );

    act(() => {
      result.current.checkAvailability('test-org');
    });

    // Should not check immediately due to debounce
    expect(mockCheckNameAvailability).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);

    // Fast-forward through debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckNameAvailability).toHaveBeenCalledWith('test-org');
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBe(true);
  });

  it('should cancel previous debounced check when new check is called', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 300 }),
    );

    act(() => {
      result.current.checkAvailability('first-org');
    });

    act(() => {
      vi.advanceTimersByTime(150);
      result.current.checkAvailability('second-org');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should only check the second org name
    expect(mockCheckNameAvailability).toHaveBeenCalledTimes(1);
    expect(mockCheckNameAvailability).toHaveBeenCalledWith('second-org');
  });

  it('should not check availability for empty string', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);

    const { result } = renderHook(() => useAvailabilityChecker());

    act(() => {
      result.current.checkAvailability('');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should not call checkAvailability due to early return in performCheck
    expect(mockCheckNameAvailability).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
  });

  it('should not check availability for whitespace-only string', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkAvailability('   ');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckNameAvailability).not.toHaveBeenCalled();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
  });

  it('should reset state correctly', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useAvailabilityChecker());

    // First, perform a check
    act(() => {
      result.current.checkAvailability('test-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.lastChecked).toBeInstanceOf(Date);

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isAvailable).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.apiError).toBeNull();
    expect(result.current.lastChecked).toBeNull();
  });

  it('should handle multiple rapid calls correctly', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 100 }),
    );

    act(() => {
      result.current.checkAvailability('org1');
      result.current.checkAvailability('org2');
      result.current.checkAvailability('org3');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Should only check the last one
    expect(mockCheckNameAvailability).toHaveBeenCalledTimes(1);
    expect(mockCheckNameAvailability).toHaveBeenCalledWith('org3');
  });

  it('should clear previous error when new check succeeds', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    const mockCreateApiError = vi.mocked(createApiError);

    // First call fails
    mockCheckNameAvailability.mockRejectedValueOnce(new Error('Network error'));
    mockCreateApiError.mockReturnValueOnce({
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Network error',
      timestamp: new Date(),
    });

    const { result } = renderHook(() => useAvailabilityChecker());

    act(() => {
      result.current.checkAvailability('test-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.apiError).not.toBeNull();

    // Second call succeeds
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    act(() => {
      result.current.checkAvailability('test-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.apiError).toBeNull();
    expect(result.current.isAvailable).toBe(true);
  });

  it('should use default debounce time when not specified', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    mockCheckNameAvailability.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useAvailabilityChecker());

    act(() => {
      result.current.checkAvailability('test-org');
    });

    // Default debounce is 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockCheckNameAvailability).toHaveBeenCalledWith('test-org');
  });

  it('should handle error in performCheck function correctly', async () => {
    const mockCheckNameAvailability = vi.mocked(checkNameAvailability);
    const mockCreateApiError = vi.mocked(createApiError);
    const testError = new Error('Test error');
    const apiError = {
      type: ApiErrorType.NETWORK_ERROR,
      message: 'Test error',
      timestamp: new Date(),
    };

    mockCheckNameAvailability.mockRejectedValueOnce(testError);
    mockCreateApiError.mockReturnValueOnce(apiError);

    const { result } = renderHook(() =>
      useAvailabilityChecker({ debounceMs: 0 }),
    );

    act(() => {
      result.current.checkAvailability('test-org');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isAvailable).toBeNull();
    expect(result.current.apiError).toEqual(apiError);
    expect(result.current.lastChecked).toBeNull();
    expect(mockCreateApiError).toHaveBeenCalledWith(testError);
  });
});
