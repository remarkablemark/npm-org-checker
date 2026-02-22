# API Contracts: NPM Scope Checker

**Feature**: 002-scope-check  
**Date**: 2026-02-22  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the internal API contracts for the scope checking functionality. Since this is a client-side application with no external APIs, the contracts focus on internal function interfaces and data flow contracts.

## Internal Function Contracts

### checkScopeExists()

**Purpose**: Check if a scope exists on npm registry by querying the replicate endpoint.

**Signature**:

```typescript
export async function checkScopeExists(scopeName: string): Promise<boolean>;
```

**Parameters**:

- `scopeName: string` - The scope name to check (without @ prefix)
  - Must be 1-214 characters
  - Must contain only alphanumeric, hyphens, underscores
  - Must not start or end with hyphens or underscores

**Returns**:

- `Promise<boolean>` - True if scope exists (packages found), false if available

**Throws**:

- `Error` - Network failures, timeout, or invalid responses

**Example Usage**:

```typescript
try {
  const exists = await checkScopeExists('username');
  console.log(exists ? 'Scope taken' : 'Scope available');
} catch (error) {
  console.error('Failed to check scope:', error);
}
```

**Implementation Contract**:

```typescript
export async function checkScopeExists(scopeName: string): Promise<boolean> {
  // 1. Validate input using existing validateOrganizationName()
  // 2. Build replicate endpoint URL with startkey/endkey
  // 3. Use corsmirror proxy for CORS handling
  // 4. Parse response and check rows.length > 0
  // 5. Handle errors and timeouts appropriately
}
```

### Enhanced checkNameAvailability()

**Purpose**: Check name availability across user, scope, and organization types with sequential validation.

**Signature**:

```typescript
export async function checkNameAvailability(name: string): Promise<boolean>;
```

**Parameters**:

- `name: string` - The name to check for availability
  - Must pass validateOrganizationName() rules
  - Same validation applied to all three types

**Returns**:

- `Promise<boolean>` - True if available for any use, false if taken

**Throws**:

- `Error` - Network failures, timeout, or validation errors

**Validation Sequence Contract**:

```typescript
export async function checkNameAvailability(name: string): Promise<boolean> {
  // Step 1: Check user existence
  const userExists = await checkUserExists(name);
  if (userExists) return false; // Early termination

  // Step 2: Check scope existence (NEW)
  const scopeExists = await checkScopeExists(name);
  if (scopeExists) return false; // Early termination

  // Step 3: Check organization availability
  const orgAvailable = await checkOrgAvailability(name);
  return orgAvailable;
}
```

## Data Contracts

### ScopeCheckRequest

**Purpose**: Internal request object for scope checking operations.

```typescript
interface ScopeCheckRequest {
  scopeName: string;
  timestamp: Date;
}
```

**Validation Rules**:

- `scopeName`: Must be valid npm name format
- `timestamp`: Auto-generated

### ScopeCheckResponse

**Purpose**: Response structure from npm replicate endpoint.

```typescript
interface ScopeCheckResponse {
  total_rows: number;
  offset: number;
  rows: ScopePackageRow[];
}

interface ScopePackageRow {
  id: string;
  key: string;
  value: {
    rev: string;
  };
}
```

**Parsing Contract**:

```typescript
function parseScopeResponse(response: ScopeCheckResponse): boolean {
  // Return true if rows.length > 0, false otherwise
  return response.rows.length > 0;
}
```

## Error Handling Contracts

### Error Types

```typescript
enum ScopeErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CORS_ERROR = 'CORS_ERROR',
}

interface ScopeError {
  type: ScopeErrorType;
  message: string;
  timestamp: Date;
  originalError?: Error;
}
```

### Error Handling Contract

```typescript
function handleScopeError(error: Error | ScopeError): ScopeError {
  // 1. Determine error type based on error characteristics
  // 2. Create structured error object
  // 3. Add timestamp and context
  // 4. Preserve original error for debugging
}
```

## Performance Contracts

### Response Time Requirements

- **Validation**: < 100ms for input validation
- **API Calls**: < 2000ms for npm registry responses
- **Total Flow**: < 3000ms for complete availability check

### Debouncing Contract

```typescript
// Reuse existing debounce pattern
const debouncedCheck = debounce(checkNameAvailability, 300);
```

**Contract Requirements**:

- 300ms delay between calls
- Cancel previous pending calls
- Maintain latest input value

## Testing Contracts

### Unit Test Contracts

**checkScopeExists() Tests**:

```typescript
describe('checkScopeExists', () => {
  it('should return true when scope exists', async () => {
    // Mock replicate response with rows
    const result = await checkScopeExists('existing-scope');
    expect(result).toBe(true);
  });

  it('should return false when scope does not exist', async () => {
    // Mock replicate response with empty rows
    const result = await checkScopeExists('available-scope');
    expect(result).toBe(false);
  });

  it('should handle network errors', async () => {
    // Mock network failure
    await expect(checkScopeExists('scope')).rejects.toThrow();
  });
});
```

**Integration Test Contracts**:

```typescript
describe('checkNameAvailability with scope checking', () => {
  it('should stop at user check if user exists', async () => {
    // Mock user exists, scope and org should not be called
    const result = await checkNameAvailability('taken-username');
    expect(result).toBe(false);
  });

  it('should stop at scope check if scope exists', async () => {
    // Mock user doesn't exist, scope exists, org should not be called
    const result = await checkNameAvailability('taken-scope');
    expect(result).toBe(false);
  });

  it('should check all three when none exist', async () => {
    // Mock all three checks pass
    const result = await checkNameAvailability('available-name');
    expect(result).toBe(true);
  });
});
```

## Integration Contracts

### Hook Integration

**useAvailabilityChecker Hook Contract**:

```typescript
// Existing hook interface remains unchanged
interface UseAvailabilityCheckerReturn {
  availability: boolean | null;
  isLoading: boolean;
  error: string | null;
  checkAvailability: (name: string) => Promise<void>;
}
```

**Enhanced Behavior Contract**:

- Hook now checks user → scope → organization sequence
- Same debouncing and error handling patterns
- No changes to component interface

### Component Integration

**OrgNameChecker Component Contract**:

```typescript
// Component interface unchanged
interface OrgNameCheckerProps {
  autoFocus?: boolean;
}
```

**Enhanced Behavior Contract**:

- Component now provides comprehensive availability feedback
- Same validation and error handling UX
- No visual changes required

## Version Compatibility

### Backward Compatibility

**Existing Functions**:

- All existing function signatures unchanged
- All existing component props unchanged
- All existing behavior preserved

**New Functions**:

- `checkScopeExists()` - additive, no breaking changes
- Enhanced `checkNameAvailability()` - same signature, enhanced logic

### Migration Path

**No Migration Required**:

- Existing code continues to work unchanged
- New functionality is additive
- Enhanced behavior is transparent to existing users

## Conclusion

These contracts define the internal API interfaces and data flow for the scope checking functionality. The contracts ensure consistency with existing patterns while providing comprehensive scope checking capabilities.
