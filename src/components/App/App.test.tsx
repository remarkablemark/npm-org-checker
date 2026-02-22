import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '.';

describe('App component', () => {
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
