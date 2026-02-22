---
description: 'Task list for NPM Scope Checker feature implementation'
---

# Tasks: NPM Scope Checker

**Input**: Design documents from `/specs/002-scope-check/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED - TDD approach with 100% coverage per feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **React web app**: `src/` at repository root
- **Components**: `src/components/ComponentName/` with co-located tests
- **Utilities**: `src/utils/` with co-located tests
- **Hooks**: `src/hooks/` with co-located tests

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Verify Vitest testing framework with @testing-library/react configuration ✅ ALREADY DONE
- [ ] T005 [P] Review existing npmRegistry.ts structure and patterns
- [ ] T006 [P] Verify existing validation utilities in src/utils/validation.ts
- [ ] T007 [P] Review existing useAvailabilityChecker hook implementation
- [ ] T008 [P] Verify existing OrgNameChecker component structure
- [ ] T009 Review existing error handling patterns and timeout configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Validate Unified Name Input Format (Priority: P1) 🎯 MVP

**Goal**: Implement unified name validation that works for both organization names and scopes without format detection

**Independent Test**: Can be fully tested by entering various name formats and verifying validation rules are applied correctly without making any external API calls

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Test unified validation with valid organization names in src/utils/validation.test.ts
- [ ] T011 [P] [US1] Test unified validation with valid scope names in src/utils/validation.test.ts
- [ ] T012 [P] [US1] Test unified validation with invalid formats in src/utils/validation.test.ts
- [ ] T013 [P] [US1] Test validation edge cases (length, special characters) in src/utils/validation.test.ts

### Implementation for User Story 1

- [ ] T014 [US1] Verify existing validateOrganizationName function handles all name types in src/utils/validation.ts
- [ ] T015 [US1] Update validation documentation to reflect unified approach in src/utils/validation.ts
- [ ] T016 [US1] Add validation type definitions for unified name checking in src/types/index.ts
- [ ] T017 [US1] Update validation error messages to be name-type agnostic in src/utils/validation.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Check Unified Name Availability on NPM Registry (Priority: P1)

**Goal**: Implement comprehensive name availability checking across user, scope, and organization types

**Independent Test**: Can be fully tested by entering known existing and non-existing names and verifying the correct availability determination

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] Test checkScopeExists function with existing scope in src/utils/npmRegistry.test.ts
- [ ] T019 [P] [US2] Test checkScopeExists function with available scope in src/utils/npmRegistry.test.ts
- [ ] T020 [P] [US2] Test checkScopeExists function with network errors in src/utils/npmRegistry.test.ts
- [ ] T021 [P] [US2] Test checkScopeExists function with timeout errors in src/utils/npmRegistry.test.ts
- [ ] T022 [P] [US2] Test enhanced checkNameAvailability with user conflict in src/utils/npmRegistry.test.ts
- [ ] T023 [P] [US2] Test enhanced checkNameAvailability with scope conflict in src/utils/npmRegistry.test.ts
- [ ] T024 [P] [US2] Test enhanced checkNameAvailability with organization conflict in src/utils/npmRegistry.test.ts
- [ ] T025 [P] [US2] Test enhanced checkNameAvailability with no conflicts in src/utils/npmRegistry.test.ts

### Implementation for User Story 2

- [ ] T026 [P] [US2] Add ScopeCheckResponse interface in src/utils/npmRegistry.ts
- [ ] T027 [US2] Implement checkScopeExists function in src/utils/npmRegistry.ts
- [ ] T028 [US2] Add npm replicate endpoint URL construction logic in src/utils/npmRegistry.ts
- [ ] T029 [US2] Add corsmirror proxy integration for scope checking in src/utils/npmRegistry.ts
- [ ] T030 [US2] Implement scope existence parsing (rows.length > 0) in src/utils/npmRegistry.ts
- [ ] T031 [US2] Add comprehensive error handling for scope checking in src/utils/npmRegistry.ts
- [ ] T032 [US2] Enhance checkNameAvailability function with scope checking step in src/utils/npmRegistry.ts
- [ ] T033 [US2] Add timeout handling for scope checking API calls in src/utils/npmRegistry.ts
- [ ] T034 [US2] Update error handling to include scope-specific context in src/utils/npmRegistry.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: User Story 3 - Display Real-time Unified Name Validation Feedback (Priority: P2)

**Goal**: Ensure real-time validation feedback works seamlessly for all name types

**Independent Test**: Can be fully tested by typing various name inputs and verifying that validation feedback appears/disappears appropriately in real-time

### Tests for User Story 3 ⚠️

- [ ] T035 [P] [US3] Test real-time validation feedback for organization names in src/hooks/useAvailabilityChecker.test.ts
- [ ] T036 [P] [US3] Test real-time validation feedback for scope names in src/hooks/useAvailabilityChecker.test.ts
- [ ] T034 [P] [US3] Test validation feedback clearing on input correction in src/hooks/useAvailabilityChecker.test.ts
- [ ] T037 [P] [US3] Test debouncing behavior with enhanced validation in src/hooks/useAvailabilityChecker.test.ts

### Implementation for User Story 3

- [ ] T038 [US3] Verify useAvailabilityChecker hook works with enhanced validation in src/hooks/useAvailabilityChecker.ts
- [ ] T039 [US3] Test real-time validation feedback for all name types in src/hooks/useAvailabilityChecker.ts
- [ ] T040 [US3] Verify 300ms debounce works with scope checking in src/hooks/useAvailabilityChecker.ts
- [ ] T041 [US3] Update error message handling for scope conflicts in src/hooks/useAvailabilityChecker.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T042 [P] Update npmRegistry.ts documentation with scope checking functionality
- [ ] T043 [P] Run comprehensive test suite with 100% coverage verification
- [ ] T044 [P] Performance testing of enhanced validation sequence
- [ ] T045 [P] Update component documentation to reflect unified checking
- [ ] T046 [P] Verify error handling consistency across all name types
- [ ] T047 [P] Manual testing in browser with various name scenarios
- [ ] T048 [P] Code cleanup and refactoring for maintainability
- [ ] T049 [P] Update README.md with scope checking information

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 2-4)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 1) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 1) - Depends on US1 validation foundation
- **User Story 3 (P2)**: Can start after Foundational (Phase 1) - Depends on US1 and US2 validation logic

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Story 1 can start immediately
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on sequentially due to shared utility functions

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Test checkScopeExists function with existing scope in src/utils/npmRegistry.test.ts"
Task: "Test checkScopeExists function with available scope in src/utils/npmRegistry.test.ts"
Task: "Test checkScopeExists function with network errors in src/utils/npmRegistry.test.ts"

# Launch core implementation tasks for User Story 2 together:
Task: "Implement checkScopeExists function in src/utils/npmRegistry.ts"
Task: "Add npm replicate endpoint URL construction logic in src/utils/npmRegistry.ts"
Task: "Add corsmirror proxy integration for scope checking in src/utils/npmRegistry.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (already done)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (validation foundation)
4. Complete Phase 4: User Story 2 (core scope checking)
5. **STOP AND VALIDATE**: Test scope checking functionality independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate foundation
3. Add User Story 2 → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Sequential Strategy (Recommended for this feature)

Due to shared utility functions and consolidated approach:

1. Team completes Setup + Foundational together
2. Complete User Story 1 (validation foundation)
3. Complete User Story 2 (core scope checking)
4. Complete User Story 3 (real-time feedback)
5. Complete Polish phase
6. Each story builds on the previous while maintaining independence

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Focus on enhancing existing utilities rather than creating new components
- Maintain 100% test coverage throughout implementation
- No UI changes required - all enhancements in utility layer
