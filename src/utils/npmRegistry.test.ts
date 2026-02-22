import { ApiErrorType } from 'src/types';

import {
  checkNameAvailability,
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fwww.npmjs.com%2Forg%2Favailable-org',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fwww.npmjs.com%2Forg%2Fmy-test-org',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fwww.npmjs.com%2Forg%2Forg-with-123',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fregistry.npmjs.com%2F-%2Fv1%2Fsearch%3Ftext%3Dauthor%3Aexisting-user%26size%3D1',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fregistry.npmjs.com%2F-%2Fv1%2Fsearch%3Ftext%3Dauthor%3Amy-test-user%26size%3D1',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fregistry.npmjs.com%2F-%2Fv1%2Fsearch%3Ftext%3Dauthor%3Auser-with-123%26size%3D1',
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
      'https://corsmirror.com/v1?url=https%3A%2F%2Fregistry.npmjs.com%2F-%2Fv1%2Fsearch%3Ftext%3Dauthor%3Auser_name_test%26size%3D1',
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

// User Story 2: Scope Checking Tests
// These tests verify the new checkScopeExists function
describe('checkScopeExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when scope exists (packages found)', async () => {
    const mockFetch = vi.mocked(fetch);
    const mockResponse = {
      total_rows: 100,
      offset: 0,
      rows: [
        {
          id: '@scope/package1',
          key: '@scope/package1',
          value: { rev: '1-abc' },
        },
        {
          id: '@scope/package2',
          key: '@scope/package2',
          value: { rev: '2-def' },
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    // Import checkScopeExists after mocking is set up
    const { checkScopeExists } = await import('./npmRegistry');
    const result = await checkScopeExists('angular');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https%3A%2F%2Freplicate.npmjs.com%2F_all_docs%3Fstartkey%3D%22%40angular%2F%22%26endkey%3D%22%40angular%2F%EF%BF%B0%22',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });

  // ... (rest of the code remains the same)

  it('should use correct URL encoding for special characters', async () => {
    const mockFetch = vi.mocked(fetch);
    const mockResponse = {
      total_rows: 0,
      offset: 0,
      rows: [],
    };

    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const { checkScopeExists } = await import('./npmRegistry');
    await checkScopeExists('scope_name-test');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://corsmirror.com/v1?url=https%3A%2F%2Freplicate.npmjs.com%2F_all_docs%3Fstartkey%3D%22%40scope_name-test%2F%22%26endkey%3D%22%40scope_name-test%2F%EF%BF%B0%22',
      {
        method: 'GET',
        signal: expect.any(AbortSignal) as AbortSignal,
      },
    );
  });
});

// User Story 2: Enhanced checkNameAvailability Tests
// These tests verify the enhanced checkNameAvailability function with scope checking
describe('checkNameAvailability with scope checking (User Story 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should stop at user check if user exists', async () => {
    const mockFetch = vi.mocked(fetch);
    // Mock user exists
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [{ package: { name: 'test-package' } }],
        total: 1,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    const result = await checkNameAvailability('taken-username');

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should stop at scope check if scope exists', async () => {
    const mockFetch = vi.mocked(fetch);
    // Mock user doesn't exist
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    // Mock scope exists
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        total_rows: 10,
        offset: 0,
        rows: [
          {
            id: '@scope/package',
            key: '@scope/package',
            value: { rev: '1-abc' },
          },
        ],
      }),
    } as unknown as Response);

    const result = await checkNameAvailability('taken-scope');

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should check all three when none exist', async () => {
    const mockFetch = vi.mocked(fetch);
    // Mock user doesn't exist
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    // Mock scope doesn't exist
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        total_rows: 0,
        offset: 0,
        rows: [],
      }),
    } as unknown as Response);

    // Mock org is available
    mockFetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
    } as unknown as Response);

    const result = await checkNameAvailability('available-name');

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should handle organization conflicts after user and scope checks pass', async () => {
    const mockFetch = vi.mocked(fetch);
    // Mock user doesn't exist
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        objects: [],
        total: 0,
        time: '2026-02-22T00:00:00.000Z',
      }),
    } as unknown as Response);

    // Mock scope doesn't exist
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        total_rows: 0,
        offset: 0,
        rows: [],
      }),
    } as unknown as Response);

    // Mock org is taken
    mockFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
    } as unknown as Response);

    const result = await checkNameAvailability('taken-org');

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
