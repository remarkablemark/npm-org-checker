# Feature Specification: Check User Name First

**Feature Branch**: `001-check-user-name`  
**Created**: 2025-02-22  
**Status**: Draft  
**Input**: User description: "check for user name first"

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

### User Story 1 - Validate User Name Input (Priority: P1)

As a user, I want the system to validate user name input before checking npm registry, so that I can quickly identify and correct any issues with the user name.

**Why this priority**: This is the foundational validation step that prevents unnecessary API calls and provides immediate feedback to users about invalid input.

**Independent Test**: Can be fully tested by entering various user name formats and verifying validation rules are applied correctly without making any external API calls.

**Acceptance Scenarios**:

1. **Given** I have entered a valid user name, **When** the input becomes valid, **Then** the system should proceed to check if the user exists on npm registry
2. **Given** I have entered an invalid user name (empty, too short, or contains invalid characters), **When** the input is invalid, **Then** the system should display specific validation error messages and not proceed to any API calls

---

### User Story 2 - Check User Name Availability Impact on Organization (Priority: P1)

As a user, I want the system to check if a user name exists on npm registry and determine its impact on organization availability, so that I understand whether my desired organization name is available.

**Why this priority**: This is the core logic that determines organization availability based on user name existence, providing clear feedback about availability conflicts.

**Independent Test**: Can be fully tested by entering known existing and non-existing user names and verifying the correct organization availability determination.

**Acceptance Scenarios**:

1. **Given** I have entered a user name that exists on npm registry, **When** the system checks the user, **Then** it should indicate that the organization name is not available because the user name is taken
2. **Given** I have entered a user name that does not exist on npm registry, **When** the system checks the user, **Then** it should proceed to check organization availability through other means

---

### User Story 3 - Display Real-time Validation Feedback (Priority: P2)

As a user, I want to see real-time validation feedback as I type a user name, so that I can correct errors immediately without waiting for form submission.

**Why this priority**: Improves user experience by providing immediate feedback and reducing frustration from form submission errors.

**Independent Test**: Can be fully tested by typing various user name inputs and verifying that validation feedback appears/disappears appropriately in real-time.

**Acceptance Scenarios**:

1. **Given** I am typing a user name, **When** I enter invalid characters, **Then** the system should show an error message immediately
2. **Given** I am typing a user name, **When** I correct the invalid input, **Then** the error message should disappear immediately

---

### Edge Cases

- What happens when user name contains special characters like @, #, $, etc.?
- How does system handle extremely long user names (over 100 characters)?
- What happens when user name starts or ends with hyphens or underscores?
- How does system handle user names with only numbers?
- What happens when user name contains non-ASCII characters?
- What happens when npm registry API is down or unreachable?
- How does system handle slow responses from npm registry search API?
- What happens when npm registry returns unexpected response format?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST validate user name input before checking npm registry
- **FR-002**: System MUST enforce minimum length requirement for user names (at least 1 character)
- **FR-003**: System MUST enforce maximum length requirement for user names (no more than 100 characters)
- **FR-004**: System MUST only allow alphanumeric characters, hyphens, and underscores in user names
- **FR-005**: System MUST prevent user names from starting or ending with hyphens or underscores
- **FR-006**: System MUST display specific error messages for different validation failures
- **FR-007**: System MUST provide real-time validation feedback as user types
- **FR-008**: System MUST clear validation errors when user corrects invalid input
- **FR-009**: System MUST prevent form submission when user name validation fails
- **FR-010**: System MUST check if user exists on npm registry using the search API endpoint
- **FR-011**: System MUST use the npm registry search endpoint: `https://registry.npmjs.org/-/v1/search?text=author:<user>&size=1`
- **FR-012**: System MUST determine organization is not available when user name exists on npm registry
- **FR-013**: System MUST display clear message that organization name is unavailable because user name is taken
- **FR-014**: System MUST proceed to additional organization availability checks only when user name does not exist on npm registry
- **FR-015**: System MUST handle npm registry API errors gracefully with user-friendly messages
- **FR-016**: System MUST implement timeout handling for npm registry API calls

### Key Entities

- **User Name**: Text input representing npm user name, must follow npm username validation rules
- **Validation State**: Current validation status of user name (valid, invalid, pending)
- **Error Message**: Specific feedback indicating why user name validation failed
- **User Existence Result**: Result from npm registry search API indicating if user exists (taken) or not
- **Organization Availability**: Final determination of whether organization name is available
- **API Response**: Response data from npm registry search endpoint

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

## Clarifications

### Session 2025-02-22

- Q: Code reuse strategy for existing validation and API utilities → A: Extend existing utilities to handle both organization and user name validation, and add user existence checking to npmRegistry utilities
- Q: User name validation rules specificity → A: Use same rules as organization names (lowercase letters, numbers, hyphens only)
- Q: Real-time API call debouncing strategy → A: Reuse existing 300ms debounce pattern from useAvailabilityChecker
- Q: User existence API response handling → A: User exists if JSON response objects array length > 0
- Q: Integration with existing UI components → A: Extend existing OrgNameChecker to add user name validation step before organization checking
- Q: CORS proxy for npm search API → A: Use corsmirror.com proxy for npm registry search API calls (same as existing organization checks)

### Measurable Outcomes

- **SC-001**: Users receive validation feedback within 100ms of typing or form submission
- **SC-002**: 95% of invalid user name inputs are caught before any API calls are made
- **SC-003**: Users can successfully enter a valid user name and proceed to availability check on first attempt 90% of the time
- **SC-004**: System reduces unnecessary organization availability checks by at least 80% through user existence validation
- **SC-005**: npm registry API calls complete within 2 seconds 95% of the time
- **SC-006**: System handles API failures gracefully without crashing 100% of the time
- **SC-007**: Users receive clear feedback about organization unavailability due to existing user names 100% of the time
