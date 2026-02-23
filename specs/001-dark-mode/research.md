# Research: System Dark Mode Implementation

**Date**: 2026-02-22  
**Feature**: System Dark Mode  
**Phase**: 0 - Research & Decision Making

## Unknown 1: Tailwind CSS Configuration for Dark Mode

### Research Task

Investigate Tailwind CSS 4 dark mode configuration and best practices for React applications.

### Decision

**Use Tailwind's class strategy with `dark:` variants**

### Rationale

- Tailwind CSS 4 supports dark mode out of the box with the `dark:` variant prefix
- The existing index.html script already adds/removes the `dark` class on the document element
- This approach requires no additional configuration and works seamlessly with the existing theme detection logic
- Class strategy is more performant than media query strategy for dynamic theme switching

### Implementation Approach

```javascript
// Existing logic in index.html already handles this:
document.documentElement.classList.toggle(
  'dark',
  localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches),
);
```

### Alternatives Considered

- **Media query strategy**: Would require `prefers-color-scheme` in Tailwind config, but doesn't support manual override via localStorage
- **Custom CSS variables**: More complex and unnecessary given Tailwind's built-in support

## Unknown 2: Existing Component Dark Style Requirements

### Research Task

Analyze existing React components to identify which elements need dark mode styling.

### Decision

**Apply dark styles to all UI elements using Tailwind dark: variants**

### Rationale

- Current components use light-specific Tailwind classes (e.g., `bg-white`, `text-gray-900`)
- All major UI elements need dark variants for complete theme support
- Consistent dark theme improves user experience across the entire application

### Components Requiring Updates

#### App.tsx

- **Background**: `bg-gray-50` → `dark:bg-gray-900`
- **Text colors**: `text-gray-900` → `dark:text-gray-100`, `text-gray-600` → `dark:text-gray-300`
- **Card background**: `bg-white` → `dark:bg-gray-800`

#### index.html (body)

- **Background**: `bg-gray-50` → `dark:bg-gray-900`

#### OrgNameChecker Component

- **Input field**: `bg-white border-gray-300` → `dark:bg-gray-800 dark:border-gray-600`
- **Text colors**: `text-gray-900` → `dark:text-gray-100`
- **Button backgrounds**: `bg-blue-600` → `dark:bg-blue-500`

#### AvailabilityIndicator Component

- **Status colors**: Ensure proper contrast in dark mode
- **Background colors**: `bg-white` → `dark:bg-gray-800`

#### ErrorMessage Component

- **Error styling**: Ensure red colors remain accessible in dark mode
- **Background**: `bg-red-50` → `dark:bg-red-900/20`

### Implementation Strategy

1. Update each component with appropriate `dark:` variants
2. Ensure all text meets WCAG contrast requirements in both themes
3. Test visual consistency across all components
4. Add smooth transitions for theme switching

## Unknown 3: Browser Compatibility and Fallbacks

### Research Task

Determine browser support for `prefers-color-scheme` and appropriate fallbacks.

### Decision

**Use existing localStorage-first approach with system detection fallback**

### Rationale

- `prefers-color-scheme` is supported in all modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+)
- Existing logic already provides fallback to localStorage
- Graceful degradation to light theme when neither is available
- No additional polyfills needed given modern browser requirement

### Browser Support Matrix

- **Chrome 76+**: Full support
- **Firefox 67+**: Full support
- **Safari 12.1+**: Full support
- **Edge 79+**: Full support
- **IE 11**: Falls back to light theme (acceptable per modern browser constraint)

## Unknown 4: Performance Considerations

### Research Task

Evaluate performance impact of dark mode implementation.

### Decision

**Minimal performance impact with class-based approach**

### Rationale

- CSS class toggling is extremely fast (<1ms)
- Tailwind's utility classes are compiled to minimal CSS
- No runtime JavaScript overhead for theme detection beyond existing logic
- Smooth CSS transitions provide perceived performance improvement

### Performance Metrics

- **Theme application**: <10ms (CSS class toggle)
- **System detection**: <5ms (matchMedia API)
- **Storage access**: <1ms (localStorage)
- **Total overhead**: <20ms well within 200ms requirement

## Unknown 5: Testing Strategy

### Research Task

Determine testing approach for dark mode functionality.

### Decision

**Unit tests with mock matchMedia + visual regression tests**

### Rationale

- Unit tests can mock `window.matchMedia` for system preference simulation
- Component tests verify correct class application
- Visual regression tests ensure proper styling in both themes
- Integration tests verify localStorage persistence

### Testing Implementation

```javascript
// Mock matchMedia for testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## Summary

All unknowns resolved with decisions that:

- Leverage existing infrastructure (localStorage + system detection)
- Use Tailwind CSS built-in dark mode support
- Maintain backward compatibility
- Meet performance and accessibility requirements
- Align with project constitution and coding standards

**Next Phase**: Proceed to Phase 1 - Design & Contracts
