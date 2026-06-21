import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPaymentsView } from '../../components/billing/admin-payments-view';

describe('AdminPaymentsView', () => {
  it('renders the payments heading', () => {
    render(<AdminPaymentsView />);
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    render(<AdminPaymentsView />);
    const failed = screen.getByText('Failed');
    fireEvent.click(failed);
    expect(failed.className).toContain('admin-payments-view__filter--active');
  });

  it('does not render any raw card data', () => {
    render(<AdminPaymentsView />);
    expect(screen.queryByText(/card number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cvv/i)).not.toBeInTheDocument();
  });

  it('renders the read-only boundary note', () => {
    render(<AdminPaymentsView />);
    expect(screen.getByText('Read-only — no payment mutations from admin UI.')).toBeInTheDocument();
  });
});
