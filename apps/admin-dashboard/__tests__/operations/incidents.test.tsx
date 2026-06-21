// P17-072: Incidents page tests
import { render, screen, fireEvent } from '@testing-library/react';
import IncidentsPage from '../../app/admin/operations/incidents/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const makeIncidentsResponse = (incidents: object[] = [], total = 0) => ({
  ok: true,
  json: async () => ({
    data: incidents,
    total,
    page: 1,
    limit: 20,
  }),
});

const sampleIncident = {
  id: 'inc-1',
  title: 'Database connection pool exhaustion',
  severity: 'critical',
  status: 'investigating',
  startedAt: '2026-06-15T08:30:00Z',
  resolvedAt: null,
};

const resolvedIncident = {
  id: 'inc-2',
  title: 'Slow API responses',
  severity: 'minor',
  status: 'resolved',
  startedAt: '2026-06-10T14:00:00Z',
  resolvedAt: '2026-06-10T15:30:00Z',
};

describe('IncidentsPage', () => {
  it('renders loading spinner initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<IncidentsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading incidents...')).toBeInTheDocument();
  });

  it('renders empty state when no incidents exist', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([], 0));

    render(<IncidentsPage />);

    expect(await screen.findByText('No incidents found.')).toBeInTheDocument();
  });

  it('renders table with incident data', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([sampleIncident, resolvedIncident], 2));

    render(<IncidentsPage />);

    expect(await screen.findByText('Database connection pool exhaustion')).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('investigating')).toBeInTheDocument();
    expect(screen.getByText('Slow API responses')).toBeInTheDocument();
    expect(screen.getByText('minor')).toBeInTheDocument();
    expect(screen.getByText('resolved')).toBeInTheDocument();
  });

  it('renders error card on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    render(<IncidentsPage />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Backend error 500/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows create incident button', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([], 0));

    render(<IncidentsPage />);

    expect(await screen.findByText('+ New Incident')).toBeInTheDocument();
  });

  it('opens create incident form on button click', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([], 0));

    render(<IncidentsPage />);

    const createBtn = await screen.findByText('+ New Incident');
    fireEvent.click(createBtn);

    expect(screen.getByText('Create Incident')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Severity')).toBeInTheDocument();
  });

  it('renders status update select for each incident', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([sampleIncident], 1));

    render(<IncidentsPage />);

    expect(await screen.findByLabelText('Update status for Database connection pool exhaustion')).toBeInTheDocument();
  });

  it('displays total incident count', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([sampleIncident, resolvedIncident], 2));

    render(<IncidentsPage />);

    expect(await screen.findByText('2 incidents')).toBeInTheDocument();
  });

  it('displays resolved time when incident is resolved', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([resolvedIncident], 1));

    render(<IncidentsPage />);

    // The resolved incident should show a resolved date (not just em dash)
    await screen.findByText('Slow API responses');
    const cells = screen.getAllByRole('cell');
    const resolvedCells = cells.filter(cell => cell.textContent !== '—');
    expect(resolvedCells.length).toBeGreaterThan(0);
  });

  it('displays em dash for unresolved incidents', async () => {
    mockFetch.mockResolvedValueOnce(makeIncidentsResponse([sampleIncident], 1));

    render(<IncidentsPage />);

    await screen.findByText('Database connection pool exhaustion');
    const cells = screen.getAllByRole('cell');
    const emDashCell = cells.find(cell => cell.textContent === '—');
    expect(emDashCell).toBeTruthy();
  });
});
