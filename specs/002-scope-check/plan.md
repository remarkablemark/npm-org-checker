# Implementation Plan: NPM Scope Checker

**Branch**: `002-scope-check` | **Date**: 2026-02-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-scope-check/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature extends the existing npm organization name checker to include scope availability checking. The implementation will consolidate scope checking into the existing `checkNameAvailability` function following a 3-step validation sequence: user → scope → organization. Users enter names without @ prefix, and the system handles @ prefix addition internally for scope API calls. The approach leverages existing UI components, validation rules, and infrastructure while adding npm replicate endpoint integration for scope checking via corsmirror proxy.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)  
**Primary Dependencies**: React 19, Vite 7, Vitest 4, Tailwind CSS 4  
**Storage**: N/A (client-side application)  
**Testing**: Vitest 4 with @testing-library/react, 100% coverage required  
**Target Platform**: Web browser (modern browsers)  
**Project Type**: React web application  
**Performance Goals**: <200ms initial load, 60fps UI interactions  
**Constraints**: Responsive design, accessibility compliant, network connectivity required  
**Scale/Scope**: Single-page tool for npm org name checking with enhanced scope validation

**Key Integration Points**:

- Extend existing `checkNameAvailability` function in `src/utils/npmRegistry.ts`
- Add `checkScopeExists` function using npm replicate endpoint
- Leverage existing `useAvailabilityChecker` hook with 300ms debounce
- Reuse existing `validateOrganizationName` function for all validation
- Integrate with existing `OrgNameChecker` component without UI changes

**External Dependencies**:

- npm replicate endpoint: `https://replicate.npmjs.com/_all_docs?startkey=%22@<scope>/%22&endkey=%22@<scope>/\ufff0%22`
- corsmirror proxy: `https://corsmirror.com/v1?url=` for CORS handling

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- ✅ User-Centric Design: Feature prioritizes user experience with unified input field and seamless scope checking
- ✅ Test-First Development: TDD approach with 100% coverage requirement for new functionality
- ✅ Modern React Standards: Functional components, TypeScript strict mode, accessibility, no manual optimization
- ✅ Code Quality & Consistency: ESLint/Prettier compliance, proper imports, error handling, no console.log
- ✅ Performance & Reliability: Reuse existing 300ms debounce, optimized API calls, error boundaries

**Post-Design Verification**: All constitutional requirements maintained. No new violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/002-scope-check/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/         # React components with co-located tests
│   ├── App/            # Main application component
│   │   ├── App.tsx
│   │   ├── App.types.ts
│   │   ├── App.test.tsx
│   │   └── index.ts
│   ├── OrgNameChecker/ # Existing component (enhanced)
│   │   ├── OrgNameChecker.tsx
│   │   ├── OrgNameChecker.types.ts
│   │   ├── OrgNameChecker.test.tsx
│   │   └── index.ts
│   ├── ErrorMessage/   # Existing component
│   ├── AvailabilityIndicator/ # Existing component
│   └── ErrorBoundary/  # Existing component
├── utils/              # Utility functions (enhanced)
│   ├── npmRegistry.ts  # Enhanced with scope checking
│   ├── npmRegistry.test.ts
│   ├── validation.ts   # Existing validation utilities
│   └── validation.test.ts
├── hooks/              # Custom React hooks (existing)
│   ├── useAvailabilityChecker.ts # Enhanced with scope logic
│   ├── useAvailabilityChecker.test.ts
│   ├── useOrgNameValidator.ts
│   └── useOrgNameValidator.test.ts
├── types/              # TypeScript type definitions
│   └── index.ts        # Existing types (may need scope additions)
├── main.tsx            # Application entry point
└── setupTests.ts       # Test configuration

public/                 # Static assets
dist/                   # Production build output
```

**Structure Decision**: Extend existing React single-page application with enhanced utility functions while maintaining component-based architecture following constitutional principles

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
