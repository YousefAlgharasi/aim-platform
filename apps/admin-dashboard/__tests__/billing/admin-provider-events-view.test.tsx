import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AdminProviderEventsView } from '../../features/billing/admin-provider-events-view';

describe('AdminProviderEventsView', () => {
  it('renders the provider events heading', () => {
    renderWithProviders(<AdminProviderEventsView />);
    expect(screen.getByText('Provider Events')).toBeInTheDocument();
  });

  it('switches the active filter', () => {
    renderWithProviders(<AdminProviderEventsView />);
    const skipped = screen.getByText('Skipped');
    fireEvent.click(skipped);
    expect(skipped.className).toContain('admin-provider-events-view__filter--active');
  });

  it('does not render raw provider secrets', () => {
    renderWithProviders(<AdminProviderEventsView />);
    expect(screen.queryByText(/whsec_/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sk_live/i)).not.toBeInTheDocument();
  });

  it('renders the read-only boundary note', () => {
    renderWithProviders(<AdminProviderEventsView />);
    expect(
      screen.getByText('Read-only — provider event validity is decided by backend signature verification.')
    ).toBeInTheDocument();
  });
});
