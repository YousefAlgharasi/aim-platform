import { render, screen, fireEvent } from '@testing-library/react';
import { AdminBillingMonitor } from '../../components/billing/admin-billing-monitor';

describe('AdminBillingMonitor', () => {
  it('renders the overview tab by default', () => {
    render(<AdminBillingMonitor />);
    expect(screen.getByText('Billing Overview')).toBeInTheDocument();
  });

  it('switches to the provider events tab', () => {
    render(<AdminBillingMonitor />);
    fireEvent.click(screen.getByText('Provider Events'));
    expect(screen.getByRole('heading', { name: 'Provider Events' })).toBeInTheDocument();
    expect(screen.getByText('Data will be loaded from GET /admin/billing/provider-events.')).toBeInTheDocument();
  });

  it('renders the read-only boundary note', () => {
    render(<AdminBillingMonitor />);
    expect(screen.getByText('Read-only — no mutation endpoints exposed in this view.')).toBeInTheDocument();
  });
});
