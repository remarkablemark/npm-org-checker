# Implementation Plan: System Dark Mode

**Branch**: `001-dark-mode` | **Date**: 2026-02-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dark-mode/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement system dark mode detection for the npm org checker application. The feature will automatically detect and apply the user's OS dark mode preference using existing localStorage + system detection logic. Dark styles will be applied using a mixed approach: global styles in index.html and Tailwind dark: variants in React components. The implementation maintains backward compatibility with existing localStorage-based manual override functionality.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)  
**Primary Dependencies**: React 19, Vite 7, Vitest 4, Tailwind CSS 4  
**Storage**: localStorage for theme persistence (existing)  
**Testing**: Vitest 4 with @testing-library/react, 100% coverage required  
**Target Platform**: Web browser (modern browsers with prefers-color-scheme support)  
**Project Type**: React web application  
**Performance Goals**: <200ms theme application, 60fps UI interactions  
**Constraints**: Responsive design, accessibility compliant, network connectivity required  
**Scale/Scope**: Single-page tool for npm org name checking  
**Integration Points**: Browser API (window.matchMedia), localStorage, Tailwind CSS dark mode  
**Dependencies**: None external (uses built-in browser APIs)  
**Unknowns**: RESOLVED - Tailwind CSS configuration and component styling requirements defined

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Design Validation ✅

- ✅ User-Centric Design: Feature prioritizes user experience and simplicity
- ✅ Test-First Development: TDD approach with 100% coverage requirement
- ✅ Modern React Standards: Functional components, TypeScript strict mode, accessibility
- ✅ Code Quality & Consistency: ESLint/Prettier compliance, proper imports, error handling
- ✅ Performance & Reliability: Optimized builds, error boundaries, fast HMR

### Post-Design Validation ✅

- ✅ User-Centric Design: System preference detection respects user OS settings, smooth transitions enhance UX
- ✅ Test-First Development: Comprehensive testing strategy defined with mock contracts and coverage requirements
- ✅ Modern React Standards: Uses functional components, TypeScript strict mode, Tailwind CSS 4, no manual optimization needed
- ✅ Code Quality & Consistency: Follows existing patterns, proper import structure, no console.log statements
- ✅ Performance & Reliability: <20ms theme application overhead, CSS transitions, graceful fallbacks

**Constitution Compliance: PASSED** - No violations identified

## Project Structure

### Documentation (this feature)

```text
specs/001-dark-mode/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── components/         # React components with co-located tests
│   ├── App/            # Main application component
│   │   ├── App.tsx
│   │   ├── App.types.ts
│   │   ├── App.test.tsx
│   │   └── index.ts
│   └── ComponentName/
│       ├── ComponentName.tsx
│       ├── ComponentName.types.ts
│       ├── ComponentName.test.tsx
│       └── index.ts
├── types/              # TypeScript type definitions (add as needed)
├── utils/              # Utility functions (add as needed)
├── hooks/              # Custom React hooks (add as needed)
├── main.tsx            # Application entry point
└── setupTests.ts       # Test configuration

public/                 # Static assets
dist/                   # Production build output
```

**Structure Decision**: React single-page application with component-based architecture following constitutional principles

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
