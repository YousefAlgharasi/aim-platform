import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AdminPaymentsView } from '../../features/billing/components/admin-payments-view';

describe('AdminPaymentsView', () => {
  it('renders the payments heading', () => {
    renderWithProviders(<AdminPaymentsView />);
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    renderWithProviders(<AdminPaymentsView />);
    const failed = screen.getByText('Failed');
    fireEvent.click(failed);
    expect(failed.className).toContain('admin-payments-view__filter--active');
  });

  it('does not render any raw card data', () => {
    renderWithProviders(<AdminPaymentsView />);
    expect(screen.queryByText(/card number/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cvv/i)).not.toBeInTheDocument();
  });

  it('renders the read-only boundary note', () => {
    renderWithProviders(<AdminPaymentsView />);
    expect(screen.getByText('Read-only — no payment mutations from admin UI.')).toBeInTheDocument();
  });
});
