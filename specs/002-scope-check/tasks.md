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

- [ ] T001 Verify Vitest testing framework with @testing-library/react configuration ✅ ALREADY DONE
- [ ] T002 [P] Review existing npmRegistry.ts structure and patterns
- [ ] T003 [P] Verify existing validation utilities in src/utils/validation.ts
- [ ] T004 [P] Review existing useAvailabilityChecker hook implementation
- [ ] T005 [P] Verify existing OrgNameChecker component structure
- [ ] T006 [P] Verify validateOrganizationName function exists in src/utils/validation.ts
- [ ] T007 [P] Document validateOrganizationName validation rules in src/utils/validation.ts
- [ ] T008 [P] Test validateOrganizationName with scope names in src/utils/validation.test.ts
- [ ] T009 Review existing error handling patterns and timeout configuration

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 2: User Story 1 - Validate Unified Name Input Format (Priority: P1) 🎯 MVP

**Goal**: Implement unified name validation that works for both organization names and scopes without format detection

**Independent Test**: Can be fully tested by entering various name formats and verifying validation rules are applied correctly without making any external API calls

### Tests for User Story 1 ⚠️ **PREREQUISITES**

> **CRITICAL: These tests MUST be written and FAIL before any implementation tasks**

- [ ] T010 [P] [US1] Test unified validation with valid organization names in src/utils/validation.test.ts
- [ ] T011 [P] [US1] Test unified validation with valid scope names in src/utils/validation.test.ts
- [ ] T012 [P] [US1] Test unified validation with invalid formats in src/utils/validation.test.ts
- [ ] T013 [P] [US1] Test validation edge cases (length, special characters) in src/utils/validation.test.ts

**⚠️ PREREQUISITE CHECKPOINT**: Run `npm test src/utils/validation.test.ts` and verify ALL tests T010-T013 FAIL before proceeding to implementation

### Implementation for User Story 1

- [ ] T014 [US1] Verify existing validateOrganizationName function handles all name types in src/utils/validation.ts
- [ ] T015 [US1] Confirm unified validation applies to all input types in src/utils/validation.ts
- [ ] T016 [US1] Remove any format detection logic from validation flow in src/utils/validation.ts
- [ ] T017 [US1] Update validation documentation to reflect unified approach in src/utils/validation.ts
- [ ] T018 [US1] Add validation type definitions for unified name checking in src/types/index.ts
- [ ] T019 [US1] Update validation error messages to be name-type agnostic in src/utils/validation.ts

**Checkpoint**: Run `npm test src/utils/validation.test.ts` and verify ALL tests T010-T019 PASS

---

## Phase 3: User Story 2 - Check Unified Name Availability on NPM Registry (Priority: P1)

**Goal**: Implement comprehensive name availability checking across user, scope, and organization types

**Independent Test**: Can be fully tested by entering known existing and non-existing names and verifying the correct availability determination

### Tests for User Story 2 ⚠️ **PREREQUISITES**

> **CRITICAL: These tests MUST be written and FAIL before any implementation tasks**

- [ ] T020 [P] [US2] Test checkScopeExists function with existing scope in src/utils/npmRegistry.test.ts
- [ ] T021 [P] [US2] Test checkScopeExists function with available scope in src/utils/npmRegistry.test.ts
- [ ] T022 [P] [US2] Test checkScopeExists function with network errors in src/utils/npmRegistry.test.ts
- [ ] T023 [P] [US2] Test checkScopeExists function with timeout errors in src/utils/npmRegistry.test.ts
- [ ] T024 [P] [US2] Test enhanced checkNameAvailability with user conflict in src/utils/npmRegistry.test.ts
- [ ] T025 [P] [US2] Test enhanced checkNameAvailability with scope conflict in src/utils/npmRegistry.test.ts
- [ ] T026 [P] [US2] Test enhanced checkNameAvailability with organization conflict in src/utils/npmRegistry.test.ts
- [ ] T027 [P] [US2] Test enhanced checkNameAvailability with no conflicts in src/utils/npmRegistry.test.ts

**⚠️ PREREQUISITE CHECKPOINT**: Run `npm test src/utils/npmRegistry.test.ts` and verify ALL tests T020-T027 FAIL before proceeding to implementation

### Implementation for User Story 2

- [ ] T028 [P] [US2] Add ScopeCheckResponse interface in src/utils/npmRegistry.ts
- [ ] T029 [US2] Implement checkScopeExists function in src/utils/npmRegistry.ts
- [ ] T030 [US2] Add npm replicate endpoint URL construction logic in src/utils/npmRegistry.ts
- [ ] T031 [US2] Add corsmirror proxy integration for scope checking in src/utils/npmRegistry.ts
- [ ] T032 [US2] Implement scope existence parsing (rows.length > 0) in src/utils/npmRegistry.ts
- [ ] T033 [US2] Add comprehensive error handling for scope checking in src/utils/npmRegistry.ts
- [ ] T034 [US2] Enhance checkNameAvailability function with scope checking step in src/utils/npmRegistry.ts
- [ ] T035 [US2] Add timeout handling for scope checking API calls in src/utils/npmRegistry.ts
- [ ] T036 [US2] Update error handling to include scope-specific context in src/utils/npmRegistry.ts

**Checkpoint**: Run `npm test src/utils/npmRegistry.test.ts` and verify ALL tests T020-T036 PASS

---

## Phase 4: User Story 3 - Display Real-time Unified Name Validation Feedback (Priority: P2)

**Goal**: Ensure real-time validation feedback works seamlessly for all name types

**Independent Test**: Can be fully tested by typing various name inputs and verifying that validation feedback appears/disappears appropriately in real-time

### Tests for User Story 3 ⚠️ **PREREQUISITES**

> **CRITICAL: These tests MUST be written and FAIL before any implementation tasks**

- [ ] T037 [P] [US3] Test real-time validation feedback for organization names in src/hooks/useAvailabilityChecker.test.ts
- [ ] T038 [P] [US3] Test real-time validation feedback for scope names in src/hooks/useAvailabilityChecker.test.ts
- [ ] T039 [P] [US3] Test validation feedback clearing on input correction in src/hooks/useAvailabilityChecker.test.ts
- [ ] T040 [P] [US3] Test debouncing behavior with enhanced validation in src/hooks/useAvailabilityChecker.test.ts

**⚠️ PREREQUISITE CHECKPOINT**: Run `npm test src/hooks/useAvailabilityChecker.test.ts` and verify ALL tests T037-T040 FAIL before proceeding to implementation

### Implementation for User Story 3

- [ ] T041 [US3] Verify useAvailabilityChecker hook works with enhanced validation in src/hooks/useAvailabilityChecker.ts
- [ ] T042 [US3] Test real-time validation feedback for all name types in src/hooks/useAvailabilityChecker.ts
- [ ] T043 [US3] Verify 300ms debounce works with scope checking in src/hooks/useAvailabilityChecker.ts
- [ ] T044 [US3] Update error message handling for scope conflicts in src/hooks/useAvailabilityChecker.ts

**Checkpoint**: Run `npm test src/hooks/useAvailabilityChecker.test.ts` and verify ALL tests T037-T044 PASS

---

## Phase 5: Edge Cases & Error Handling (Critical Coverage)

**Purpose**: Address edge cases identified in spec.md to ensure complete coverage and robust error handling

### Edge Case Tests ⚠️ **PREREQUISITES**

- [ ] T045 [P] Test scope names with special characters (#, $) in src/utils/validation.test.ts
- [ ] T046 [P] Test extremely long scope names (over 214 characters) in src/utils/validation.test.ts
- [ ] T047 [P] Test scope names starting/ending with hyphens/underscores in src/utils/validation.test.ts
- [ ] T048 [P] Test scope names with only numbers in src/utils/validation.test.ts
- [ ] T049 [P] Test scope names with non-ASCII characters in src/utils/validation.test.ts
- [ ] T050 [P] Test npm registry API downtime scenarios in src/utils/npmRegistry.test.ts
- [ ] T051 [P] Test slow npm registry responses in src/utils/npmRegistry.test.ts
- [ ] T052 [P] Test unexpected npm registry response formats in src/utils/npmRegistry.test.ts
- [ ] T053 [P] Test scopes conflicting with reserved npm names in src/utils/npmRegistry.test.ts
- [ ] T054 [P] Test organization names vs user names distinction in src/utils/npmRegistry.test.ts

### Edge Case Implementation

- [ ] T055 [P] Add special character validation for edge cases in src/utils/validation.ts
- [ ] T056 [P] Add length validation for extreme cases in src/utils/validation.ts
- [ ] T057 [P] Add timeout handling for slow API responses in src/utils/npmRegistry.ts
- [ ] T058 [P] Add response format validation in src/utils/npmRegistry.ts
- [ ] T059 [P] Add reserved name checking logic in src/utils/npmRegistry.ts
- [ ] T060 [P] Add non-ASCII character handling in src/utils/validation.ts

**Checkpoint**: Run `npm test` and verify ALL tests T045-T060 PASS

---

## Phase 6: Performance & Quality Assurance

**Purpose**: Validate performance requirements and ensure code quality

### Performance Tests ⚠️ **PREREQUISITES**

- [ ] T061 [P] Test validation feedback within 100ms requirement in src/utils/validation.test.ts
- [ ] T062 [P] Test API calls complete within 2 seconds 95% of time in src/utils/npmRegistry.test.ts
- [ ] T063 [P] Test system handles API failures gracefully 100% of time in src/utils/npmRegistry.test.ts
- [ ] T064 [P] Test 80% reduction in unnecessary org checks metric in src/utils/npmRegistry.test.ts

### Performance Implementation

- [ ] T065 [P] Add performance monitoring for validation timing in src/utils/validation.ts
- [ ] T066 [P] Add API response time tracking in src/utils/npmRegistry.ts
- [ ] T067 [P] Optimize validation sequence for performance in src/utils/npmRegistry.ts
- [ ] T068 [P] Implement performance metrics collection for SC-004 validation in src/utils/npmRegistry.ts

**Checkpoint**: Run `npm test` and verify ALL tests T061-T068 PASS

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T069 [P] Update npmRegistry.ts documentation with scope checking functionality
- [ ] T070 [P] Run comprehensive test suite with 100% coverage verification
- [ ] T071 [P] Performance testing of enhanced validation sequence
- [ ] T072 [P] Update component documentation to reflect unified checking
- [ ] T073 [P] Verify error handling consistency across all name types
- [ ] T074 [P] Manual testing in browser with various name scenarios
- [ ] T075 [P] Code cleanup and refactoring for maintainability
- [ ] T076 [P] Update README.md with scope checking information

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 2-4)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Edge Cases (Phase 5)**: Depends on User Stories 1-2 completion
- **Performance (Phase 6)**: Depends on all core functionality complete
- **Polish (Phase 7)**: Depends on all desired phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 1) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 1) - Depends on US1 validation foundation
- **User Story 3 (P2)**: Can start after Foundational (Phase 1) - Depends on US1 and US2 validation logic

### TDD Requirements **CRITICAL**

**Within Each User Story**:

1. **Tests MUST be written and FAIL before implementation** (TDD approach)
2. **Prerequisite checkpoint**: Run specific test command and verify tests FAIL before any implementation tasks
3. **Implementation after failing tests**: Only after verified failure
4. **Models before services**
5. **Services before endpoints**
6. **Core implementation before integration**
7. **Story complete before moving to next priority**

### TDD Verification Commands **CONSTITUTION REQUIREMENT**

**User Story 1**:

```bash
# After T010-T013: Verify tests fail
npm test src/utils/validation.test.ts

# After T014-T019: Verify tests pass
npm test src/utils/validation.test.ts
```

**User Story 2**:

```bash
# After T020-T027: Verify tests fail
npm test src/utils/npmRegistry.test.ts

# After T028-T036: Verify tests pass
npm test src/utils/npmRegistry.test.ts
```

**User Story 3**:

```bash
# After T037-T040: Verify tests fail
npm test src/hooks/useAvailabilityChecker.test.ts

# After T041-T044: Verify tests pass
npm test src/hooks/useAvailabilityChecker.test.ts
```

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- All test tasks marked [P] can run in parallel (within their story)
- All implementation tasks marked [P] can run in parallel (within their story)
- Edge case tests can run in parallel with other test phases
- Performance tests can run in parallel with polish tasks

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together (PREREQUISITES):
Task: "Test checkScopeExists function with existing scope in src/utils/npmRegistry.test.ts"
Task: "Test checkScopeExists function with available scope in src/utils/npmRegistry.test.ts"
Task: "Test checkScopeExists function with network errors in src/utils/npmRegistry.test.ts"
Task: "Test checkScopeExists function with timeout errors in src/utils/npmRegistry.test.ts"

# Verify ALL TESTS FAIL before proceeding
npm test src/utils/npmRegistry.test.ts

# Launch core implementation tasks for User Story 2 together:
Task: "Implement checkScopeExists function in src/utils/npmRegistry.ts"
Task: "Add npm replicate endpoint URL construction logic in src/utils/npmRegistry.ts"
Task: "Add corsmirror proxy integration for scope checking in src/utils/npmRegistry.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Foundational (CRITICAL - blocks all stories)
2. Complete Phase 2: User Story 1 tests (T010-T013) - **VERIFY FAILING**
3. Complete Phase 2: User Story 1 implementation (T014-T019)
4. Complete Phase 3: User Story 2 tests (T020-T027) - **VERIFY FAILING**
5. Complete Phase 3: User Story 2 implementation (T028-T036)
6. **STOP AND VALIDATE**: Test scope checking functionality independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 (tests fail → implement) → Test independently → Validate foundation
3. Add User Story 2 (tests fail → implement) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 (tests fail → implement) → Test independently → Deploy/Demo
5. Add Edge Cases → Test independently → Deploy/Demo
6. Add Performance validation → Test independently → Deploy/Demo
7. Each phase adds value without breaking previous phases

### Sequential Strategy (Recommended for this feature)

Due to shared utility functions and consolidated approach:

1. Team completes Foundational together
2. Complete User Story 1 (validation foundation) - **TDD enforced**
3. Complete User Story 2 (core scope checking) - **TDD enforced**
4. Complete User Story 3 (real-time feedback) - **TDD enforced**
5. Complete Edge Cases (robustness) - **TDD enforced**
6. Complete Performance validation (quality) - **TDD enforced**
7. Complete Polish phase
8. Each phase builds on the previous while maintaining independence

---

## Critical TDD Enforcement

**CONSTITUTION REQUIREMENT**: 100% test coverage with TDD approach

**TDD Sequence for Each User Story**:

1. **Write Tests**: Complete all test tasks for the story
2. **Verify Failure**: Run tests and confirm they ALL FAIL
3. **Implement**: Complete implementation tasks
4. **Verify Passing**: Run tests and confirm they ALL PASS
5. **Refactor**: Clean up code while maintaining test coverage
6. **Coverage Check**: Verify 100% coverage maintained

**Failure to follow TDD sequence violates constitution principles**

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD MANDATORY**: Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Focus on enhancing existing utilities rather than creating new components
- Maintain 100% test coverage throughout implementation
- No UI changes required - all enhancements in utility layer
- **Edge cases are critical for complete coverage**
- **Performance validation is required for success criteria**
- **Non-ASCII character support added for comprehensive edge case coverage**
- **Performance measurement task added for SC-004 validation**
