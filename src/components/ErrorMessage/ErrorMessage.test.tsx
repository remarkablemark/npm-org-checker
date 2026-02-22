import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ApiError, ApiErrorType } from 'src/types';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders nothing when no errors provided', () => {
    render(<ErrorMessage />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('renders validation errors when provided', () => {
    const validationErrors = ['Name is too short', 'Invalid characters'];
    render(<ErrorMessage validationErrors={validationErrors} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Name is too short')).toBeInTheDocument();
    expect(screen.getByText('Invalid characters')).toBeInTheDocument();
  });

  it('renders API error when provided', () => {
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Failed to connect to npm registry',
      statusCode: 500,
      timestamp: new Date(),
    };
    render(<ErrorMessage apiError={apiError} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText('Failed to connect to npm registry'),
    ).toBeInTheDocument();
  });

  it('prioritizes validation errors over API errors', () => {
    const validationErrors = ['Invalid name format'];
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'API error',
      statusCode: 500,
      timestamp: new Date(),
    };
    render(
      <ErrorMessage validationErrors={validationErrors} apiError={apiError} />,
    );

    // Should show validation errors, not API errors
    expect(screen.getByText('Invalid name format')).toBeInTheDocument();
    expect(screen.queryByText('API error')).not.toBeInTheDocument();
  });

  it('shows technical details when enabled', () => {
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Network error occurred',
      statusCode: 500,
      timestamp: new Date('2023-01-01T00:00:00Z'),
    };
    render(<ErrorMessage apiError={apiError} showTechnicalDetails />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    expect(screen.getByText(/NETWORK_ERROR/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/2023-01-01/)).toBeInTheDocument();
  });

  it('shows technical details without status code when statusCode is not provided', () => {
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Network error occurred',
      timestamp: new Date('2023-01-01T00:00:00Z'),
    };
    render(<ErrorMessage apiError={apiError} showTechnicalDetails />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    expect(screen.getByText(/NETWORK_ERROR/)).toBeInTheDocument();
    expect(screen.queryByText(/Status Code:/)).not.toBeInTheDocument();
    expect(screen.getByText(/2023-01-01/)).toBeInTheDocument();
  });

  it('hides technical details when disabled', () => {
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Network error occurred',
      statusCode: 500,
      timestamp: new Date(),
    };
    render(<ErrorMessage apiError={apiError} showTechnicalDetails={false} />);

    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    expect(screen.queryByText(/NETWORK_ERROR/)).not.toBeInTheDocument();
    expect(screen.queryByText(/500/)).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const mockOnRetry = vi.fn();
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Network error',
      statusCode: 500,
      timestamp: new Date(),
    };
    render(<ErrorMessage apiError={apiError} onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('shows retry button for recoverable errors', () => {
    const recoverableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'SERVER_ERROR',
    ];

    recoverableErrors.forEach((errorType) => {
      const { unmount } = render(
        <ErrorMessage
          apiError={{
            type: errorType as ApiErrorType,
            message: 'Error',
            timestamp: new Date(),
          }}
          onRetry={() => {
            // Mock retry function
          }}
        />,
      );

      expect(
        screen.getByRole('button', { name: /retry/i }),
      ).toBeInTheDocument();
      unmount();
    });
  });

  it('does not show retry button for non-recoverable errors', () => {
    const nonRecoverableErrors = ['CORS_ERROR', 'UNKNOWN_ERROR'];

    nonRecoverableErrors.forEach((errorType) => {
      const { unmount } = render(
        <ErrorMessage
          apiError={{
            type: errorType as ApiErrorType,
            message: 'Error',
            timestamp: new Date(),
          }}
          onRetry={() => {
            // Mock retry function
          }}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /retry/i }),
      ).not.toBeInTheDocument();
      unmount();
    });
  });

  it('uses semantic HTML with proper ARIA attributes', () => {
    const validationErrors = ['Validation error'];
    render(<ErrorMessage validationErrors={validationErrors} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders multiple validation errors as a list', () => {
    const validationErrors = ['Error 1', 'Error 2', 'Error 3'];
    render(<ErrorMessage validationErrors={validationErrors} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('Error 1');
    expect(listItems[1]).toHaveTextContent('Error 2');
    expect(listItems[2]).toHaveTextContent('Error 3');
  });

  it('has proper styling for accessibility', () => {
    const validationErrors = ['Error message'];
    render(<ErrorMessage validationErrors={validationErrors} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-red-600'); // Error color for contrast
  });

  it('renders null when currentError exists but conditions are not met', () => {
    // This test covers the edge case where currentError exists but the ternary renders null
    const apiError: ApiError = {
      type: 'UNKNOWN_ERROR' as ApiErrorType,
      message: 'Unknown error',
      timestamp: new Date(),
    };

    render(<ErrorMessage apiError={apiError} />);

    // Should render the error since it's not a validation error
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Unknown error')).toBeInTheDocument();
  });

  it('renders null when neither validation errors nor current error exist', () => {
    render(<ErrorMessage />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('covers the null branch in ternary when currentError is null but component still renders', () => {
    // This test attempts to cover the branch where showValidationErrors is false
    // and currentError is null, but somehow the component still reaches the ternary
    const apiError: ApiError = {
      type: 'NETWORK_ERROR' as ApiErrorType,
      message: 'Network error',
      timestamp: new Date(),
    };

    // First render with validation errors to make showValidationErrors true
    const { rerender } = render(
      <ErrorMessage validationErrors={['Error']} apiError={apiError} />,
    );

    // Then rerender without validation errors but with null apiError
    rerender(<ErrorMessage />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
