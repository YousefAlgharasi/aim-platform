// P17-072: Support tickets page tests
import { render, screen } from '@testing-library/react';
import SupportTicketsPage from '../../app/admin/operations/support-tickets/page';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

const makeTicketsResponse = (tickets: object[] = [], total = 0) => ({
  ok: true,
  json: async () => ({
    data: tickets,
    total,
    page: 1,
    limit: 20,
  }),
});

const sampleTicket = {
  id: 'ticket-1',
  subject: 'Cannot access course materials',
  requester: 'user@example.com',
  category: 'access',
  severity: 'high',
  status: 'open',
  assignedTo: null,
  createdAt: '2026-06-01T10:00:00Z',
};

describe('SupportTicketsPage', () => {
  it('renders loading spinner initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<SupportTicketsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading support tickets...')).toBeInTheDocument();
  });

  it('renders empty state when no tickets exist', async () => {
    mockFetch.mockResolvedValueOnce(makeTicketsResponse([], 0));

    render(<SupportTicketsPage />);

    expect(await screen.findByText('No support tickets found.')).toBeInTheDocument();
  });

  it('renders table with ticket data', async () => {
    mockFetch.mockResolvedValueOnce(makeTicketsResponse([sampleTicket], 1));

    render(<SupportTicketsPage />);

    expect(await screen.findByText('Cannot access course materials')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('access')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('open')).toBeInTheDocument();
  });

  it('renders error card on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    render(<SupportTicketsPage />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Backend error 503/)).toBeInTheDocument();
  });

  it('renders status change and assign actions', async () => {
    mockFetch.mockResolvedValueOnce(makeTicketsResponse([sampleTicket], 1));

    render(<SupportTicketsPage />);

    expect(await screen.findByLabelText('Change status for Cannot access course materials')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign Cannot access course materials')).toBeInTheDocument();
  });

  it('displays total ticket count', async () => {
    mockFetch.mockResolvedValueOnce(makeTicketsResponse([sampleTicket], 1));

    render(<SupportTicketsPage />);

    expect(await screen.findByText('1 ticket')).toBeInTheDocument();
  });

  it('displays unassigned state with em dash', async () => {
    mockFetch.mockResolvedValueOnce(makeTicketsResponse([sampleTicket], 1));

    render(<SupportTicketsPage />);

    // The unassigned ticket should show an em dash
    const cells = await screen.findAllByRole('cell');
    const assignedCell = cells.find(cell => cell.textContent === '—');
    expect(assignedCell).toBeTruthy();
  });
});
