// P17-072: Operations dashboard tests
import { render, screen } from '@testing-library/react';
import OperationsDashboardPage from '../../app/admin/operations/dashboard/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('OperationsDashboardPage', () => {
  it('renders loading spinner initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<OperationsDashboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading operations dashboard...')).toBeInTheDocument();
  });

  it('renders summary cards after data loads', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        openTickets: 12,
        activeIncidents: 2,
        upcomingMaintenance: 1,
        recentFeedback: 8,
      }),
    });

    render(<OperationsDashboardPage />);

    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Active Incidents')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Maintenance')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument();
  });

  it('renders error card on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<OperationsDashboardPage />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Backend error 500/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders empty state when summary is null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    render(<OperationsDashboardPage />);

    expect(await screen.findByText('No dashboard data available.')).toBeInTheDocument();
  });

  it('renders the dashboard heading', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        openTickets: 0,
        activeIncidents: 0,
        upcomingMaintenance: 0,
        recentFeedback: 0,
      }),
    });

    render(<OperationsDashboardPage />);

    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  it('renders links to subpages in summary cards', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        openTickets: 5,
        activeIncidents: 0,
        upcomingMaintenance: 0,
        recentFeedback: 0,
      }),
    });

    render(<OperationsDashboardPage />);

    const ticketLink = await screen.findByLabelText('Open Tickets: 5');
    expect(ticketLink).toHaveAttribute('href', '/admin/operations/support-tickets');
  });
});
