import { ApiErrorType } from 'src/types';

import {
  checkOrgAvailability,
  checkUserExists,
  createApiError,
} from './npmRegistry';

// Mock fetch globally
Object.defineProperty(globalThis, 'fetch', {
  value: vi.fn(),
  writable: true,
  configurable: true,
});

describe('checkOrgAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when organization name is available (404)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as unknown as Response);

    const result = await checkOrgAvailability('available-org');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://www.npmjs.com/org/available-org',
      {
        method: 'HEAD',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should return false when organization name is taken (200)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
    } as unknown as Response);

    const result = await checkOrgAvailability('taken-org');

    expect(result).toBe(false);
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(checkOrgAvailability('test-org')).rejects.toThrow(
      'Network error',
    );
  });

  it('should handle CORS errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(checkOrgAvailability('test-org')).rejects.toThrow(
      'Failed to fetch',
    );
  });

  it('should handle timeout errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new DOMException('Timeout', 'AbortError'));

    await expect(checkOrgAvailability('test-org')).rejects.toThrow('Timeout');
  });

  it('should handle server errors (500)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 500,
      ok: false,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    await expect(checkOrgAvailability('test-org')).rejects.toThrow(
      'Internal Server Error',
    );
  });

  it('should handle unknown errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce('string error');

    await expect(checkOrgAvailability('test-org')).rejects.toThrow(
      'Unknown error occurred',
    );
  });

  it('should use correct URL format', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as unknown as Response);

    await checkOrgAvailability('my-test-org');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://www.npmjs.com/org/my-test-org',
      {
        method: 'HEAD',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should handle special characters in organization name', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as unknown as Response);

    await checkOrgAvailability('org-with-123');

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
  it('should create network error', () => {
    const error = new Error('Network connection failed');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.NETWORK_ERROR);
    expect(apiError.message).toBe('Network connection failed');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  it('should create CORS error', () => {
    const error = new TypeError('Failed to fetch');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.CORS_ERROR);
    expect(apiError.message).toBe('Failed to fetch');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  it('should create timeout error', () => {
    const error = new DOMException('Request timeout', 'AbortError');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.TIMEOUT_ERROR);
    expect(apiError.message).toBe('Request timeout');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });

  it('should create server error with status code', () => {
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

  it('should create unknown error for unhandled cases', () => {
    const error = new Error('Unknown error occurred');
    const apiError = createApiError(error);

    expect(apiError.type).toBe(ApiErrorType.UNKNOWN_ERROR);
    expect(apiError.message).toBe('Unknown error occurred');
    expect(apiError.statusCode).toBeUndefined();
    expect(apiError.timestamp).toBeInstanceOf(Date);
  });
});

describe('checkUserExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when user exists (packages found)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [
          {
            package: {
              name: 'test-package',
              version: '1.0.0',
              description: 'Test',
            },
            score: {
              final: 0.5,
              detail: { quality: 0.5, popularity: 0.5, maintenance: 0.5 },
            },
            searchScore: 0.5,
          },
        ],
        total: 1,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    const result = await checkUserExists('existing-user');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://registry.npmjs.org/-/v1/search?text=author:existing-user&size=1',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should return false when user does not exist (no packages)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    const result = await checkUserExists('non-existing-user');

    expect(result).toBe(false);
  });

  it('should handle empty objects array', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    const result = await checkUserExists('test-user');

    expect(result).toBe(false);
  });

  it('should handle malformed response (missing objects)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    const result = await checkUserExists('test-user');

    expect(result).toBe(false);
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(checkUserExists('test-user')).rejects.toThrow('Network error');
  });

  it('should handle CORS errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(checkUserExists('test-user')).rejects.toThrow(
      'Failed to fetch',
    );
  });

  it('should handle timeout errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new DOMException('Timeout', 'AbortError'));

    await expect(checkUserExists('test-user')).rejects.toThrow('Timeout');
  });

  it('should handle server errors (500)', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 500,
      ok: false,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    await expect(checkUserExists('test-user')).rejects.toThrow(
      'Internal Server Error',
    );
  });

  it('should handle HTTP 403 errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 403,
      ok: false,
      statusText: 'Forbidden',
    } as unknown as Response);

    await expect(checkUserExists('test-user')).rejects.toThrow('Forbidden');
  });

  it('should handle unknown errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce('string error');

    await expect(checkUserExists('test-user')).rejects.toThrow(
      'Unknown error occurred',
    );
  });

  it('should use correct URL format', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    await checkUserExists('my-test-user');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://registry.npmjs.org/-/v1/search?text=author:my-test-user&size=1',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should handle special characters in user name', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    await checkUserExists('user-with-123');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://registry.npmjs.org/-/v1/search?text=author:user-with-123&size=1',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should handle user names with underscores', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    await checkUserExists('user_name_test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https://registry.npmjs.org/-/v1/search?text=author:user_name_test&size=1',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  it('should handle JSON parsing errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
    } as unknown as Response);

    await expect(checkUserExists('test-user')).rejects.toThrow('Invalid JSON');
  });
});
