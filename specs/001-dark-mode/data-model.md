# Data Model: System Dark Mode

**Date**: 2026-02-22  
**Feature**: System Dark Mode  
**Phase**: 1 - Design & Contracts

## Overview

The System Dark Mode feature operates primarily through browser APIs and CSS classes rather than traditional data entities. The "data model" consists of theme state management and configuration mappings.

## Theme State Management

### SystemThemeState

Represents the current OS-level dark mode setting as detected by the browser.

**Properties:**

- `isDark: boolean` - Whether the system prefers dark mode
- `source: 'system' | 'localStorage' | 'fallback'` - How the theme was determined
- `timestamp: number` - When the theme state was last updated

**State Transitions:**

```
Initial Load → System Detection → Theme Applied
     ↓              ↓                ↓
localStorage? → matchMedia() → CSS class toggle
     ↓              ↓                ↓
  Manual Set   → Real-time     → Visual Update
  (if exists)     Updates         (smooth)
```

**Validation Rules:**

- `isDark` must be boolean
- `source` must be one of: 'system', 'localStorage', 'fallback'
- `timestamp` must be valid Unix timestamp

## Theme Configuration

### ThemeMapping

Contains the mapping of theme states to visual styles and CSS custom properties.

**Light Theme Configuration:**

```css
:root {
  --bg-primary: theme('colors.gray.50');
  --bg-secondary: theme('colors.white');
  --text-primary: theme('colors.gray.900');
  --text-secondary: theme('colors.gray.600');
  --border-color: theme('colors.gray.300');
}
```

**Dark Theme Configuration:**

```css
.dark {
  --bg-primary: theme('colors.gray.900');
  --bg-secondary: theme('colors.gray.800');
  --text-primary: theme('colors.gray.100');
  --text-secondary: theme('colors.gray.300');
  --border-color: theme('colors.gray.600');
}
```

## Component Style Mappings

### App Component

**Light Mode Classes:**

- Container: `bg-gray-50`
- Card: `bg-white`
- Heading: `text-gray-900`
- Description: `text-gray-600`

**Dark Mode Classes:**

- Container: `dark:bg-gray-900`
- Card: `dark:bg-gray-800`
- Heading: `dark:text-gray-100`
- Description: `dark:text-gray-300`

### OrgNameChecker Component

**Light Mode Classes:**

- Input: `bg-white border-gray-300 text-gray-900`
- Button: `bg-blue-600 text-white`
- Focus: `ring-blue-500 border-blue-500`

**Dark Mode Classes:**

- Input: `dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100`
- Button: `dark:bg-blue-500 dark:text-white`
- Focus: `dark:ring-blue-400 dark:border-blue-400`

### AvailabilityIndicator Component

**Light Mode Classes:**

- Available: `bg-green-50 text-green-800 border-green-200`
- Unavailable: `bg-red-50 text-red-800 border-red-200`
- Loading: `bg-gray-50 text-gray-600 border-gray-200`

**Dark Mode Classes:**

- Available: `dark:bg-green-900/20 dark:text-green-300 dark:border-green-800`
- Unavailable: `dark:bg-red-900/20 dark:text-red-300 dark:border-red-800`
- Loading: `dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600`

### ErrorMessage Component

**Light Mode Classes:**

- Container: `bg-red-50 border-red-200 text-red-800`
- Icon: `text-red-500`

**Dark Mode Classes:**

- Container: `dark:bg-red-900/20 dark:border-red-800 dark:text-red-300`
- Icon: `dark:text-red-400`

## Storage Schema

### localStorage Structure

**Key:** `theme`  
**Type:** `string`  
**Values:** `'dark' | 'light' | undefined`

**Usage:**

```javascript
// Get theme preference
const storedTheme = localStorage.getItem('theme');

// Set theme preference (manual override)
localStorage.setItem('theme', 'dark');

// Remove theme preference (reset to system)
localStorage.removeItem('theme');
```

## Browser API Integration

### matchMedia API

**Query:** `(prefers-color-scheme: dark)`  
**Response:** `MediaQueryList` object

**Properties:**

- `matches: boolean` - Whether the media query matches
- `media: string` - The media query string
- `onchange: function` - Event handler for changes

**Event Handling:**

```javascript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  // Update theme when system preference changes
  updateTheme(e.matches);
});
```

## CSS Class Strategy

### Class Application Logic

**Target Element:** `document.documentElement`  
**Class Name:** `dark`

**Logic:**

```javascript
const shouldApplyDark =
  localStorage.theme === 'dark' ||
  (!('theme' in localStorage) &&
    window.matchMedia('(prefers-color-scheme: dark)').matches);

document.documentElement.classList.toggle('dark', shouldApplyDark);
```

### Transition Effects

**CSS Properties:**

```css
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
```

## Accessibility Considerations

### Contrast Requirements

All color combinations must meet WCAG AA contrast ratios:

- **Normal text:** 4.5:1 minimum
- **Large text:** 3:1 minimum
- **UI components:** 3:1 minimum

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Optimization

### CSS Optimization

- Use Tailwind's JIT compilation for minimal CSS output
- Leverage CSS custom properties for consistent theming
- Minimize the number of DOM manipulations

### JavaScript Optimization

- Debounce rapid system theme changes
- Cache matchMedia queries to avoid repeated API calls
- Use passive event listeners where possible

## Testing Data

### Mock Scenarios

**Test Case 1: System Dark Mode**

```javascript
// Mock system prefers dark
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    // ... other properties
  })),
});
```

**Test Case 2: Manual Override**

```javascript
// Mock localStorage with manual theme
localStorage.setItem('theme', 'dark');
```

**Test Case 3: Fallback**

```javascript
// Mock no localStorage and no system support
localStorage.clear();
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockReturnValue({ matches: false }),
});
```

## Summary

The data model for System Dark Mode is intentionally lightweight, focusing on:

- Browser API integration for system preference detection
- CSS class-based theme application
- Component-level style mappings using Tailwind utilities
- LocalStorage for manual theme persistence
- Accessibility and performance optimizations

This approach aligns with the project's React-based architecture and Tailwind CSS styling strategy while maintaining simplicity and performance.
