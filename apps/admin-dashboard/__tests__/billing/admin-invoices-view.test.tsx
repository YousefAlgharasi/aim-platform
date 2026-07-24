import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AdminInvoicesView } from '../../features/billing/components/admin-invoices-view';

describe('AdminInvoicesView', () => {
  it('renders the invoices heading', () => {
    renderWithProviders(<AdminInvoicesView />);
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    renderWithProviders(<AdminInvoicesView />);
    const voidFilter = screen.getByText('Void');
    fireEvent.click(voidFilter);
    expect(voidFilter.className).toContain('admin-invoices-view__filter--active');
  });

  it('renders the read-only boundary note', () => {
    renderWithProviders(<AdminInvoicesView />);
    expect(screen.getByText('Read-only — no invoice mutations from admin UI.')).toBeInTheDocument();
  });
});
