import { render, screen, fireEvent } from '@testing-library/react';
import { AdminRefundsView } from '../../components/billing/admin-refunds-view';

describe('AdminRefundsView', () => {
  it('renders the refunds heading', () => {
    render(<AdminRefundsView />);
    expect(screen.getByText('Refunds')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    render(<AdminRefundsView />);
    const denied = screen.getByText('Denied');
    fireEvent.click(denied);
    expect(denied.className).toContain('admin-refunds-view__filter--active');
  });

  it('updates the search query', () => {
    render(<AdminRefundsView />);
    const search = screen.getByPlaceholderText('Search by refund ID or payment ID...');
    fireEvent.change(search, { target: { value: 'rf-123' } });
    expect((search as HTMLInputElement).value).toBe('rf-123');
  });

  it('states refund status authority remains backend/provider-controlled', () => {
    render(<AdminRefundsView />);
    expect(
      screen.getByText('Read-only — refund status is decided by backend/provider, never by this UI.')
    ).toBeInTheDocument();
  });
});
