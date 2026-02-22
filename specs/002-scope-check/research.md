# Research: NPM Scope Checker

**Feature**: 002-scope-check  
**Date**: 2026-02-22  
**Phase**: 0 - Research & Technical Investigation

## Research Summary

This document outlines the technical research and decisions made for implementing scope checking in the npm organization checker. All research has been completed and no NEEDS CLARIFICATION items remain.

## Technical Decisions

### NPM Replicate Endpoint Integration

**Decision**: Use npm replicate endpoint `https://replicate.npmjs.com/_all_docs` with startkey/endkey parameters for scope checking.

**Rationale**:

- The replicate endpoint provides direct access to npm's CouchDB-like database
- More efficient than search API for scope-specific queries
- Returns structured JSON with rows array for easy existence checking
- Follows the same pattern as existing npm registry integration

**Alternatives considered**:

- npm search API: Less efficient for scope-specific queries
- npm packages endpoint: Doesn't provide scope-level filtering
- Custom npm registry API: Would require additional authentication

**Implementation Details**:

```typescript
const scopeUrl = `https://replicate.npmjs.com/_all_docs?startkey=%22@${scope}/%22&endkey=%22@${scope}/\ufff0%22`;
const proxyUrl = `https://corsmirror.com/v1?url=${encodeURIComponent(scopeUrl)}`;
```

### CORS Handling Strategy

**Decision**: Use corsmirror.com proxy for all npm registry API calls.

**Rationale**:

- Consistent with existing organization checking implementation
- Reliable CORS proxy service with good uptime
- No additional configuration required
- Maintains existing error handling patterns

**Alternatives considered**:

- Self-hosted CORS proxy: Additional infrastructure complexity
- npm registry CORS headers: Inconsistent across endpoints
- Browser extensions: Not reliable for all users

### Response Parsing Logic

**Decision**: Scope exists when `response.rows.length > 0`.

**Rationale**:

- Simple and reliable existence check
- Matches the pattern used in user existence checking
- Efficient - no need to parse individual row contents
- Clear boolean logic for availability determination

**Response Structure**:

```json
{
  "total_rows": 3817656,
  "offset": 295836,
  "rows": [
    {
      "id": "@scope/package",
      "key": "@scope/package",
      "value": { "rev": "2-abc123" }
    },
    {
      "id": "@scope/other",
      "key": "@scope/other",
      "value": { "rev": "1-def456" }
    }
  ]
}
```

### Validation Sequence Implementation

**Decision**: Implement 3-step sequential validation: user → scope → organization.

**Rationale**:

- Optimizes API calls by stopping early when conflicts are found
- Follows existing pattern from user checking feature
- Provides specific feedback about why name is unavailable
- Maintains backward compatibility with existing functionality

**Sequence Logic**:

```typescript
export async function checkNameAvailability(name: string): Promise<boolean> {
  // Step 1: Check if user exists
  const userExists = await checkUserExists(name);
  if (userExists) return false;

  // Step 2: Check if scope exists
  const scopeExists = await checkScopeExists(name);
  if (scopeExists) return false;

  // Step 3: Check organization availability
  const orgAvailable = await checkOrgAvailability(name);
  return orgAvailable;
}
```

### Code Reuse Strategy

**Decision**: Maximize reuse of existing functions and patterns.

**Rationale**:

- Reduces implementation complexity
- Maintains consistent user experience
- Leverages proven validation logic
- Minimizes testing scope

**Reused Components**:

- `validateOrganizationName()` for all name validation
- `useAvailabilityChecker()` hook with 300ms debounce
- `OrgNameChecker` component without UI changes
- Error handling patterns from existing functions
- Test structure and coverage requirements

### Performance Considerations

**Decision**: Maintain existing performance patterns with optimized API calls.

**Rationale**:

- Existing 300ms debounce provides good user experience
- Early termination in validation sequence reduces unnecessary API calls
- Consistent with current success criteria (100ms validation feedback)
- No additional UI complexity impacts performance

**Optimization Techniques**:

- Sequential validation with early termination
- Reuse of existing debounce mechanism
- Efficient response parsing (rows.length check)
- Consistent timeout handling (10 seconds)

## Integration Points

### Enhanced npmRegistry.ts

**Files to modify**:

- `src/utils/npmRegistry.ts` - Add `checkScopeExists()` function
- `src/utils/npmRegistry.test.ts` - Add comprehensive scope tests

**New Function**:

```typescript
export async function checkScopeExists(scopeName: string): Promise<boolean> {
  // Implementation using replicate endpoint via corsmirror
}
```

### No UI Changes Required

**Components unchanged**:

- `OrgNameChecker.tsx` - No modifications needed
- `useAvailabilityChecker.ts` - No modifications needed
- `App.tsx` - No modifications needed

**Rationale**: The consolidated approach handles all logic in the utility layer.

## Testing Strategy

### Unit Tests Required

**New test coverage**:

- `checkScopeExists()` function with various scenarios
- Error handling for replicate endpoint failures
- Response parsing with different data structures
- Integration with existing `checkNameAvailability()` function

**Test scenarios**:

- Scope exists (rows.length > 0)
- Scope doesn't exist (rows.length = 0)
- Network errors and timeouts
- Malformed API responses
- Edge cases (empty scope names, special characters)

### Integration Tests

**Existing test enhancement**:

- Update `checkNameAvailability()` tests to include scope checking
- Verify 3-step validation sequence
- Test early termination behavior
- Validate error messages for scope conflicts

## Risk Assessment

### Low Risk Items

- **API Integration**: Uses proven corsmirror pattern
- **Validation Logic**: Leverages existing tested functions
- **Error Handling**: Follows established patterns
- **Performance**: Maintains existing debounce and timeout mechanisms

### Medium Risk Items

- **npm Replicate Endpoint**: Need to verify endpoint stability and response format
- **Response Parsing**: Ensure robust handling of various response structures

### Mitigation Strategies

- Comprehensive error handling with user-friendly messages
- Fallback behavior for API failures
- Extensive test coverage including edge cases
- Monitoring of endpoint performance and availability

## Conclusion

All technical research has been completed with clear decisions made for each aspect of the implementation. The approach maximizes code reuse while adding comprehensive scope checking functionality. No NEEDS CLARIFICATION items remain, and the implementation is ready to proceed to Phase 1 design.

**Next Steps**: Proceed with Phase 1 design to create data models and update agent context.
