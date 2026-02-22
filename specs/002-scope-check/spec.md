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

### User Story 1 - Validate Scope Input Format (Priority: P1)

As a user, I want the system to validate npm scope input format before checking availability, so that I can quickly identify and correct any issues with the scope name.

**Why this priority**: This is the foundational validation step that prevents unnecessary API calls and provides immediate feedback to users about invalid scope formats.

**Independent Test**: Can be fully tested by entering various scope formats and verifying validation rules are applied correctly without making any external API calls.

**Acceptance Scenarios**:

1. **Given** I have entered a valid scope format (e.g., "@username"), **When** the input becomes valid, **Then** the system should proceed to check if the scope exists on npm registry
2. **Given** I have entered an invalid scope format (missing @, empty, or contains invalid characters), **When** the input is invalid, **Then** the system should display specific validation error messages and not proceed to any API calls

---

### User Story 2 - Check Scope Availability on NPM Registry (Priority: P1)

As a user, I want the system to check if a scope exists on npm registry, so that I understand whether my desired scope name is available for creating scoped packages.

**Why this priority**: This is the core logic that determines scope availability, providing clear feedback about whether a scope can be used for publishing packages.

**Independent Test**: Can be fully tested by entering known existing and non-existing scope names and verifying the correct scope availability determination.

**Acceptance Scenarios**:

1. **Given** I have entered a scope that exists on npm registry, **When** the system checks the scope, **Then** it should indicate that the scope is not available because it's already taken
2. **Given** I have entered a scope that does not exist on npm registry, **When** the system checks the scope, **Then** it should indicate that the scope is available for use

---

### User Story 3 - Display Real-time Scope Validation Feedback (Priority: P2)

As a user, I want to see real-time validation feedback as I type a scope name, so that I can correct errors immediately without waiting for form submission.

**Why this priority**: Improves user experience by providing immediate feedback and reducing frustration from form submission errors.

**Independent Test**: Can be fully tested by typing various scope inputs and verifying that validation feedback appears/disappears appropriately in real-time.

**Acceptance Scenarios**:

1. **Given** I am typing a scope name, **When** I enter invalid characters or format, **Then** the system should show an error message immediately
2. **Given** I am typing a scope name, **When** I correct the invalid input, **Then** the error message should disappear immediately

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

- **FR-001**: System MUST validate scope input using npm scope validation rules
- **FR-002**: System MUST enforce that scope starts with @ symbol
- **FR-003**: System MUST enforce minimum length requirement for scope name part (at least 1 character after @)
- **FR-004**: System MUST enforce maximum length requirement for scope name part (no more than 214 characters total)
- **FR-005**: System MUST only allow alphanumeric characters, hyphens, and underscores in scope name part
- **FR-006**: System MUST prevent scope name part from starting or ending with hyphens or underscores
- **FR-007**: System MUST display specific error messages for different validation failures
- **FR-008**: System MUST provide real-time validation feedback as user types
- **FR-009**: System MUST clear validation errors when user corrects invalid input
- **FR-010**: System MUST prevent form submission when validation fails
- **FR-011**: System MUST check if scope exists on npm registry using appropriate API endpoints
- **FR-012**: System MUST use the npm registry search endpoint to check for existing packages with the scope
- **FR-013**: System MUST determine scope is not available when packages exist with that scope on npm registry
- **FR-014**: System MUST display clear message that scope is unavailable because it's already taken
- **FR-015**: System MUST proceed to indicate scope availability only when no packages exist with that scope
- **FR-016**: System MUST handle npm registry API errors gracefully with user-friendly messages
- **FR-017**: System MUST implement timeout handling for npm registry API calls
- **FR-018**: System MUST differentiate between user scopes and organization scopes when checking availability

### Key Entities

- **Scope**: Text input representing npm scope (must start with @ followed by valid name), used for scoped package names
- **Scope Name**: The part after the @ symbol that follows npm validation rules
- **Validation State**: Current validation status of scope (valid, invalid, pending)
- **Error Message**: Specific feedback indicating why validation failed
- **Scope Existence Result**: Result from npm registry search API indicating if scope exists (has packages) or not
- **Scope Availability**: Final determination of whether scope name is available for use
- **API Response**: Response data from npm registry search endpoint for scoped packages

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users receive scope validation feedback within 100ms of typing or form submission
- **SC-002**: 95% of invalid scope inputs are caught before any API calls are made
- **SC-003**: Users can successfully enter a valid scope name and proceed to availability check on first attempt 90% of the time
- **SC-004**: System accurately determines scope availability by checking for existing packages with that scope 95% of the time
- **SC-005**: npm registry API calls complete within 2 seconds 95% of the time
- **SC-006**: System handles API failures gracefully without crashing 100% of the time
- **SC-007**: Users receive clear feedback about scope unavailability due to existing packages 100% of the time
- **SC-008**: System reduces unnecessary scope availability checks by at least 80% through input validation
