import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { setupLocalStorageMock } from '../../test/mocks/localStorage';
import { setupThemeMocks } from '../../test/setup';
import App from '.';

describe('App component', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.documentElement.classList.remove('dark');
  });

  it('renders without crashing', () => {
    render(<App />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('NPM Organization Name Checker');

    const description = screen.getByText(
      /Check the availability of npm organization names in real-time/,
    );
    expect(description).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter npm organization name');

    const instructions = screen.getByText(
      /Names must be 1-214 characters, lowercase, and can contain hyphens/,
    );
    expect(instructions).toBeInTheDocument();
  });

  it('allows user to type in the organization name input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toHaveValue('');

    await user.type(input, 'test-org');
    expect(input).toHaveValue('test-org');
  });

  it('has proper accessibility attributes', () => {
    render(<App />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toHaveAttribute('aria-label', 'Organization name');
    expect(input).toHaveAttribute('placeholder', 'Enter npm organization name');
    expect(input).toHaveAttribute('aria-invalid', 'false'); // Empty input is not marked as invalid until user interacts

    const label = screen.getByLabelText('NPM Organization Name');
    expect(label).toBeInTheDocument();
  });
});

describe('App Dark Mode', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.documentElement.classList.remove('dark');
  });

  const applyThemeDetection = () => {
    // Simulate the theme detection script from index.html
    const storedTheme = localStorage.getItem('theme');
    const hasStoredTheme = storedTheme !== null;

    document.documentElement.classList.toggle(
      'dark',
      storedTheme === 'dark' ||
        (!hasStoredTheme &&
          window.matchMedia('(prefers-color-scheme: dark)').matches),
    );
  };

  it('applies dark class when system prefers dark', () => {
    // Mock system prefers dark
    setupThemeMocks({ prefersDark: true });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify dark styles are applied
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies light class when system prefers light', () => {
    // Mock system prefers light
    setupThemeMocks({ prefersDark: false });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify light styles are applied
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('respects manual dark theme override', () => {
    // Mock manual dark theme
    setupThemeMocks({ prefersDark: false, storedTheme: 'dark' });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify dark styles are applied despite system preference
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects manual light theme override', () => {
    // Mock manual light theme
    setupThemeMocks({ prefersDark: true, storedTheme: 'light' });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify light styles are applied despite system preference
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('uses system preference when no manual theme is set', () => {
    // Mock system prefers dark with no manual override
    setupThemeMocks({ prefersDark: true, storedTheme: null });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify system preference is used
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

describe('App Fallback Behavior', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.documentElement.classList.remove('dark');
  });

  const applyThemeDetection = () => {
    // Simulate the theme detection script from index.html with fallback handling
    try {
      const storedTheme = localStorage.getItem('theme');
      const hasStoredTheme = storedTheme !== null;

      document.documentElement.classList.toggle(
        'dark',
        storedTheme === 'dark' ||
          (!hasStoredTheme &&
            window.matchMedia('(prefers-color-scheme: dark)').matches),
      );
    } catch {
      // Fallback: default to light theme
      document.documentElement.classList.remove('dark');
    }
  };

  it('falls back to light theme when matchMedia is not supported', () => {
    // Mock matchMedia not supported
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    });

    // Setup localStorage mock separately
    setupLocalStorageMock();

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify fallback to light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('falls back to light theme when localStorage is not available', () => {
    // Mock localStorage not available
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    });

    // Mock system prefers dark
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true }),
      writable: true,
    });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify fallback to light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('falls back to light theme when both APIs are not supported', () => {
    // Mock both APIs not supported
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    });
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify fallback to light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles matchMedia throwing errors gracefully', () => {
    // Mock matchMedia throwing error
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation(() => {
        throw new Error('matchMedia not supported');
      }),
      writable: true,
    });

    // Setup localStorage mock separately
    setupLocalStorageMock();

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify fallback to light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles localStorage throwing errors gracefully', () => {
    // Mock localStorage throwing error
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage not supported');
        }),
      },
      writable: true,
    });

    // Mock system prefers dark
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockReturnValue({ matches: true }),
      writable: true,
    });

    // Apply theme detection logic
    applyThemeDetection();

    render(<App />);

    // Verify fallback to light theme
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
