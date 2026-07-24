import { render, screen, renderWithProviders } from '../test-utils';
import { SessionSummaryClient } from '../../app/admin/students/[studentId]/progress/sessions/session-summary-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const mockSessions = [
  { id: 'ses-1', studentId: 'st-1', startedAt: '2026-01-10T10:00:00Z', endedAt: '2026-01-10T10:30:00Z', feedbackSummary: 'Good progress' },
  { id: 'ses-2', studentId: 'st-1', startedAt: '2026-01-11T10:00:00Z', endedAt: null, feedbackSummary: null },
];

describe('SessionSummaryClient — no authority', () => {
  it('displays feedback summary from backend as-is', () => {
    renderWithProviders(<SessionSummaryClient sessions={mockSessions} total={2} page={1} totalPages={1} />);
    expect(screen.getByText('Good progress')).toBeInTheDocument();
  });

  it('shows in progress for sessions without endedAt', () => {
    renderWithProviders(<SessionSummaryClient sessions={mockSessions} total={2} page={1} totalPages={1} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });

  it('does not contain mutation buttons', () => {
    renderWithProviders(<SessionSummaryClient sessions={mockSessions} total={2} page={1} totalPages={1} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows empty state', () => {
    renderWithProviders(<SessionSummaryClient sessions={[]} total={0} page={1} totalPages={0} />);
    expect(screen.getByText(/no sessions recorded/i)).toBeInTheDocument();
  });
});
