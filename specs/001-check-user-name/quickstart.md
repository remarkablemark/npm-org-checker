# Quickstart: Check User Name First Feature

**Date**: 2026-02-22  
**Purpose**: Developer guide for implementing user name validation and existence checking

## Overview

This feature adds user name validation and existence checking before organization availability checks. The implementation extends existing components and utilities to maintain consistency while adding the new functionality.

## Implementation Steps

### 1. Extend Validation Utilities

**File**: `src/utils/validation.ts`

Add user name validation function:

```typescript
/**
 * Validates a user name according to npm naming rules (same as organization names)
 * @param name - The user name to validate
 * @returns ValidationResult with validation status and errors
 */
export function validateUserName(name: string): ValidationResult {
  // Reuse same logic as validateOrganizationName
  return validateOrganizationName(name);
}
```

**Tests**: Add `validateUserName.test.ts` with comprehensive test cases

### 2. Add User Existence Checking

**File**: `src/utils/npmRegistry.ts`

Add user existence checking function:

```typescript
/**
 * Checks if a user exists on npm registry via search API
 * @param userName - The user name to check
 * @returns Promise<boolean> - true if user exists, false if not found
 * @throws ApiError for network or server errors
 */
export async function checkUserExists(userName: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${CORS_PROXY_URL}https://registry.npmjs.org/-/v1/search?text=author:${encodeURIComponent(userName)}&size=1`;

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.objects && data.objects.length > 0;
  } catch (error) {
    clearTimeout(timeoutId);
    throw createApiError(error as Error);
  }
}
```

**Tests**: Add comprehensive tests for API integration, error handling, and response parsing

### 3. Create User Existence Hook

**File**: `src/hooks/useUserExistenceChecker.ts`

```typescript
import { useCallback, useRef, useState } from 'react';
import { checkUserExists, createApiError } from 'src/utils/npmRegistry';

interface UseUserExistenceCheckerOptions {
  debounceMs?: number;
}

interface UseUserExistenceCheckerReturn {
  userExists: boolean | null;
  isChecking: boolean;
  error: ApiError | null;
  lastChecked: Date | null;
  checkUserExists: (userName: string) => void;
  reset: () => void;
}

export function useUserExistenceChecker(
  options: UseUserExistenceCheckerOptions = {},
): UseUserExistenceCheckerReturn {
  // Similar pattern to useAvailabilityChecker
  // Implement debounced API calls with cancellation
  // Return state and control functions
}
```

**Tests**: Add tests for debouncing, cancellation, error handling, and state management

### 4. Extend OrgNameChecker Component

**File**: `src/components/OrgNameChecker/OrgNameChecker.tsx`

Update component to include user validation step:

```typescript
// Add user validation state
const [userName, setUserName] = useState('');
const [userValidation, setUserValidation] = useState<ValidationResult>({
  isValid: false,
  errors: [],
  warnings: [],
});
const { userExists, isCheckingUser, userError, checkUserExists } =
  useUserExistenceChecker();

// Add user validation handler
const handleUserNameChange = useCallback(
  (name: string) => {
    setUserName(name);
    const validation = validateUserName(name);
    setUserValidation(validation);

    if (validation.isValid) {
      checkUserExists(name);
    }
  },
  [checkUserExists],
);

// Update UI to show user validation step first
// Show organization input only after user validation passes
// Display appropriate error messages and availability indicators
```

**Tests**: Update existing tests and add new tests for user validation flow

### 5. Update Types

**File**: `src/types/index.ts`

Add new types if needed:

```typescript
// Add any new error types or interfaces specific to user checking
// Reuse existing types where possible for consistency
```

## Development Workflow

### 1. Test-First Development

1. Write failing tests for each new function
2. Implement minimal code to make tests pass
3. Refactor and improve code quality
4. Ensure 100% test coverage

### 2. Component Testing

Test user interaction flows:

- User types invalid name → error shown
- User types valid name → API call triggered
- User exists → organization unavailable
- User not found → proceed to organization check
- API errors → appropriate error messages

### 3. Integration Testing

Test complete user journey:

- User enters name
- Validation occurs
- Existence check happens
- Organization availability determined
- Proper feedback displayed

## Code Quality Standards

### TypeScript

- Use strict mode
- Provide proper type annotations
- Use interfaces for object shapes
- Handle async operations with proper error handling

### React Patterns

- Functional components only
- Hooks at top level
- Proper dependency arrays in useCallback/useEffect
- Semantic HTML and accessibility

### Error Handling

- No console.log statements
- Proper try-catch for async operations
- User-friendly error messages
- Error boundary integration

## Performance Considerations

### Debouncing

- Use 300ms debounce for API calls
- Cancel pending requests on new input
- Immediate validation feedback

### API Optimization

- Reuse existing corsmirror proxy
- Handle timeouts gracefully
- Cache results appropriately

## Testing Requirements

### Unit Tests

- `validateUserName` function with all edge cases
- `checkUserExists` function with mock API responses
- `useUserExistenceChecker` hook behavior
- Error handling utilities

### Component Tests

- User input validation
- API call triggering
- Error message display
- State transitions

### Integration Tests

- Complete user flows
- Error scenarios
- Performance under rapid typing

## Deployment Checklist

- [ ] All tests pass with 100% coverage
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with no errors
- [ ] Build completes successfully
- [ ] Manual testing confirms user experience
- [ ] Error scenarios tested and handled gracefully

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure corsmirror proxy is used correctly
2. **Debouncing not working**: Check timeout clearing logic
3. **Type errors**: Verify proper TypeScript types
4. **Test failures**: Check mock implementations and API responses

### Debug Tips

- Use browser dev tools to monitor API calls
- Check React DevTools for component state
- Verify error handling in network tab
- Test with various user names and edge cases
