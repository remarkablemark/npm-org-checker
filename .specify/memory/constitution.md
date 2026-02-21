<!--
Sync Impact Report:
- Version change: none → 1.0.0 (initial constitution)
- Added sections: All sections (initial creation)
- Templates requiring updates: ✅ plan-template.md (Constitution Check aligned), ✅ spec-template.md (scope aligned), ✅ tasks-template.md (task categorization aligned)
- Follow-up TODOs: None
-->

# npm org checker Constitution

## Core Principles

### I. User-Centric Design

Every feature must prioritize user experience and simplicity. The tool should be intuitive for developers checking npm organization name availability. Interface must be clean, responsive, and provide immediate feedback.

### II. Test-First Development

TDD mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. 100% coverage required for all non-barrel-export files. Integration tests for API interactions and user workflows.

### III. Modern React Standards

Functional components only with React 19 and TypeScript 5 in strict mode. Hooks at top level, proper event typing, semantic HTML, and accessibility-first approach. React Compiler handles optimization - no manual useMemo/useCallback unless absolutely necessary.

### IV. Code Quality & Consistency

ESLint 9 + Prettier with auto-formatting on save. Import order enforced (external → internal → relative). No console.log or debugger statements. Proper error handling with try-catch for async operations. TSDoc comments for public APIs.

### V. Performance & Reliability

Fast development server with HMR, optimized production builds, and comprehensive error boundaries. Structured error handling with user-friendly messages. Lazy loading for optimal initial load time.

## Technical Standards

### Technology Stack

- React 19 with TypeScript 5 (strict mode)
- Vite 7 for build tooling and development server
- Vitest 4 for testing with 100% coverage requirement
- Tailwind CSS 4 for styling (no custom CSS unless essential)
- ESLint 9 + Prettier for code quality
- Husky + lint-staged for pre-commit hooks

### File Organization

Components in `src/components/` with co-located types and tests. Absolute imports using `src/` alias. Barrel exports in index.ts files. Test files follow `ComponentName.test.tsx` naming convention.

### Development Workflow

All PRs must pass: lint, type check, and full test suite with coverage. Conventional commits enforced via commitlint. No failing tests allowed in main branch. Feature development follows TDD discipline.

## Governance

This constitution supersedes all other development practices. Amendments require: documentation of changes, team approval, and migration plan for existing code. All code reviews must verify constitutional compliance. Complexity must be justified with clear rationale.

**Version**: 1.0.0 | **Ratified**: 2025-02-21 | **Last Amended**: 2025-02-21
