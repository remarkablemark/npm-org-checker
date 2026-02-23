/**
 * localStorage mock utilities for testing
 * Provides consistent localStorage mocking across all test files
 */

export const createLocalStorageMock = () => {
  const store = new Map<string, string>();

  const mock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    }),
    // Make 'theme in localStorage' work correctly
    hasOwnProperty: vi.fn((key: string) => store.has(key)),
  };

  // Override the 'in' operator behavior
  Object.defineProperty(mock, Symbol.hasInstance, {
    value: (instance: unknown) => instance === mock,
  });

  return mock;
};

/**
 * Setup localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  const localStorageMock = createLocalStorageMock();
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  return localStorageMock;
};

/**
 * Mock localStorage with specific theme value
 */
export const mockTheme = (theme: 'dark' | 'light' | null) => {
  const localStorageMock = setupLocalStorageMock();
  if (theme) {
    localStorageMock.setItem('theme', theme);
  }
  return localStorageMock;
};
