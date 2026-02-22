---
description: 'Task list for NPM Organization Name Availability Checker implementation'
---

# Tasks: NPM Organization Name Availability Checker

**Input**: Design documents from `/specs/001-npm-org-check/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included as required by constitution (TDD with 100% coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **React web app**: `src/`, `tests/` at repository root
- **Components**: `src/components/ComponentName/` with co-located tests
- **Paths shown below follow React app structure from plan.md**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

**NOTE**: This is an existing project - verify current setup meets requirements

- [x] T001 Verify existing React project structure matches implementation plan
- [x] T002 Verify TypeScript React app with required dependencies (React 19, Vite 7, Vitest 4, Tailwind CSS 4)
- [x] T003 [P] Verify ESLint, Prettier, and TypeScript strict mode configuration
- [x] T004 Verify Vitest testing framework with @testing-library/react configuration

**Checkpoint**: Project setup verified and ready for development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create TypeScript type definitions in src/types/index.ts
- [x] T006 [P] Create utility functions directory structure in src/utils/
- [x] T007 [P] Create custom hooks directory structure in src/hooks/
- [x] T008 [P] Create component directory structure per plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Check Organization Name Availability (Priority: P1) 🎯 MVP

**Goal**: Enable developers to check npm organization name availability with immediate visual feedback

**Independent Test**: Can be fully tested by entering an organization name and receiving clear available/unavailable response with validation feedback

### Tests for User Story 1 (TDD - Write First, Ensure They Fail) ⚠️

- [x] T009 Setup global error boundaries and error handling patterns
- [x] T010 [P] [US1] Component test for OrgNameChecker in src/components/OrgNameChecker/OrgNameChecker.test.tsx
- [x] T011 [P] [US1] Component test for AvailabilityIndicator in src/components/AvailabilityIndicator/AvailabilityIndicator.test.tsx
- [x] T012 [P] [US1] Component test for ErrorMessage in src/components/ErrorMessage/ErrorMessage.test.tsx
- [x] T013 [P] [US1] Hook test for useOrgNameValidator in src/hooks/useOrgNameValidator.test.ts
- [x] T014 [P] [US1] Hook test for useAvailabilityChecker in src/hooks/useAvailabilityChecker.test.ts
- [x] T015 [P] [US1] Utility test for validation in src/utils/validation.test.ts
- [x] T016 [P] [US1] Utility test for npmRegistry in src/utils/npmRegistry.test.ts

### Implementation for User Story 1

- [x] T017 [P] [US1] Create validation utility functions in src/utils/validation.ts
- [x] T018 [P] [US1] Create npm registry API utility in src/utils/npmRegistry.ts
- [x] T019 [P] [US1] Create useOrgNameValidator hook in src/hooks/useOrgNameValidator.ts
- [x] T020 [P] [US1] Create useAvailabilityChecker hook in src/hooks/useAvailabilityChecker.ts
- [x] T021 [P] [US1] Create AvailabilityIndicator component in src/components/AvailabilityIndicator/AvailabilityIndicator.tsx
- [x] T022 [P] [US1] Create AvailabilityIndicator types in src/components/AvailabilityIndicator/AvailabilityIndicator.types.ts
- [x] T023 [P] [US1] Create ErrorMessage component in src/components/ErrorMessage/ErrorMessage.tsx
- [x] T024 [P] [US1] Create ErrorMessage types in src/components/ErrorMessage/ErrorMessage.types.ts
- [x] T025 [US1] Create OrgNameChecker component in src/components/OrgNameChecker/OrgNameChecker.tsx
- [x] T026 [US1] Create OrgNameChecker types in src/components/OrgNameChecker/OrgNameChecker.types.ts
- [x] T027 [US1] Update App component to use OrgNameChecker in src/components/App/App.tsx
- [x] T028 [US1] Add accessibility features (ARIA labels, keyboard navigation) to all components
- [x] T029 [US1] Add responsive design with Tailwind CSS (mobile-first, 600px max desktop)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Real-time Validation Feedback (Priority: P2)

**Goal**: Provide immediate validation feedback as users type to improve user experience

**Independent Test**: Can be fully tested by typing characters and observing validation states change dynamically

### Tests for User Story 2 (TDD - Write First, Ensure They Fail) ⚠️

- [x] T030 [P] [US2] Integration test for real-time validation in src/integration/realtime-validation.test.tsx
- [x] T031 [P] [US2] Component test for debounced input in src/components/OrgNameChecker/OrgNameChecker.debounce.test.tsx

### Implementation for User Story 2

- [x] T032 [P] [US2] Implement 300ms debouncing in useAvailabilityChecker hook in src/hooks/useAvailabilityChecker.ts
- [x] T033 [US2] Add real-time validation feedback to OrgNameChecker component in src/components/OrgNameChecker/OrgNameChecker.tsx
- [x] T034 [US2] Enhance validation error display in ErrorMessage component in src/components/ErrorMessage/ErrorMessage.tsx
- [x] T035 [US2] Add loading state management during debounced API calls in src/hooks/useAvailabilityChecker.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 6: Polish & Documentation (Priority: P4)

**Goal**: Finalize the application with documentation and minor improvements

### Final Tasks

- [ ] T036 [P] Update README with usage instructions and feature overview
- [ ] T037 [P] Add comprehensive documentation comments to components
- [ ] T038 [P] Final accessibility audit and improvements
- [x] T039 [P] Performance optimization review
- [x] T040 [P] Final testing and validation

**Checkpoint**: Application is production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds new functionality but should be independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Utilities before hooks
- Hooks before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
Task: "Component test for OrgNameChecker in src/components/OrgNameChecker/OrgNameChecker.test.tsx"
Task: "Component test for AvailabilityIndicator in src/components/AvailabilityIndicator/AvailabilityIndicator.test.tsx"
Task: "Component test for ErrorMessage in src/components/ErrorMessage/ErrorMessage.test.tsx"
Task: "Hook test for useOrgNameValidator in src/hooks/useOrgNameValidator.test.ts"
Task: "Hook test for useAvailabilityChecker in src/hooks/useAvailabilityChecker.test.ts"
Task: "Utility test for validation in src/utils/validation.test.ts"
Task: "Utility test for npmRegistry in src/utils/npmRegistry.test.ts"

# Launch all utilities for User Story 1 together:
Task: "Create validation utility functions in src/utils/validation.ts"
Task: "Create npm registry API utility in src/utils/npmRegistry.ts"

# Launch all hooks for User Story 1 together:
Task: "Create useOrgNameValidator hook in src/hooks/useOrgNameValidator.ts"
Task: "Create useAvailabilityChecker hook in src/hooks/useAvailabilityChecker.ts"

# Launch all components for User Story 1 together:
Task: "Create AvailabilityIndicator component in src/components/AvailabilityIndicator/AvailabilityIndicator.tsx"
Task: "Create ErrorMessage component in src/components/ErrorMessage/ErrorMessage.tsx"
Task: "Create OrgNameChecker component in src/components/OrgNameChecker/OrgNameChecker.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 52
- **Setup Phase**: 4 tasks
- **Foundational Phase**: 5 tasks
- **User Story 1**: 20 tasks (7 tests + 13 implementation)
- **User Story 2**: 5 tasks (2 tests + 3 implementation)
- **User Story 3**: 9 tasks (2 tests + 7 implementation)
- **Polish Phase**: 8 tasks

### Parallel Opportunities Identified

- **Setup**: 4 parallel tasks
- **Foundational**: 5 parallel tasks
- **US1 Tests**: 7 parallel tests
- **US1 Implementation**: 6 parallel utility/hook tasks, 4 parallel component tasks
- **US2**: 2 parallel tests, 2 parallel implementation tasks
- **US3**: 2 parallel tests, 5 parallel implementation tasks
- **Polish**: 5 parallel tasks

### MVP Scope

**User Story 1 only** (20 tasks) provides:

- Core availability checking functionality
- Visual feedback with ✅/❌ indicators
- Validation and error handling
- Responsive design
- Accessibility compliance
- Complete test coverage

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Constitution requires 100% test coverage - all implementation tasks must have corresponding tests
