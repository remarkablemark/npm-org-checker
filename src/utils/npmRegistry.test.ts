import { ApiErrorType } from 'src/types';
import { describe, expect, test, vi } from 'vitest';

import { checkAvailability, createApiError } from './npmRegistry';

// Mock fetch globally
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

describe('checkAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return true when organization name is available (404)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as Response);

    const result = await checkAvailability('available-org');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://www.npmjs.com/org/available-org',
      {
        method: 'HEAD',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  test('should return false when organization name is taken (200)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
    } as Response);

    const result = await checkAvailability('taken-org');

    expect(result).toBe(false);
  });

  test('should handle network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(checkAvailability('test-org')).rejects.toThrow(
      'Network error',
    );
  });

  test('should handle CORS errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(checkAvailability('test-org')).rejects.toThrow(
      'Failed to fetch',
    );
  });

  test('should handle timeout errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new DOMException('Timeout', 'AbortError'));

    await expect(checkAvailability('test-org')).rejects.toThrow('Timeout');
  });

  test('should handle server errors (500)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 500,
      ok: false,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(checkAvailability('test-org')).rejects.toThrow(
      'Internal Server Error',
    );
  });

  test('should handle timeout errors', async () => {
    const mockFetch = vi.mocked(fetch);

    // Mock fetch to reject with AbortError
    mockFetch.mockRejectedValueOnce(
      new DOMException('Request timeout', 'AbortError'),
    );

    await expect(checkAvailability('test-org')).rejects.toThrow(
      'Request timeout',
    );
  });

  test('should handle unknown errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce('string error');

    await expect(checkAvailability('test-org')).rejects.toThrow(
      'Unknown error occurred',
    );
  });

  test('should use correct URL format', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as Response);

    await checkAvailability('my-test-org');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://www.npmjs.com/org/my-test-org',
      {
        method: 'HEAD',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  test('should handle special characters in organization name', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as Response);

    await checkAvailability('org-with-123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://www.npmjs.com/org/org-with-123',
      {
        method: 'HEAD',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });
});

describe('createApiError', () => {
  test('should create network error', () => {
    const error = new Error('Network connection failed');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.NETWORK_ERROR);
    expect(apiError.message).toBe('Network connection failed');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  test('should create CORS error', () => {
    const error = new TypeError('Failed to fetch');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.CORS_ERROR);
    expect(apiError.message).toBe('Failed to fetch');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  test('should create timeout error', () => {
    const error = new DOMException('Request timeout', 'AbortError');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.TIMEOUT_ERROR);
    expect(apiError.message).toBe('Request timeout');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  test('should create server error with status code', () => {
    const error = new Error('Internal Server Error') as Error & {
      status: number;
    };
    error.status = 500;
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.SERVER_ERROR);
    expect(apiError.message).toBe('Internal Server Error');
    expect(apiError.statusCode).toBe(500);
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  test('should create unknown error for unhandled cases', () => {
    const error = new Error('Unknown error occurred');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.UNKNOWN_ERROR);
    expect(apiError.message).toBe('Unknown error occurred');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });
});
