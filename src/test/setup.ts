/**
 * Test setup utilities
 * Provides consistent mocking for browser APIs across all test files
 */

import { mockTheme, setupLocalStorageMock } from './mocks/localStorage';

/**
 * Create a mock MediaQueryList object for matchMedia
 */
const createMockMediaQueryList = (matches = false) => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

/**
 * Setup matchMedia mock for tests
 */
const setupMatchMediaMock = (prefersDark = false) => {
  const mockMediaQuery = vi.fn().mockImplementation((query) => {
    if (query === '(prefers-color-scheme: dark)') {
      return createMockMediaQueryList(prefersDark);
    }
    return createMockMediaQueryList(false);
  });

  Object.defineProperty(window, 'matchMedia', {
    value: mockMediaQuery,
    writable: true,
  });

  return mockMediaQuery;
};

/**
 * Setup both localStorage and matchMedia mocks for theme testing
 */
export const setupThemeMocks = (
  theme: { prefersDark?: boolean; storedTheme?: 'dark' | 'light' | null } = {},
) => {
  const { prefersDark = false, storedTheme = null } = theme;

  // Setup localStorage mock
  const localStorageMock = storedTheme
    ? mockTheme(storedTheme)
    : setupLocalStorageMock();

  // Setup matchMedia mock
  const matchMediaMock = setupMatchMediaMock(prefersDark);

  return {
    localStorage: localStorageMock,
    matchMedia: matchMediaMock,
  };
};

/**
 * Simulate the theme detection script from index.html
 * Applies dark class based on stored theme and system preference
 */
export const applyThemeDetection = () => {
  const storedTheme = localStorage.getItem('theme');
  const hasStoredTheme = storedTheme !== null;

  document.documentElement.classList.toggle(
    'dark',
    storedTheme === 'dark' ||
      (!hasStoredTheme &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
  );
};
