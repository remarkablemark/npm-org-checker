# UI Contract: System Dark Mode

**Date**: 2026-02-22  
**Type**: User Interface Contract  
**Version**: 1.0.0

## Overview

Defines the visual and behavioral contract for dark mode implementation across all UI components in the npm org checker application.

## Theme Detection Contract

### System Preference Detection

**Input:** Browser `prefers-color-scheme` media query  
**Output:** Boolean indicating dark mode preference  
**Implementation:** `window.matchMedia('(prefers-color-scheme: dark)')`

**Contract:**

```javascript
// MUST return MediaQueryList object
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark');

// MUST have matches property (boolean)
mediaQuery.matches; // true if system prefers dark

// MUST support change events
mediaQuery.addEventListener('change', handler);
```

### Manual Override Detection

**Input:** `localStorage.theme` value  
**Output:** String theme preference or null  
**Implementation:** `localStorage.getItem('theme')`

**Contract:**

```javascript
// MUST return 'dark', 'light', or null
const storedTheme = localStorage.getItem('theme');

// Values:
// 'dark' → Force dark mode
// 'light' → Force light mode
// null → Use system preference
```

### Theme Application Logic

**Input:** System preference + manual override  
**Output:** CSS class on document element  
**Implementation:** `document.documentElement.classList.toggle('dark', shouldApply)`

**Contract:**

```javascript
// MUST apply dark class when:
// 1. localStorage.theme === 'dark'
// 2. OR (no localStorage AND system prefers dark)

const shouldApplyDark =
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);

document.documentElement.classList.toggle('dark', shouldApplyDark);
```

## Component Style Contracts

### Base Styling Requirements

All components MUST support both light and dark themes using Tailwind's `dark:` variant syntax.

**Contract Pattern:**

```jsx
// Tailwind utility classes with dark variants
<div className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
  {/* Component content */}
</div>
```

### App Component Contract

**Elements:**

- Main container
- Card container
- Heading text
- Description text

**Light Mode Classes:**

- Container: `bg-gray-50`
- Card: `bg-white shadow-md`
- Heading: `text-gray-900`
- Description: `text-gray-600`

**Dark Mode Classes:**

- Container: `dark:bg-gray-900`
- Card: `dark:bg-gray-800`
- Heading: `dark:text-gray-100`
- Description: `dark:text-gray-300`

**Contract Implementation:**

```jsx
<main className="bg-gray-50 dark:bg-gray-900">
  <div className="bg-white dark:bg-gray-800 shadow-md">
    <h1 className="text-gray-900 dark:text-gray-100">
    <p className="text-gray-600 dark:text-gray-300">
```

### OrgNameChecker Component Contract

**Elements:**

- Input field
- Submit button
- Focus states

**Light Mode Classes:**

- Input: `bg-white border-gray-300 text-gray-900`
- Button: `bg-blue-600 text-white hover:bg-blue-700`
- Focus: `ring-blue-500 border-blue-500`

**Dark Mode Classes:**

- Input: `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100`
- Button: `dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600`
- Focus: `dark:ring-blue-400 dark:border-blue-400`

**Contract Implementation:**

```jsx
<input className="bg-white border-gray-300 text-gray-900
                 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
                 focus:ring-blue-500 focus:border-blue-500
                 dark:focus:ring-blue-400 dark:focus:border-blue-400" />
<button className="bg-blue-600 text-white hover:bg-blue-700
                dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600">
```

### AvailabilityIndicator Component Contract

**States:**

- Available (success)
- Unavailable (error)
- Loading (pending)

**Available State:**

- Light: `bg-green-50 text-green-800 border-green-200`
- Dark: `dark:bg-green-900/20 dark:text-green-300 dark:border-green-800`

**Unavailable State:**

- Light: `bg-red-50 text-red-800 border-red-200`
- Dark: `dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`

**Loading State:**

- Light: `bg-gray-50 text-gray-600 border-gray-200`
- Dark: `dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600`

### ErrorMessage Component Contract

**Elements:**

- Container
- Icon
- Message text

**Light Mode Classes:**

- Container: `bg-red-50 border-red-200 text-red-800`
- Icon: `text-red-500`
- Text: `text-red-800`

**Dark Mode Classes:**

- Container: `dark:bg-red-900/20 dark:border-red-800 dark:text-red-300`
- Icon: `dark:text-red-400`
- Text: `dark:text-red-300`

## Transition Contract

### Smooth Theme Switching

**Requirement:** All theme transitions must be smooth and visually appealing.

**Contract:**

```css
/* MUST apply to all theme-relevant properties */
* {
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

/* MUST respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms;
  }
}
```

## Accessibility Contract

### Contrast Requirements

All color combinations MUST meet WCAG AA contrast ratios:

- **Normal text:** 4.5:1 minimum contrast ratio
- **Large text:** 3:1 minimum contrast ratio
- **UI components:** 3:1 minimum contrast ratio

**Contract Validation:**

- Use automated contrast checking tools
- Manual verification for all interactive elements
- Test with actual color values, not assumptions

### Focus Management

**Requirement:** Focus indicators must be visible in both themes.

**Contract:**

```jsx
// Focus styles MUST have dark variants
button:focus {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

.dark button:focus {
  @apply ring-blue-400 ring-offset-gray-800;
}
```

## Performance Contract

### Theme Application Performance

**Requirement:** Theme switching must complete within 200ms.

**Contract Metrics:**

- **CSS class toggle:** <10ms
- **System detection:** <5ms
- **Storage access:** <1ms
- **Total overhead:** <20ms

**Implementation Requirements:**

- Minimize DOM manipulations
- Use CSS transitions for perceived performance
- Debounce rapid system theme changes
- Cache matchMedia queries

## Browser Compatibility Contract

### Supported Browsers

**Requirement:** Must work in all modern browsers with graceful degradation.

**Support Matrix:**

- **Chrome 76+:** Full support
- **Firefox 67+:** Full support
- **Safari 12.1+:** Full support
- **Edge 79+:** Full support
- **IE 11:** Falls back to light theme (acceptable)

**Fallback Contract:**

```javascript
// MUST gracefully handle missing APIs
if (!window.matchMedia) {
  // Fall back to light theme
  document.documentElement.classList.remove('dark');
}

if (!localStorage) {
  // Fall back to system detection only
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}
```

## Testing Contract

### Unit Testing Requirements

**Theme Detection Tests:**

- Mock `window.matchMedia` for system preference simulation
- Test localStorage manual override scenarios
- Verify CSS class application logic
- Test fallback behavior

**Component Tests:**

- Verify correct dark class application
- Test visual consistency across themes
- Validate accessibility contrast requirements
- Test transition behavior

**Integration Tests:**

- End-to-end theme switching workflow
- Cross-browser compatibility verification
- Performance benchmark validation

### Mock Contract

**matchMedia Mock:**

```javascript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
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

**localStorage Mock:**

```javascript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Validation Contract

### Pre-commit Validation

All changes MUST pass:

1. **Lint check:** ESLint compliance
2. **Type check:** TypeScript strict mode
3. **Unit tests:** 100% coverage requirement
4. **Visual regression:** Theme consistency verification
5. **Accessibility:** Contrast ratio validation

### Runtime Validation

**Error Handling:**

- Graceful fallback for API failures
- User-friendly error messages
- No console errors in production
- Proper error boundary coverage

**Performance Monitoring:**

- Theme application timing
- Memory usage monitoring
- Animation frame rate validation

## Summary

This UI contract defines the complete behavioral and visual requirements for implementing system dark mode in the npm org checker application. All implementations must adhere to these contracts to ensure consistency, accessibility, and performance across the application.
