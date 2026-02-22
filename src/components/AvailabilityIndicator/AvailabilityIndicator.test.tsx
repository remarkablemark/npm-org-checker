import { render, screen } from '@testing-library/react';

import { AvailabilityIndicator } from './AvailabilityIndicator';

describe('AvailabilityIndicator', () => {
  it('renders nothing when isAvailable is null and not checking', () => {
    render(<AvailabilityIndicator isAvailable={null} isChecking={false} />);

    // Should not render any content
    expect(
      screen.queryByText(/available|unavailable|checking/i),
    ).not.toBeInTheDocument();
  });

  it('renders checking state when isChecking is true', () => {
    render(<AvailabilityIndicator isAvailable={null} isChecking={true} />);

    expect(screen.getByText('Checking...')).toBeInTheDocument();
    // Should have loading spinner (we'll check for aria-busy or similar)
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders available state with checkmark', () => {
    render(<AvailabilityIndicator isAvailable={true} isChecking={false} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders unavailable state with X mark', () => {
    render(<AvailabilityIndicator isAvailable={false} isChecking={false} />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <AvailabilityIndicator
        isAvailable={true}
        isChecking={false}
        className="custom-class"
      />,
    );

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveClass('custom-class');
  });

  it('uses semantic HTML with proper ARIA attributes', () => {
    render(<AvailabilityIndicator isAvailable={true} isChecking={false} />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('prioritizes checking state over availability', () => {
    render(<AvailabilityIndicator isAvailable={true} isChecking={true} />);

    // Should show checking state even if isAvailable is true
    expect(screen.getByText('Checking...')).toBeInTheDocument();
    expect(screen.queryByText('Available')).not.toBeInTheDocument();
  });

  it('has proper color contrast for accessibility', () => {
    const { rerender } = render(
      <AvailabilityIndicator isAvailable={true} isChecking={false} />,
    );

    // Available state should have green color
    const availableContainer = screen.getByText('Available').parentElement;
    expect(availableContainer).toHaveClass('text-green-600');

    rerender(<AvailabilityIndicator isAvailable={false} isChecking={false} />);

    // Unavailable state should have red color
    const unavailableContainer = screen.getByText('Unavailable').parentElement;
    expect(unavailableContainer).toHaveClass('text-red-600');
  });

  it('announces status changes to screen readers', () => {
    const { rerender } = render(
      <AvailabilityIndicator isAvailable={null} isChecking={false} />,
    );

    // Initially should not announce anything
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<AvailabilityIndicator isAvailable={true} isChecking={false} />);

    // Should announce available status
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent('Available');
  });
});
