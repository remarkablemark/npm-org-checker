# Quickstart Guide: System Dark Mode

**Date**: 2026-02-22  
**Feature**: System Dark Mode  
**Branch**: `001-dark-mode`

## Overview

This guide provides step-by-step instructions for implementing system dark mode in the npm org checker application. The feature automatically detects and applies the user's OS dark mode preference while maintaining backward compatibility with existing localStorage-based manual overrides.

## Prerequisites

- Node.js 24+
- npm or yarn
- Familiarity with React 19 and TypeScript 5
- Understanding of Tailwind CSS 4
- Access to the `001-dark-mode` branch

## Implementation Steps

### Step 1: Verify Current Setup

Ensure the existing theme detection logic is present in `index.html`:

```javascript
// Should already exist in index.html (lines 12-18)
document.documentElement.classList.toggle(
  'dark',
  localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
      window.matchMedia('(prefers-color-scheme: dark)').matches),
);
```

### Step 2: Update App Component

Add dark mode variants to the main App component:

```tsx
// src/components/App/App.tsx
export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-gray-100">
            NPM Organization Name Checker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Check the availability of npm organization names in real-time
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <OrgNameChecker autoFocus />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Enter an organization name to check if it's available as an npm
            scope
          </p>
          <p className="mt-1">
            Names must be 1-214 characters, lowercase, and can contain hyphens
          </p>
        </div>
      </div>
    </main>
  );
}
```

### Step 3: Update OrgNameChecker Component

Add dark mode variants to the input and button elements:

```tsx
// src/components/OrgNameChecker/OrgNameChecker.tsx
export function OrgNameChecker({ autoFocus = false }: OrgNameCheckerProps) {
  // ... existing component logic

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Enter npm organization name"
          className={`flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400 ${error ? 'border-red-500 dark:border-red-400' : ''} `}
        />
        <button
          type="submit"
          disabled={!orgName.trim() || isLoading}
          className={`rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600`}
        >
          {isLoading ? 'Checking...' : 'Check'}
        </button>
      </div>
      {/* ... rest of component */}
    </div>
  );
}
```

### Step 4: Update AvailabilityIndicator Component

Add dark mode variants for status indicators:

```tsx
// src/components/AvailabilityIndicator/AvailabilityIndicator.tsx
export function AvailabilityIndicator({
  status,
  message,
}: AvailabilityIndicatorProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'unavailable':
        return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'loading':
        return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
      default:
        return '';
    }
  };

  return (
    <div className={`rounded-md border p-3 ${getStatusClasses()}`}>
      {/* ... component content */}
    </div>
  );
}
```

### Step 5: Update ErrorMessage Component

Add dark mode variants for error display:

```tsx
// src/components/ErrorMessage/ErrorMessage.tsx
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
      <div className="flex items-center">
        <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500 dark:text-red-400" />
        <span>{message}</span>
      </div>
    </div>
  );
}
```

### Step 6: Update index.html Body

Add dark mode variant to the body element:

```html
<!-- index.html -->
<body
  class="flex min-h-screen min-w-80 place-items-center bg-gray-50 dark:bg-gray-900"
>
  <div class="mx-auto" id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

### Step 7: Add Smooth Transitions

Add theme transition CSS to the existing style block in index.html to prevent FOUT:

```html
<!-- index.html -->
<style>
  .github-corner > svg {
    opacity: 0.5;
    transition: opacity 0.4s;
  }
  .github-corner:hover > svg {
    opacity: 1;
  }

  /* Theme transitions */
  * {
    transition-property: background-color, border-color, color, box-shadow;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: 0.01ms;
    }
  }
</style>
```

## Testing

### Unit Tests

Create tests for theme detection logic:

```tsx
// src/components/App/App.test.tsx
describe('App Dark Mode', () => {
  beforeEach(() => {
    // Mock matchMedia
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
  });

  it('applies dark class when system prefers dark', () => {
    // Mock system prefers dark
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      // ... other properties
    }));

    render(<App />);

    // Verify dark styles are applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies light class when system prefers light', () => {
    // Mock system prefers light
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    render(<App />);

    // Verify light styles are applied
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
```

### Manual Testing

1. **System Theme Testing:**
   - Change OS dark mode setting
   - Verify app responds automatically
   - Test rapid theme changes

2. **Manual Override Testing:**
   - Set `localStorage.theme = 'dark'`
   - Verify dark mode regardless of system setting
   - Test reset by removing localStorage item

3. **Browser Compatibility:**
   - Test in Chrome, Firefox, Safari, Edge
   - Verify fallback behavior in older browsers

4. **Accessibility Testing:**
   - Verify contrast ratios with color picker
   - Test with screen readers
   - Verify keyboard navigation

## Troubleshooting

### Common Issues

1. **Dark mode not applying:**
   - Check if Tailwind CSS is properly configured
   - Verify `dark` class is on document element
   - Ensure CSS is not being overridden

2. **Flickering during theme switch:**
   - Add theme detection script before CSS loads
   - Verify transition timing is appropriate
   - Check for CSS conflicts

3. **Poor contrast in dark mode:**
   - Use color contrast checker tools
   - Verify all interactive elements
   - Test with actual color values

4. **Performance issues:**
   - Profile theme switching with browser dev tools
   - Check for excessive DOM manipulations
   - Verify CSS optimization

### Debug Tools

```javascript
// Debug theme state
console.log('Theme state:', {
  localStorage: localStorage.getItem('theme'),
  systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  darkClassApplied: document.documentElement.classList.contains('dark'),
});
```

## Deployment

### Build Verification

Ensure dark mode works in production:

```bash
# Build for production
npm run build

# Serve locally to test
npm run preview

# Verify theme switching in production build
```

### Environment Testing

Test in different environments:

- Local development
- Production build
- Different browsers
- Mobile devices

## Next Steps

After implementing dark mode:

1. **Run full test suite:** `npm test`
2. **Check coverage:** `npm run test:ci`
3. **Lint and format:** `npm run lint:fix`
4. **Type check:** `npm run lint:tsc`
5. **Visual regression testing:** Compare light/dark screenshots
6. **User acceptance testing:** Get feedback on theme implementation

## Support

For issues or questions:

- Check the feature specification: `/specs/001-dark-mode/spec.md`
- Review the implementation plan: `/specs/001-dark-mode/plan.md`
- Consult the UI contract: `/specs/001-dark-mode/contracts/ui-contract.md`

---

**Note:** This implementation maintains backward compatibility with existing localStorage-based theme persistence while adding system preference detection and comprehensive dark mode styling.
