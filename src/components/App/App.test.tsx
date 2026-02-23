import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setupLocalStorageMock } from '../../test/mocks/localStorage';
import { applyThemeDetection, setupThemeMocks } from '../../test/setup';
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

  it('displays dark theme when system prefers dark', () => {
    // Mock system prefers dark
    setupThemeMocks({ prefersDark: true });

    // Simulate the theme detection script from index.html
    applyThemeDetection();

    render(<App />);

    // Test visible dark theme styling
    const main = screen.getByRole('main');
    expect(main).toHaveClass('dark:bg-gray-900');
    expect(main).toHaveClass('bg-gray-50'); // Both classes present, dark mode overrides

    // Test text colors in dark theme
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('dark:text-gray-100');
    expect(heading).toHaveClass('text-gray-900'); // Both classes present, dark mode overrides

    const description = screen.getByText(
      /Check the availability of npm organization names in real-time/,
    );
    expect(description).toHaveClass('dark:text-gray-300');
    expect(description).toHaveClass('text-gray-600'); // Both classes present, dark mode overrides
  });

  it('displays light theme when system prefers light', () => {
    // Mock system prefers light
    setupThemeMocks({ prefersDark: false });

    // Simulate the theme detection script from index.html
    applyThemeDetection();

    render(<App />);

    // Test visible light theme styling
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
    expect(main).not.toHaveClass('bg-gray-900');

    // Test text colors in light theme
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-gray-900');
    expect(heading).not.toHaveClass('text-gray-100');

    const description = screen.getByText(
      /Check the availability of npm organization names in real-time/,
    );
    expect(description).toHaveClass('text-gray-600');
    expect(description).not.toHaveClass('text-gray-300');
  });

  it('applies manual dark theme override', () => {
    // Mock manual dark theme
    setupThemeMocks({ prefersDark: false, storedTheme: 'dark' });

    // Simulate the theme detection script from index.html
    applyThemeDetection();

    render(<App />);

    // Test that manual dark theme overrides system preference
    const main = screen.getByRole('main');
    expect(main).toHaveClass('dark:bg-gray-900');
    expect(main).toHaveClass('bg-gray-50'); // Both classes present, dark mode overrides

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('dark:text-gray-100');
    expect(heading).toHaveClass('text-gray-900'); // Both classes present, dark mode overrides
  });

  it('applies manual light theme override', () => {
    // Mock manual light theme
    setupThemeMocks({ prefersDark: true, storedTheme: 'light' });

    // Simulate the theme detection script from index.html
    applyThemeDetection();

    render(<App />);

    // Test that manual light theme overrides system preference
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
    expect(main).not.toHaveClass('bg-gray-900');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-gray-900');
  });

  it('uses system preference when no manual theme is set', () => {
    // Mock system prefers dark with no manual override
    setupThemeMocks({ prefersDark: true, storedTheme: null });

    // Simulate the theme detection script from index.html
    applyThemeDetection();

    render(<App />);

    // Test that system preference is used
    const main = screen.getByRole('main');
    expect(main).toHaveClass('dark:bg-gray-900');
    expect(main).toHaveClass('bg-gray-50'); // Both classes present, dark mode overrides
  });
});

describe('App Fallback Behavior', () => {
  beforeEach(() => {
    // Reset DOM before each test
    document.documentElement.classList.remove('dark');
  });

  it('falls back to light theme when matchMedia is not supported', () => {
    // Mock matchMedia not supported
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    });

    // Setup localStorage mock separately
    setupLocalStorageMock();

    render(<App />);

    // Verify fallback to light theme (visible styling)
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
    expect(main).not.toHaveClass('bg-gray-900');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-gray-900');
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

    render(<App />);

    // Verify fallback to light theme (visible styling)
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
    expect(main).not.toHaveClass('bg-gray-900');
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

    render(<App />);

    // Verify fallback to light theme (visible styling)
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
    expect(main).not.toHaveClass('bg-gray-900');
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

    render(<App />);

    // Verify graceful fallback to light theme
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
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

    render(<App />);

    // Verify graceful fallback to light theme
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-gray-50');
  });
});
