# Feature Specification: NPM Scope Checker

**Feature Branch**: `002-scope-check`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "update checker to check scope on npm replicate"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Validate Unified Name Input Format (Priority: P1)

As a user, I want the system to validate both organization name and scope input formats in a single unified field, so that I can quickly identify and correct any issues with the name regardless of type.

**Why this priority**: This is the foundational validation step that prevents unnecessary API calls and provides immediate feedback to users about invalid name formats for both organizations and scopes.

**Independent Test**: Can be fully tested by entering various name formats (organization names and scopes) and verifying validation rules are applied correctly without making any external API calls.

**Acceptance Scenarios**:

1. **Given** I have entered a valid organization name format (e.g., "my-org"), **When** the input becomes valid, **Then** the system should proceed to check if the organization name exists on npm registry
2. **Given** I have entered a valid scope format (e.g., "@username"), **When** the input becomes valid, **Then** the system should proceed to check if the scope exists on npm registry
3. **Given** I have entered an invalid format (missing @ for scope, empty, or contains invalid characters), **When** the input is invalid, **Then** the system should display specific validation error messages and not proceed to any API calls

---

### User Story 2 - Check Unified Name Availability on NPM Registry (Priority: P1)

As a user, I want the system to check if either an organization name or scope exists on npm registry using a single unified interface, so that I understand whether my desired name is available for either purpose.

**Why this priority**: This is the core logic that determines name availability for both organizations and scopes, providing clear feedback about whether a name can be used.

**Independent Test**: Can be fully tested by entering known existing and non-existing names (both organization names and scopes) and verifying the correct availability determination.

**Acceptance Scenarios**:

1. **Given** I have entered an organization name that exists on npm registry, **When** the system checks the name, **Then** it should indicate that the name is not available because the organization is already taken
2. **Given** I have entered a scope that exists on npm registry, **When** the system checks the name, **Then** it should indicate that the name is not available because the scope is already taken
3. **Given** I have entered a name that does not exist on npm registry (neither organization nor scope), **When** the system checks the name, **Then** it should indicate that the name is available for use

---

### User Story 3 - Display Real-time Unified Name Validation Feedback (Priority: P2)

As a user, I want to see real-time validation feedback as I type a name (organization or scope), so that I can correct errors immediately without waiting for form submission.

**Why this priority**: Improves user experience by providing immediate feedback and reducing frustration from form submission errors across all name types.

**Independent Test**: Can be fully tested by typing various name inputs (organization names and scopes) and verifying that validation feedback appears/disappears appropriately in real-time.

**Acceptance Scenarios**:

1. **Given** I am typing an organization name, **When** I enter invalid characters or format, **Then** the system should show an error message immediately
2. **Given** I am typing a scope name, **When** I enter invalid characters or format, **Then** the system should show an error message immediately
3. **Given** I am typing a name, **When** I correct the invalid input, **Then** the error message should disappear immediately

---

### Edge Cases

- What happens when scope contains special characters like @, #, $, etc. beyond the required @ prefix?
- How does system handle extremely long scope names (over 214 characters)?
- What happens when scope starts or ends with hyphens or underscores after the @ prefix?
- How does system handle scope names with only numbers after the @ prefix?
- What happens when scope contains non-ASCII characters?
- What happens when npm registry API is down or unreachable?
- How does system handle slow responses from npm registry search API?
- What happens when npm registry returns unexpected response format?
- How does system handle scopes that conflict with reserved npm names?
- What happens when checking scopes that are organization names vs user names?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST validate unified name input using both organization name and scope validation rules
- **FR-002**: System MUST automatically detect input format (organization name vs scope) based on @ prefix
- **FR-003**: System MUST enforce organization name validation rules for inputs without @ prefix
- **FR-004**: System MUST enforce scope validation rules for inputs with @ prefix
- **FR-005**: System MUST enforce minimum length requirement for names (at least 1 character)
- **FR-006**: System MUST enforce maximum length requirement for names (no more than 214 characters total)
- **FR-007**: System MUST only allow alphanumeric characters, hyphens, and underscores in name parts
- **FR-008**: System MUST prevent names from starting or ending with hyphens or underscores
- **FR-009**: System MUST display specific error messages for different validation failures
- **FR-010**: System MUST provide real-time validation feedback as user types
- **FR-011**: System MUST clear validation errors when user corrects invalid input
- **FR-012**: System MUST prevent form submission when validation fails
- **FR-013**: System MUST use the npm registry organization endpoint to check for existing organizations
- **FR-014**: System MUST use the npm replicate endpoint `https://replicate.npmjs.com/_all_docs?startkey=%22@<scope>/%22&endkey=%22@<scope>/\ufff0%22` via corsmirror proxy to check for existing packages with scopes
- **FR-015**: System MUST replace `<scope>` placeholder in replicate endpoint URL with the actual scope name (without @ prefix)
- **FR-016**: System MUST use corsmirror.com proxy URL format: `https://corsmirror.com/v1?url=` followed by the encoded replicate endpoint URL
- **FR-017**: System MUST determine name is not available when either organization exists or packages exist with that scope
- **FR-018**: System MUST display clear message indicating why name is unavailable (organization taken vs scope taken)
- **FR-019**: System MUST proceed to indicate name availability only when neither organization nor scope exists
- **FR-020**: System MUST handle npm registry API errors gracefully with user-friendly messages
- **FR-021**: System MUST implement timeout handling for npm registry API calls
- **FR-022**: System MUST check both organization availability and scope availability in the appropriate sequence
- **FR-023**: System MUST follow validation sequence: 1. check user name, 2. check npm scope, 3. check npm org
- **FR-024**: System MUST stop checking sequence and return unavailable if user name exists (step 1)
- **FR-025**: System MUST stop checking sequence and return unavailable if npm scope exists (step 2)
- **FR-026**: System MUST proceed to check npm org only if both user name and npm scope do not exist
- **FR-027**: System MUST handle npm replicate API responses and parse scope existence from the results
- **FR-028**: System MUST determine scope is taken when replicate response rows.length > 0
- **FR-029**: System MUST determine scope is available when replicate response rows.length = 0

### Key Entities

- **Name**: Text input representing npm name (either organization name or scope), used for unified availability checking
- **Name Type**: Detected type of input (organization vs scope) based on @ prefix presence
- **Organization Name**: Name part without @ prefix, follows organization validation rules
- **Scope Name**: Name part with @ prefix, follows scope validation rules
- **Validation State**: Current validation status of name (valid, invalid, pending)
- **Error Message**: Specific feedback indicating why validation failed
- **Name Existence Result**: Result from npm registry APIs indicating if name exists (organization or scope) or not
- **Name Availability**: Final determination of whether name is available for use
- **API Response**: Response data from npm registry endpoints (organization endpoint and replicate endpoint), including rows array for scope checking
- **Replicate Response**: JSON response from npm replicate endpoint with total_rows, offset, and rows array structure

## Clarifications

### Session 2026-02-22

- Q: UI Integration Approach → A: Unified Input Field - Single input that accepts both organization names (@org) and scopes (@user), automatically detecting format and checking appropriate availability
- Q: Scope checking API endpoint → A: Use npm replicate endpoint `https://replicate.npmjs.com/_all_docs?startkey=%22@<scope>/%22&endkey=%22@<scope>/\ufff0%22` with replaced `<scope>`
- Q: Replicate response interpretation → A: Scope or org name is taken when rows.length > 0 in the JSON response
- Q: CORS handling for replicate endpoint → A: Use corsmirror proxy for npm replicate endpoint calls
- Q: Validation sequence → A: 1. check user name, 2. check npm scope, 3. check npm org
- Q: Implementation approach → A: Consolidate the 3 step validation sequence in existing `checkNameAvailability` function

## Consolidation Notice

### Session 2026-02-22

**Decision**: Scope checking functionality will be consolidated into the main availability checker rather than being implemented as a separate UI feature.

**Reasoning**:

- The separate scope checking would create unnecessary UI complexity
- Consolidated availability checking provides the same functionality more efficiently
- User experience is improved with a single, unified availability check that handles both organization names and scopes
- Reduces API calls and provides clearer feedback to users
- Follows the same pattern as the existing user existence checking consolidation

**Implementation**:

- Scope checking will be handled by extending the existing `checkNameAvailability` function in `npmRegistry.ts`
- The main component will continue to use `useAvailabilityChecker` with the enhanced consolidated function
- No separate scope validation UI will be displayed to users, but the logic will be preserved
- Input field will automatically detect format (@org vs @user) and apply appropriate validation
- The 3-step validation sequence (user → scope → organization) will be consolidated within the single `checkNameAvailability` function

**Impact**:

- All scope validation logic will be centralized in the utility layer
- UI is simplified to focus on unified name availability only (organization names + scopes)
- Tests will be updated to reflect the consolidated approach
- 100% test coverage will be maintained with the new implementation
- Functionality is preserved but implemented more efficiently

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users receive unified name validation feedback within 100ms of typing or form submission
- **SC-002**: 95% of invalid name inputs (both organization and scope) are caught before any API calls are made
- **SC-003**: Users can successfully enter a valid name (organization or scope) and proceed to availability check on first attempt 90% of the time
- **SC-004**: System accurately determines name availability by checking both organizations and scopes 95% of the time
- **SC-005**: npm registry API calls complete within 2 seconds 95% of the time
- **SC-006**: System handles API failures gracefully without crashing 100% of the time
- **SC-007**: Users receive clear feedback about name unavailability due to existing organizations or scopes 100% of the time
- **SC-008**: System reduces unnecessary name availability checks by at least 80% through input validation
- **SC-009**: System automatically detects input type (organization vs scope) and applies appropriate validation 100% of the time
