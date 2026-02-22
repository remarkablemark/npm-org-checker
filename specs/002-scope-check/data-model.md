# Data Model: NPM Scope Checker

**Feature**: 002-scope-check  
**Date**: 2026-02-22  
**Phase**: 1 - Design & Contracts

## Entity Overview

This feature extends the existing npm organization checker with scope checking capabilities. The data model leverages existing entities while adding scope-specific validation and results.

## Core Entities

### NameAvailabilityResult

**Description**: Unified result object for name availability checking across all types (user, scope, organization).

**Type Definition**:

```typescript
interface NameAvailabilityResult {
  isAvailable: boolean;
  conflictType?: 'user' | 'scope' | 'organization';
  conflictReason?: string;
  checkedAt: Date;
}
```

**Validation Rules**:

- `isAvailable`: Boolean indicating if name is available for any use
- `conflictType`: Present only when `isAvailable` is false
- `conflictReason`: User-friendly message explaining the conflict
- `checkedAt`: Timestamp of the availability check

**State Transitions**:

```
Initial → Checking → Available/Unavailable
                ↓
            Error (with retry option)
```

### ScopeCheckRequest

**Description**: Request object for scope existence checking.

**Type Definition**:

```typescript
interface ScopeCheckRequest {
  scopeName: string; // Name without @ prefix
  timestamp: Date;
}
```

**Validation Rules**:

- `scopeName`: Must pass `validateOrganizationName()` rules
- `timestamp`: Auto-generated request timestamp

### ScopeCheckResponse

**Description**: Response object from npm replicate endpoint.

**Type Definition**:

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

**Validation Rules**:

- `rows`: Array length determines scope existence
- `total_rows`: Total packages in scope (for reference)
- `offset`: Pagination offset (for reference)

## Enhanced Existing Types

### ValidationResult (Enhanced)

**Description**: Validation result with unified name type support.

**Type Definition**:

```typescript
interface ValidationResult {
  isValid: boolean;
  error?: string;
  nameType?: 'user' | 'scope' | 'organization';
}
```

**Enhancements**:

- Added `nameType` field for tracking validation context
- No format detection required - applies to all types uniformly

### ApiError (Enhanced)

**Description**: Enhanced error handling for scope checking failures.

**Type Definition**:

```typescript
interface ApiError {
  type: ApiErrorType;
  message: string;
  timestamp: Date;
  context?: 'user' | 'scope' | 'organization';
  statusCode?: number;
}
```

**Enhancements**:

- Added `context` field for error source identification
- Maintains backward compatibility with existing error handling

## Data Flow

### Input Processing

```
User Input (string)
    ↓
validateOrganizationName() // Existing function
    ↓
checkNameAvailability() // Enhanced function
    ↓
┌─────────────────────────────────┐
│  Sequential Validation:         │
│  1. checkUserExists()           │
│  2. checkScopeExists()          │  ← NEW
│  3. checkOrgAvailability()      │
└─────────────────────────────────┘
    ↓
NameAvailabilityResult
```

### Scope Checking Flow

```
Scope Name (string)
    ↓
checkScopeExists()
    ↓
Build replicate URL
    ↓
corsmirror proxy request
    ↓
ScopeCheckResponse
    ↓
rows.length > 0 ? true : false
    ↓
Boolean result
```

## Validation Rules

### Name Validation (Unified)

**Applied to all name types**:

- Length: 1-214 characters
- Characters: alphanumeric, hyphens, underscores
- No leading/trailing hyphens or underscores
- No special characters (except @ prefix for display purposes)

**Implementation**:

```typescript
// Reuses existing validation function
const isValid = validateOrganizationName(name);
```

### Scope-Specific Validation

**Additional rules for scope checking**:

- Scope name checked without @ prefix
- @ prefix added only for API requests
- Same validation rules as organization names

## Error Handling

### Error Categories

**Network Errors**:

- Timeout (10 seconds)
- CORS proxy failures
- Connection errors

**API Errors**:

- Invalid response format
- Server errors (5xx)
- Rate limiting (429)

**Validation Errors**:

- Invalid name format
- Empty input
- Exceeds length limits

### Error Recovery

**Retry Strategy**:

- Network errors: Retry with exponential backoff
- API errors: User-friendly message with retry option
- Validation errors: Immediate feedback, no retry

## Performance Considerations

### Optimization Strategies

**Early Termination**:

- Stop validation sequence on first conflict found
- Reduces unnecessary API calls
- Improves response time

**Caching**:

- Consider short-term caching for repeated checks
- Cache invalidation on errors or timeouts

**Debouncing**:

- Reuse existing 300ms debounce pattern
- Prevents excessive API calls during typing

## Integration Points

### Enhanced Functions

**checkNameAvailability()**:

```typescript
export async function checkNameAvailability(name: string): Promise<boolean> {
  // Step 1: User check (existing)
  const userExists = await checkUserExists(name);
  if (userExists) return false;

  // Step 2: Scope check (NEW)
  const scopeExists = await checkScopeExists(name);
  if (scopeExists) return false;

  // Step 3: Organization check (existing)
  const orgAvailable = await checkOrgAvailability(name);
  return orgAvailable;
}
```

**checkScopeExists()** (NEW):

```typescript
export async function checkScopeExists(scopeName: string): Promise<boolean> {
  // Implementation using replicate endpoint
  // Returns true if scope exists (packages found)
}
```

### Type Safety

**Strict TypeScript**:

- All interfaces properly typed
- No implicit any types
- Proper error type handling
- Generic function signatures where appropriate

## Testing Requirements

### Unit Tests

**New Functions**:

- `checkScopeExists()` with various inputs
- Error handling scenarios
- Response parsing edge cases

**Enhanced Functions**:

- `checkNameAvailability()` with scope scenarios
- Validation sequence testing
- Early termination behavior

### Integration Tests

**End-to-End Workflows**:

- Complete validation sequence
- Error recovery scenarios
- Performance validation

**Mock Scenarios**:

- Various API responses
- Network failure conditions
- Edge case inputs

## Conclusion

The data model extends existing entities with minimal changes while adding comprehensive scope checking capabilities. The approach maintains backward compatibility and follows established patterns for consistency and maintainability.
