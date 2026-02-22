import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

// Mock console.error to avoid test output noise
vi.spyOn(console, 'error').mockImplementation(() => {
  // Mock implementation to avoid test output noise
});

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    const TestComponent = () => (
      <div data-testid="test-content">Test Content</div>
    );

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('catches errors and displays fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(
        'An unexpected error occurred. Please refresh the page and try again.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Refresh Page' }),
    ).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    const CustomFallback = (
      <div data-testid="custom-fallback">Custom Error UI</div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('reloads page when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const refreshButton = screen.getByRole('button', { name: 'Refresh Page' });
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('shows error details in development mode', () => {
    // Mock import.meta.env.DEV
    const originalDev = import.meta.env.DEV;
    import.meta.env.DEV = true;

    const testError = new Error('Test error with stack');
    testError.stack = 'Error: Test error\n    at ThrowError';

    const ThrowError = () => {
      throw testError;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('Error Details (Development Only)'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    // Restore original value
    import.meta.env.DEV = originalDev;
  });

  it('hides error details in production mode', () => {
    // Mock import.meta.env.DEV
    const originalDev = import.meta.env.DEV;
    import.meta.env.DEV = false;

    const testError = new Error('Test error with stack');
    testError.stack = 'Error: Test error\n    at ThrowError';

    const ThrowError = () => {
      throw testError;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.queryByText('Error Details (Development Only)'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();

    // Restore original value
    import.meta.env.DEV = originalDev;
  });

  it('logs error details to console', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith(
      'Error Boundary caught an error:',
      expect.objectContaining({
        error: 'Test error',
        stack: expect.any(String) as string,
        componentStack: expect.any(String) as string,
      }) as {
        error: string;
        stack: string;
        componentStack: string;
      },
    );
  });
});
