import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { OrgNameChecker } from './OrgNameChecker';

// Mock the hooks
vi.mock('src/hooks/useOrgNameValidator', () => ({
  useOrgNameValidator: vi.fn(() => ({
    value: '',
    isValid: false,
    validationErrors: [],
    isDirty: false,
    setValue: vi.fn(),
    reset: vi.fn(),
  })),
}));

vi.mock('src/hooks/useAvailabilityChecker', () => ({
  useAvailabilityChecker: vi.fn(() => ({
    isAvailable: null,
    isChecking: false,
    apiError: null,
    lastChecked: null,
    orgUrl: null,
    checkAvailability: vi.fn(),
    reset: vi.fn(),
  })),
}));

describe('OrgNameChecker', () => {
  it('renders input field with proper attributes', () => {
    render(<OrgNameChecker />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-label', 'Organization name');
    expect(input).toHaveAttribute('placeholder', 'Enter npm organization name');
  });

  it('does not auto-focus when autoFocus prop is false', () => {
    render(<OrgNameChecker autoFocus={false} />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).not.toHaveFocus();
  });

  it('does not auto-focus input by default', () => {
    render(<OrgNameChecker />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).not.toHaveFocus();
  });

  it('renders with custom placeholder when provided', () => {
    render(<OrgNameChecker placeholder="Custom placeholder" />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('auto-focuses input when autoFocus prop is true', () => {
    render(<OrgNameChecker autoFocus />);

    // The organization name input should be focused (it has the ref)
    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toHaveFocus();
  });

  it('calls onAvailabilityChange when availability status changes', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    const mockOnAvailabilityChange = vi.fn();

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'test-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: true,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      orgUrl: 'https://www.npmjs.com/org/test-org',
      checkAvailability: vi.fn(),
      reset: vi.fn(),
    });

    render(<OrgNameChecker onAvailabilityChange={mockOnAvailabilityChange} />);

    expect(mockOnAvailabilityChange).toHaveBeenCalledWith(true);
  });

  it('calls onValidationError when validation errors occur', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { ValidationErrorType } = await import('src/types');

    const mockOnValidationError = vi.fn();

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: '1invalid',
      isValid: false,
      validationErrors: [
        {
          type: ValidationErrorType.INVALID_START,
          message: 'must start with a letter',
        },
      ],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    render(<OrgNameChecker onValidationError={mockOnValidationError} />);

    expect(mockOnValidationError).toHaveBeenCalledWith([
      'must start with a letter',
    ]);
  });

  it('displays validation errors for invalid input', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { ValidationErrorType } = await import('src/types');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: '1invalid',
      isValid: false,
      validationErrors: [
        {
          type: ValidationErrorType.INVALID_START,
          message: 'must start with a letter',
        },
      ],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('must start with a letter')).toBeInTheDocument();
  });

  it('shows loading state during availability check', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'valid-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: null,
      isChecking: true,
      apiError: null,
      lastChecked: null,
      checkAvailability: vi.fn(),
      reset: vi.fn(),
      orgUrl: null,
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('Checking...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays available status for available names', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'available-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: true,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      checkAvailability: vi.fn(),
      reset: vi.fn(),
      orgUrl: null,
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('displays unavailable status for taken names', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'react',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: false,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      checkAvailability: vi.fn(),
      reset: vi.fn(),
      orgUrl: null,
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('displays "Check organization" text when org is available', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'available-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: true,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      orgUrl: 'https://www.npmjs.com/org/available-org',
      checkAvailability: vi.fn(),
      reset: vi.fn(),
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('Check organization:')).toBeInTheDocument();
    expect(
      screen.getByText('https://www.npmjs.com/org/available-org'),
    ).toBeInTheDocument();
  });

  it('displays "See organization" text when org is unavailable', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'taken-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: false,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      orgUrl: 'https://www.npmjs.com/org/taken-org',
      checkAvailability: vi.fn(),
      reset: vi.fn(),
    });

    render(<OrgNameChecker />);

    expect(screen.getByText('See organization:')).toBeInTheDocument();
    expect(
      screen.getByText('https://www.npmjs.com/org/taken-org'),
    ).toBeInTheDocument();
  });

  it('handles keyboard navigation properly', async () => {
    render(<OrgNameChecker />);

    const input = screen.getByRole('textbox', { name: 'Organization name' });
    expect(input).toBeInTheDocument();

    // Should be keyboard accessible
    await userEvent.tab();
    expect(input).toHaveFocus();
  });

  it('clears errors when input becomes valid', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { ValidationErrorType } = await import('src/types');

    vi.mocked(useOrgNameValidator)
      .mockReturnValueOnce({
        value: '1invalid',
        isValid: false,
        validationErrors: [
          {
            type: ValidationErrorType.INVALID_START,
            message: 'must start with a letter',
          },
        ],
        isDirty: true,
        setValue: vi.fn(),
        reset: vi.fn(),
      })
      .mockReturnValueOnce({
        value: 'valid-org',
        isValid: true,
        validationErrors: [],
        isDirty: true,
        setValue: vi.fn(),
        reset: vi.fn(),
      });

    const { rerender } = render(<OrgNameChecker />);

    // Should show validation error initially
    expect(screen.getByText('must start with a letter')).toBeInTheDocument();

    // Rerender with valid input
    rerender(<OrgNameChecker />);

    // Errors should be cleared
    expect(
      screen.queryByText('must start with a letter'),
    ).not.toBeInTheDocument();
  });

  it('calls checkAvailability when retry button is clicked', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    const mockCheckAvailability = vi.fn();

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'test-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: null,
      isChecking: false,
      apiError: {
        type: 'NETWORK_ERROR',
        message: 'Network error',
        timestamp: new Date(),
      },
      lastChecked: null,
      orgUrl: null,
      checkAvailability: mockCheckAvailability,
      reset: vi.fn(),
    });

    const user = userEvent.setup();
    render(<OrgNameChecker />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(mockCheckAvailability).toHaveBeenCalledWith('test-org');
  });

  it('does not call checkAvailability when retry button is clicked with empty input', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    const mockCheckAvailability = vi.fn();

    // Start with empty input and API error to show retry button
    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: '', // Empty input
      isValid: false,
      validationErrors: [], // No validation errors for empty input initially
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: null,
      isChecking: false,
      apiError: {
        type: 'NETWORK_ERROR',
        message: 'Network error',
        timestamp: new Date(),
      },
      lastChecked: null,
      orgUrl: null,
      checkAvailability: mockCheckAvailability,
      reset: vi.fn(),
    });

    const user = userEvent.setup();
    render(<OrgNameChecker />);

    // Retry button should be visible since there are no validation errors but there's an API error
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(mockCheckAvailability).not.toHaveBeenCalled();
  });

  it('does not call callbacks when they are not provided', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'test-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: true,
      isChecking: false,
      apiError: null,
      lastChecked: new Date(),
      checkAvailability: vi.fn(),
      reset: vi.fn(),
      orgUrl: null,
    });

    // Render without providing callback props
    expect(() => render(<OrgNameChecker />)).not.toThrow();
  });

  it('handles null apiError correctly', async () => {
    const { useOrgNameValidator } =
      await import('src/hooks/useOrgNameValidator');
    const { useAvailabilityChecker } =
      await import('src/hooks/useAvailabilityChecker');

    vi.mocked(useOrgNameValidator).mockReturnValue({
      value: 'test-org',
      isValid: true,
      validationErrors: [],
      isDirty: true,
      setValue: vi.fn(),
      reset: vi.fn(),
    });

    vi.mocked(useAvailabilityChecker).mockReturnValue({
      isAvailable: null,
      isChecking: false,
      apiError: null,
      lastChecked: null,
      checkAvailability: vi.fn(),
      reset: vi.fn(),
      orgUrl: null,
    });

    render(<OrgNameChecker />);

    // Should render single input that handles org validation
    expect(
      screen.getByRole('textbox', { name: 'Organization name' }),
    ).toBeInTheDocument();
  });
});
