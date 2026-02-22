# Data Model: NPM Organization Name Availability Checker

**Date**: 2026-02-21 | **Phase**: 1 (Design & Contracts)

## Core Entities

### OrganizationName

**Description**: Represents the npm organization name being checked

**Fields**:

- `value: string` - The raw input value from user
- `isValid: boolean` - Format validation result
- `validationErrors: string[]` - Array of validation error messages
- `isAvailable: boolean | null` - Availability status (null = not checked)
- `isChecking: boolean` - Whether availability check is in progress
- `lastChecked: Date | null` - Timestamp of last availability check

**Validation Rules**:

- Length: 1-214 characters
- Pattern: `^[a-z][a-z0-9-]*[a-z0-9]$`
- No consecutive hyphens
- No reserved words (npm, node, etc.)
- Must start and end with alphanumeric character

### ValidationResult

**Description**: Represents the outcome of name format validation

**Fields**:

- `isValid: boolean` - Overall validation result
- `errors: ValidationError[]` - Array of specific validation errors
- `warnings: string[]` - Non-critical warnings

### ValidationError

**Description**: Specific validation error with type and message

**Fields**:

- `type: ValidationErrorType` - Type of validation error
- `message: string` - Human-readable error message
- `field?: string` - Field reference (for future extensibility)

### AvailabilityStatus

**Description**: Represents the availability check result

**Fields**:

- `isAvailable: boolean` - Whether the name is available
- `checkedAt: Date` - When the check was performed
- `source: 'npm-registry'` - Source of the availability data

### ApiError

**Description**: Represents API-related errors

**Fields**:

- `type: ApiErrorType` - Type of API error
- `message: string` - Technical error message
- `statusCode?: number` - HTTP status code if applicable
- `timestamp: Date` - When the error occurred

## Type Definitions

### ValidationErrorType

```typescript
enum ValidationErrorType {
  TOO_SHORT = 'TOO_SHORT',
  TOO_LONG = 'TOO_LONG',
  INVALID_START = 'INVALID_START',
  INVALID_END = 'INVALID_END',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
  CONSECUTIVE_HYPHENS = 'CONSECUTIVE_HYPHENS',
  RESERVED_WORD = 'RESERVED_WORD',
  EMPTY = 'EMPTY',
}
```

### ApiErrorType

```typescript
enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## State Transitions

### OrganizationName State Flow

1. **Initial**: `value: '', isValid: false, isAvailable: null, isChecking: false`
2. **Input Received**: Validation performed, `isValid` updated
3. **Valid Input**: Availability check initiated, `isChecking: true`
4. **Check Complete**: `isAvailable` updated, `isChecking: false`
5. **Error**: `ApiError` populated, `isChecking: false`

## Component State Relationships

### OrgNameChecker Component

- Manages `OrganizationName` entity
- Handles user input and debouncing
- Triggers validation and availability checks

### AvailabilityIndicator Component

- Receives `isAvailable` and `isChecking` props
- Displays appropriate visual feedback (✅/❌/spinner)

### ErrorMessage Component

- Receives `validationErrors` and `ApiError` props
- Displays technical error details

## Data Flow

1. User types in input field
2. `useOrgNameValidator` hook validates format
3. After 300ms debounce, `useAvailabilityChecker` hook calls API
4. Results update `OrganizationName` entity
5. Components re-render with new state

## Performance Considerations

### Debouncing Strategy

- Input events debounced at 300ms
- Validation runs on every keystroke (fast, client-side)
- Availability checks only run on debounced valid input

### Caching Strategy

- No caching required (real-time accuracy needed)
- Could implement brief cache for repeated checks of same name

## Error Handling

### Validation Errors

- Displayed immediately as user types
- Multiple errors can be shown simultaneously
- Cleared when input becomes valid

### API Errors

- Displayed as technical error messages
- Include error type and timestamp
- Allow user to retry by re-typing

## Accessibility Considerations

### Screen Reader Support

- Validation errors announced via ARIA live regions
- Availability status announced when changed
- Loading states communicated to screen readers

### Keyboard Navigation

- Input field fully keyboard accessible
- Error messages reachable via keyboard
- Focus management during error states
