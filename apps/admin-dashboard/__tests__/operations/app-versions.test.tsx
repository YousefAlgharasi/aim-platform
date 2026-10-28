import { screen, renderWithProviders, fireEvent, waitFor } from '../test-utils';
import AppVersionsPage from '../../app/admin/operations/app-versions/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const POLICIES = [
  {
    platform: 'android',
    minSupportedVersion: '1.0.0',
    latestVersion: '1.2.0',
    storeUrl: 'https://play.google.com/store/apps/details?id=en.aim.learning',
  },
  { platform: 'ios', minSupportedVersion: '0.0.0', latestVersion: '0.0.0', storeUrl: null },
];

beforeEach(() => {
  mockFetch.mockReset();
});

describe('AppVersionsPage', () => {
  it('renders one card per platform with current values', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: POLICIES }) });

    renderWithProviders(<AppVersionsPage />);

    expect(await screen.findByText('Android')).toBeInTheDocument();
    expect(screen.getByText('iOS')).toBeInTheDocument();
    expect(screen.getByLabelText('Latest version', { selector: '#android-latest' })).toHaveValue('1.2.0');
    expect(screen.getByLabelText('Minimum supported version', { selector: '#android-min' })).toHaveValue('1.0.0');
  });

  it('blocks saving a minimum version above the latest version', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: POLICIES }) });

    renderWithProviders(<AppVersionsPage />);

    const minInput = await screen.findByLabelText('Minimum supported version', { selector: '#android-min' });
    fireEvent.change(minInput, { target: { value: '2.0.0' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Minimum supported version cannot be higher than the latest version.',
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('saves the platform policy through the admin proxy', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: POLICIES }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { ...POLICIES[0], latestVersion: '1.3.0' } }),
      });

    renderWithProviders(<AppVersionsPage />);

    const latestInput = await screen.findByLabelText('Latest version', { selector: '#android-latest' });
    fireEvent.change(latestInput, { target: { value: '1.3.0' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/admin/proxy/app-versions/android');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({
      minSupportedVersion: '1.0.0',
      latestVersion: '1.3.0',
      storeUrl: 'https://play.google.com/store/apps/details?id=en.aim.learning',
    });
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
  });

  it('shows an error card when loading fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

    renderWithProviders(<AppVersionsPage />);

    expect(await screen.findByText(/Backend error 500/)).toBeInTheDocument();
  });
});
