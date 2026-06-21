import { render, screen, fireEvent } from '@testing-library/react';
import { AdminInvoicesView } from '../../components/billing/admin-invoices-view';

describe('AdminInvoicesView', () => {
  it('renders the invoices heading', () => {
    render(<AdminInvoicesView />);
    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    render(<AdminInvoicesView />);
    const voidFilter = screen.getByText('Void');
    fireEvent.click(voidFilter);
    expect(voidFilter.className).toContain('admin-invoices-view__filter--active');
  });

  it('renders the read-only boundary note', () => {
    render(<AdminInvoicesView />);
    expect(screen.getByText('Read-only — no invoice mutations from admin UI.')).toBeInTheDocument();
  });
});
