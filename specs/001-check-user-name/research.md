# Research: Check User Name First

**Date**: 2026-02-22  
**Purpose**: Resolve technical unknowns for user name validation and existence checking feature

## Research Findings

### User Name Validation Rules

**Decision**: Use same validation rules as organization names from existing `validation.ts` with underscore support

**Rationale**:

- Consistency across the application
- Existing validation infrastructure already tested and proven
- User names and organization names follow similar npm naming conventions
- Clarified in specification: "Use same rules as organization names (lowercase letters, numbers, hyphens only)" with underscore support per FR-004

**Implementation**: Extend `validateOrganizationName` function to handle both user and organization names, or create `validateUserName` that reuses the same logic.

### npm Registry Search API Integration

**Decision**: Use corsmirror.com proxy for npm registry search API calls

**Rationale**:

- Consistent with existing organization checking implementation
- Avoids CORS issues in browser environment
- Existing error handling patterns can be reused
- Clarified in specification: "Use corsmirror.com proxy for npm registry search API calls"

**API Details**:

- Endpoint: `https://registry.npmjs.com/-/v1/search?text=author:<user>&size=1`
- Proxy URL: `https://corsmirror.com/v1?url=` + encoded endpoint
- Response: JSON with `objects` array
- User exists if `objects.length > 0`

### Debouncing Strategy

**Decision**: Reuse existing 300ms debounce pattern from `useAvailabilityChecker`

**Rationale**:

- Proven pattern in existing codebase
- Prevents API spam during rapid typing
- Consistent user experience across validation types
- Clarified in specification: "Reuse existing 300ms debounce pattern from useAvailabilityChecker"

### Component Integration Strategy

**Decision**: Extend existing `OrgNameChecker` component to include user validation step

**Rationale**:

- Maintains existing UI patterns and user experience
- Reuses existing components (`AvailabilityIndicator`, `ErrorMessage`)
- Single component handles complete validation flow
- Clarified in specification: "Extend existing OrgNameChecker to add user name validation step before organization checking"

### Error Handling Patterns

**Decision**: Reuse existing error handling from `npmRegistry.ts`

**Rationale**:

- Consistent error messages and user experience
- Existing `createApiError` function handles various error types
- Proven error boundary integration
- Maintains application stability

## Technical Implementation Approach

### Phase 1: Data Model

- User validation state (valid/invalid/pending)
- User existence result (exists/not found/error)
- Organization availability determination based on user existence

### Phase 2: Component Updates

- Extend `OrgNameChecker` with user validation step
- Update validation flow to check user first, then organization
- Maintain existing UI components for consistency

### Phase 3: Testing Strategy

- Unit tests for new validation functions
- Integration tests for API calls
- Component tests for updated UI flow
- Maintain 100% coverage requirement

## Alternatives Considered

1. **Separate user validation component**: Rejected for UI complexity
2. **Direct API calls without proxy**: Rejected due to CORS issues
3. **Different debounce timing**: Rejected for consistency
4. **New validation rules**: Rejected for consistency with existing patterns

## Conclusion

All technical unknowns resolved. Implementation can proceed with extending existing patterns and infrastructure. No new dependencies or major architectural changes required.
