import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AdminSubscriptionsView } from '../../features/billing/admin-subscriptions-view';

describe('AdminSubscriptionsView', () => {
  it('renders the subscriptions heading', () => {
    renderWithProviders(<AdminSubscriptionsView />);
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    renderWithProviders(<AdminSubscriptionsView />);
    const pastDue = screen.getByText('Past Due');
    fireEvent.click(pastDue);
    expect(pastDue.className).toContain('admin-subscriptions-view__filter--active');
  });

  it('updates the search query', () => {
    renderWithProviders(<AdminSubscriptionsView />);
    const search = screen.getByPlaceholderText('Search by user ID or subscription ID...');
    fireEvent.change(search, { target: { value: 'sub-123' } });
    expect((search as HTMLInputElement).value).toBe('sub-123');
  });

  it('renders the read-only boundary note', () => {
    renderWithProviders(<AdminSubscriptionsView />);
    expect(screen.getByText('Read-only — no subscription mutations from admin UI.')).toBeInTheDocument();
  });
});
