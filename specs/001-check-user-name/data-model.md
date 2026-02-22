# Data Model: Check User Name First

**Date**: 2025-02-22  
**Purpose**: Define data structures and validation rules for user name checking feature

## Core Entities

### UserValidationState

Represents the current validation status of user name input.

```typescript
type UserValidationState = 'valid' | 'invalid' | 'pending';
```

**Fields**:

- `state`: Current validation status
- `errors`: Array of validation error messages
- `lastValidated`: Timestamp of last validation attempt

**Validation Rules**:

- Same as organization names: lowercase letters, numbers, hyphens only
- Length: 1-100 characters
- Pattern: Must start with lowercase letter, end with letter/number
- No consecutive hyphens
- No reserved words (npm, node, package, module)

### UserExistenceResult

Represents the result of checking if user exists on npm registry.

```typescript
interface UserExistenceResult {
  exists: boolean | null; // null = not checked yet
  isChecking: boolean;
  error: ApiError | null;
  lastChecked: Date | null;
}
```

**Fields**:

- `exists`: True if user found, false if not found, null if not checked
- `isChecking`: True while API call is in progress
- `error`: API error if check failed
- `lastChecked`: Timestamp of last successful check

**API Integration**:

- Endpoint: `https://registry.npmjs.org/-/v1/search?text=author:<user>&size=1`
- Proxy: `https://corsmirror.com/v1?url=` + encoded endpoint
- Response parsing: Check `objects.length > 0`

### OrganizationAvailability

Represents the final determination of organization name availability.

```typescript
interface OrganizationAvailability {
  isAvailable: boolean | null;
  reason:
    | 'user-exists'
    | 'user-not-found'
    | 'org-exists'
    | 'org-available'
    | 'error'
    | null;
  isChecking: boolean;
  error: ApiError | null;
  lastChecked: Date | null;
}
```

**Fields**:

- `isAvailable`: Final availability determination
- `reason`: Why availability was determined this way
- `isChecking`: True while any checks are in progress
- `error`: Error if any check failed
- `lastChecked`: Timestamp of last availability determination

**Business Logic**:

- If user exists → organization not available (reason: 'user-exists')
- If user not found → proceed to organization check
- Organization check uses existing logic

## State Transitions

### User Name Input Flow

```
Input → Validation → User Existence Check → Organization Check → Result
  ↓         ↓              ↓                    ↓              ↓
pending → valid/invalid → exists/not-found → available/taken → final
```

### Validation States

1. **pending**: User is typing or input is empty
2. **invalid**: Input fails validation rules
3. **valid**: Input passes validation, proceed to existence check

### Existence Check States

1. **not checked**: Valid input but no API call yet
2. **checking**: API call in progress
3. **exists**: User found on npm registry
4. **not found**: User not found on npm registry
5. **error**: API call failed

### Organization Availability States

1. **not checked**: User existence not determined yet
2. **unavailable (user exists)**: User found, org not available
3. **checking**: Checking organization availability
4. **available**: Organization name is available
5. **taken**: Organization name exists
6. **error**: Check failed

## Component State Management

### OrgNameChecker Extended State

```typescript
interface OrgNameCheckerState {
  // Existing organization state
  orgName: string;
  orgValidationState: ValidationResult;
  orgAvailability: OrganizationAvailability;

  // New user validation state
  userName: string;
  userValidationState: UserValidationState;
  userExistence: UserExistenceResult;

  // UI state
  currentStep:
    | 'user-input'
    | 'user-checking'
    | 'org-input'
    | 'org-checking'
    | 'result';
}
```

## Error Handling

### Validation Errors

- Empty input
- Too short/long
- Invalid characters
- Invalid start/end characters
- Consecutive hyphens
- Reserved words

### API Errors

- Network timeout (10s)
- CORS proxy failure
- npm registry server error
- Invalid response format
- Rate limiting

## Performance Considerations

### Debouncing

- 300ms debounce for user existence checks
- Cancel pending requests on new input
- Immediate validation feedback (no debounce)

### Caching

- Cache user existence results for current session
- Invalidate cache on input changes
- Consider localStorage for persistence (future enhancement)

## Testing Data

### Test Cases for User Validation

- Valid: "user", "test-user", "user123", "my-test-org"
- Invalid: "", "User", "user@", "-user", "user-", "user--name", "npm"

### Test Cases for User Existence

- Existing users: (real npm usernames)
- Non-existing users: (random strings)
- API failures: Network errors, timeouts

### Test Cases for Organization Availability

- User exists → org unavailable
- User not found + org exists → org unavailable
- User not found + org not found → org available

## Integration Points

### Existing Components

- `ErrorMessage`: Display validation and API errors
- `AvailabilityIndicator`: Show availability status
- `useAvailabilityChecker`: Pattern for new user existence hook

### Existing Utilities

- `validation.ts`: Extend for user name validation
- `npmRegistry.ts`: Add user existence checking
- Error handling: Reuse existing patterns
