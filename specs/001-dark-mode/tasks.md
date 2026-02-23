---
description: 'Task list for System Dark Mode feature implementation'
---

# Tasks: System Dark Mode

**Input**: Design documents from `/specs/001-dark-mode/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included - feature specification requires 100% coverage and TDD approach

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **React web app**: `src/` at repository root
- **Components**: `src/components/ComponentName/` with co-located tests
- **Paths shown below follow React app structure from plan.md**

## Phase 1: Prerequisites ✅ COMPLETE

All foundational infrastructure is already in place:

- Theme detection logic exists in index.html
- Vitest testing framework configured
- Tailwind CSS 4 with dark mode support configured
- Component structure established

**Ready to begin User Story 1 implementation**

---

## Phase 2: User Story 1 - System Dark Mode Detection (Priority: P1) 🎯 MVP

**Goal**: Automatically detect and apply user's OS dark mode preference so interface matches OS theme

**Independent Test**: Change system dark mode settings and verify application responds with correct theme

### Tests for User Story 1 (TDD - Write First, Ensure They Fail)

- [x] T001 [P] [US1] Create theme detection test in src/components/App/App.test.tsx
- [x] T002 [P] [US1] Create mock matchMedia setup in src/test/setup.ts
- [x] T003 [P] [US1] Create localStorage mock utilities in src/test/mocks/localStorage.ts

### Implementation for User Story 1

- [x] T004 [P] [US1] Add dark mode variants to App component in src/components/App/App.tsx
- [x] T005 [P] [US1] Add dark mode variants to body element in index.html
- [x] T006 [P] [US1] Add theme transition CSS to index.html style block
- [x] T007 [US1] Validate existing theme detection script works correctly in index.html
- [x] T008 [US1] Verify theme detection performance meets <200ms requirement

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 3: User Story 2 - Fallback Behavior (Priority: P2)

**Goal**: Gracefully handle environments where system dark mode detection is not available

**Independent Test**: Simulate browsers without system theme detection support and verify fallback to light theme

### Tests for User Story 2 (TDD - Write First, Ensure They Fail)

- [x] T009 [P] [US2] Create fallback behavior test in src/components/App/App.test.tsx

### Implementation for User Story 2

- [x] T010 [P] [US2] Ensure graceful degradation for older browsers in index.html
- [x] T011 [P] [US2] Test cross-browser compatibility manually

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 4: Component Dark Mode Updates (Cross-Cutting)

**Purpose**: Apply dark mode variants to all remaining UI components

**Independent Test**: Verify all components display correctly in both light and dark themes

### Tests for Component Updates

- [x] T013 [P] Create OrgNameChecker dark mode test in src/components/OrgNameChecker/OrgNameChecker.test.tsx
- [x] T014 [P] Create AvailabilityIndicator dark mode test in src/components/AvailabilityIndicator/AvailabilityIndicator.test.tsx
- [x] T015 [P] Create ErrorMessage dark mode test in src/components/ErrorMessage/ErrorMessage.test.tsx

### Implementation for Component Updates

- [x] T016 [P] Add dark mode variants to OrgNameChecker in src/components/OrgNameChecker/OrgNameChecker.tsx
- [x] T017 [P] Add dark mode variants to AvailabilityIndicator in src/components/AvailabilityIndicator/AvailabilityIndicator.tsx
- [x] T018 [P] Add dark mode variants to ErrorMessage in src/components/ErrorMessage/ErrorMessage.tsx

**Checkpoint**: All components should now support both themes consistently

---

## Phase 5: Smooth Transitions & Performance (Addressing FR-006)

**Purpose**: Implement smooth theme transitions and validate performance requirements

**Independent Test**: Verify theme switching is smooth and meets performance criteria

### Implementation for Transitions & Performance

- [x] T019 [P] Validate theme application timing meets <200ms requirement
- [x] T020 [P] Test smooth transitions work correctly in both themes

**Checkpoint**: Theme switching should be smooth, accessible, and performant

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T021 [P] Run accessibility contrast validation across all components
- [x] T022 [P] Test reduced motion preference support
- [x] T023 [P] Validate performance meets <200ms theme application requirement
- [x] T024 [P] Run full test suite with 100% coverage verification
- [x] T025 [P] Manual testing across different browsers and devices
- [x] T026 [P] Validate quickstart.md implementation steps work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Prerequisites (Phase 1)**: ✅ Complete - no dependencies
- **User Story 1 (Phase 2)**: Can start immediately - no blocking dependencies
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion
- **Component Updates (Phase 4)**: Depends on User Story 1 completion
- **Transitions & Performance (Phase 5)**: Depends on User Story 1 completion
- **Polish (Phase 6)**: Depends on all implementation phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 - builds on detection logic
- **Component Updates**: Depends on User Story 1 - applies styling to existing components
- **Transitions & Performance**: Depends on User Story 1 - enhances core functionality

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- All tests for a user story marked [P] can run in parallel
- Component updates marked [P] can run in parallel (different files)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
Task: "T001 [P] [US1] Create theme detection test in src/components/App/App.test.tsx"
Task: "T002 [P] [US1] Create mock matchMedia setup in src/test/setup.ts"
Task: "T003 [P] [US1] Create localStorage mock utilities in src/test/mocks/localStorage.ts"

# Launch all components for User Story 1 together:
Task: "T004 [P] [US1] Add dark mode variants to App component in src/components/App/App.tsx"
Task: "T005 [P] [US1] Add dark mode variants to body element in index.html"
Task: "T006 [P] [US1] Add theme transition CSS to index.html style block"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Start immediately - Prerequisites complete
2. Complete Phase 2: User Story 1 (Core dark mode detection)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Prerequisites → Ready to start
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add Component Updates → Test across all components → Deploy/Demo
5. Add Transitions & Performance → Validate smooth switching → Deploy/Demo
6. Complete Polish → Final validation → Deploy

### Parallel Team Strategy

With multiple developers:

1. Prerequisites already complete
2. Start immediately:
   - Developer A: User Story 1 (core detection)
   - Developer B: Component updates (styling)
3. Stories complete and integrate independently

---

## Requirement Coverage Mapping

| FR ID  | Requirement        | Tasks Covered          | Status      |
| ------ | ------------------ | ---------------------- | ----------- |
| FR-001 | System detection   | T001, T004, T007, T008 | ✅ Complete |
| FR-002 | Apply theme        | T004, T005, T006       | ✅ Complete |
| FR-003 | Fallback behavior  | T009, T010, T011       | ✅ Complete |
| FR-004 | Component support  | T013-T018              | ✅ Complete |
| FR-005 | Theme consistency  | T016-T018              | ✅ Complete |
| FR-006 | Smooth transitions | T019, T020             | ✅ Complete |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 100% test coverage required per project constitution
- Follow React 19 + TypeScript 5 + Tailwind CSS 4 standards
- Performance requirement: <200ms theme application (aligned across all artifacts)
- **Test Structure**: Tests are colocated with features (ComponentName.test.tsx next to ComponentName.tsx)
- **Test Infrastructure**: Shared test utilities live in src/test/ but are excluded from coverage
- **Cleanup Notes**: Removed redundant browser-compatibility.test.tsx and performance tests - critical functionality consolidated into App.test.tsx
