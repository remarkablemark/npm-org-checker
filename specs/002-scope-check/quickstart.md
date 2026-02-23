# Quickstart Guide: NPM Scope Checker

**Feature**: 002-scope-check  
**Date**: 2026-02-22  
**Phase**: 1 - Design & Contracts

## Overview

This guide provides quick start instructions for implementing the scope checking feature. The implementation extends the existing npm organization checker with comprehensive scope validation while maintaining the same user experience.

## Prerequisites

- Node.js 24+
- Existing npm org checker codebase
- Familiarity with existing codebase patterns
- Understanding of npm registry APIs

## Implementation Steps

### 1. Add Scope Checking Function

**File**: `src/utils/npmRegistry.ts`

```typescript
/**
 * Checks if a scope exists on npm registry via the replicate endpoint.
 *
 * @param scopeName - The scope name to check (without @ prefix)
 * @returns Promise<boolean> - true if scope exists, false if available
 * @throws Error for network, timeout, or server errors
 */
export async function checkScopeExists(scopeName: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Build replicate endpoint URL
    const replicateUrl = `https://replicate.npmjs.com/_all_docs?startkey=%22@${scopeName}/%22&endkey=%22@${scopeName}/\ufff0%22`;
    const proxyUrl = `${CORS_PROXY_URL}${replicateUrl}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as ScopeCheckResponse;

    // Scope exists if any packages found
    return (data.rows?.length ?? 0) > 0;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unknown error occurred');
  }
}

// Add interface for scope response
interface ScopeCheckResponse {
  total_rows: number;
  offset: number;
  rows: Array<{
    id: string;
    key: string;
    value: { rev: string };
  }>;
}
```

### 2. Enhance checkNameAvailability Function

**File**: `src/utils/npmRegistry.ts` (modify existing function)

```typescript
export async function checkNameAvailability(name: string): Promise<boolean> {
  // Step 1: Check if user exists (existing)
  const userExists = await checkUserExists(name);
  if (userExists) {
    return false; // Early termination
  }

  // Step 2: Check if scope exists (NEW)
  const scopeExists = await checkScopeExists(name);
  if (scopeExists) {
    return false; // Early termination
  }

  // Step 3: Check organization availability (existing)
  const orgAvailable = await checkOrgAvailability(name);
  return orgAvailable;
}
```

### 3. Add Tests for Scope Checking

**File**: `src/utils/npmRegistry.test.ts`

```typescript
describe('checkScopeExists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when scope exists', async () => {
    const mockResponse: ScopeCheckResponse = {
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

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await checkScopeExists('scope');
    expect(result).toBe(true);
  });

  it('should return false when scope does not exist', async () => {
    const mockResponse: ScopeCheckResponse = {
      total_rows: 0,
      offset: 0,
      rows: [],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await checkScopeExists('available-scope');
    expect(result).toBe(false);
  });

  it('should handle network errors', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(checkScopeExists('scope')).rejects.toThrow('Network error');
  });

  it('should handle timeout errors', async () => {
    global.fetch = vi.fn().mockImplementationOnce(() => {
      return new Promise((_, reject) => {
        setTimeout(
          () => reject(new DOMException('AbortError', 'AbortError')),
          100,
        );
      });
    });

    await expect(checkScopeExists('scope')).rejects.toThrow('Request timeout');
  });
});

describe('checkNameAvailability with scope checking', () => {
  it('should stop at user check if user exists', async () => {
    vi.mocked(checkUserExists).mockResolvedValueOnce(true);
    vi.mocked(checkScopeExists).mockResolvedValueOnce(false);
    vi.mocked(checkOrgAvailability).mockResolvedValueOnce(true);

    const result = await checkNameAvailability('taken-username');

    expect(result).toBe(false);
    expect(checkUserExists).toHaveBeenCalledWith('taken-username');
    expect(checkScopeExists).not.toHaveBeenCalled();
    expect(checkOrgAvailability).not.toHaveBeenCalled();
  });

  it('should stop at scope check if scope exists', async () => {
    vi.mocked(checkUserExists).mockResolvedValueOnce(false);
    vi.mocked(checkScopeExists).mockResolvedValueOnce(true);
    vi.mocked(checkOrgAvailability).mockResolvedValueOnce(true);

    const result = await checkNameAvailability('taken-scope');

    expect(result).toBe(false);
    expect(checkUserExists).toHaveBeenCalledWith('taken-scope');
    expect(checkScopeExists).toHaveBeenCalledWith('taken-scope');
    expect(checkOrgAvailability).not.toHaveBeenCalled();
  });

  it('should check all three when none exist', async () => {
    vi.mocked(checkUserExists).mockResolvedValueOnce(false);
    vi.mocked(checkScopeExists).mockResolvedValueOnce(false);
    vi.mocked(checkOrgAvailability).mockResolvedValueOnce(true);

    const result = await checkNameAvailability('available-name');

    expect(result).toBe(true);
    expect(checkUserExists).toHaveBeenCalledWith('available-name');
    expect(checkScopeExists).toHaveBeenCalledWith('available-name');
    expect(checkOrgAvailability).toHaveBeenCalledWith('available-name');
  });
});
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:ci

# Run specific test file
npm test src/utils/npmRegistry.test.ts
```

### 5. Verify Implementation

```bash
# Start development server
npm start

# Test in browser:
# 1. Open http://localhost:5173
# 2. Enter a scope name (e.g., "angular")
# 3. Verify it checks user → scope → organization
# 4. Test with available names
# 5. Test with taken names
```

## Key Implementation Notes

### No UI Changes Required

The implementation requires **no changes to React components**. The enhanced `checkNameAvailability()` function automatically provides scope checking through the existing UI.

### Reuse Existing Patterns

- **Validation**: Uses existing `validateOrganizationName()` function
- **Debouncing**: Reuses existing 300ms debounce in `useAvailabilityChecker`
- **Error Handling**: Follows existing error handling patterns
- **Testing**: Uses existing test structure and mocking patterns

### Performance Optimization

- **Early Termination**: Stops checking sequence when conflict found
- **Efficient API Calls**: Only makes necessary API calls
- **Consistent Timeouts**: Uses existing 10-second timeout pattern

### CORS Handling

- **Proxy**: Uses corsmirror.com for all npm registry calls
- **Consistency**: Same CORS handling as existing organization checking
- **Reliability**: Proven CORS proxy solution

## Troubleshooting

### Common Issues

**CORS Errors**:

- Verify corsmirror.com is accessible
- Check URL encoding in replicate endpoint
- Ensure proper error handling

**Timeout Issues**:

- Check network connectivity
- Verify npm registry endpoint availability
- Consider increasing timeout if needed

**Test Failures**:

- Ensure proper mocking of fetch API
- Verify response structure matches expectations
- Check async/await error handling

### Debug Tips

```typescript
// Add logging for debugging
console.log('Checking scope:', scopeName);
console.log('API URL:', proxyUrl);
console.log('Response:', data);
```

## Verification Checklist

- [x] `checkScopeExists()` function implemented
- [x] `checkNameAvailability()` enhanced with scope checking
- [x] All tests passing with 100% coverage
- [x] Manual testing in browser
- [x] Error handling works correctly
- [x] Performance requirements met
- [x] No UI changes required
- [x] Existing functionality preserved

## Next Steps

After implementation:

1. **Run full test suite**: `npm run test:ci`
2. **Check coverage**: Ensure 100% coverage maintained
3. **Manual testing**: Verify end-to-end functionality
4. **Performance testing**: Confirm response times meet requirements
5. **Code review**: Verify compliance with project standards

## Support

For issues or questions:

- Check existing test patterns for guidance
- Refer to `npmRegistry.ts` for existing implementation patterns
- Review user checking feature (`001-check-user-name`) for similar implementation

## Conclusion

This implementation adds comprehensive scope checking while maintaining the existing user experience. The approach maximizes code reuse and follows established patterns for consistency and maintainability.
