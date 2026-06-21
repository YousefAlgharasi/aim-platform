import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSubscriptionsView } from '../../components/billing/admin-subscriptions-view';

describe('AdminSubscriptionsView', () => {
  it('renders the subscriptions heading', () => {
    render(<AdminSubscriptionsView />);
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    render(<AdminSubscriptionsView />);
    const pastDue = screen.getByText('Past Due');
    fireEvent.click(pastDue);
    expect(pastDue.className).toContain('admin-subscriptions-view__filter--active');
  });

  it('updates the search query', () => {
    render(<AdminSubscriptionsView />);
    const search = screen.getByPlaceholderText('Search by user ID or subscription ID...');
    fireEvent.change(search, { target: { value: 'sub-123' } });
    expect((search as HTMLInputElement).value).toBe('sub-123');
  });

  it('renders the read-only boundary note', () => {
    render(<AdminSubscriptionsView />);
    expect(screen.getByText('Read-only — no subscription mutations from admin UI.')).toBeInTheDocument();
  });
});
