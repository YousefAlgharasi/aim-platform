import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { DeadlineManagement } from '../../features/assessments/components/deadline-management';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const defaultProps = {
  assessmentId: 'a-1',
  deadline: {
    opensAt: null,
    closesAt: null,
    lateSubmissionPolicy: 'none' as const,
    latePenaltyPercent: null,
    lateWindowMinutes: null,
  },
  onUpdateDeadline: jest.fn().mockResolvedValue({}),
};

describe('DeadlineManagement', () => {
  it('shows Always Open when no dates set', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Always Open')).toBeInTheDocument();
  });

  it('shows Not set for empty dates', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} />);
    const notSetElements = screen.getAllByText('Not set');
    expect(notSetElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Edit Deadline button', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Edit Deadline')).toBeInTheDocument();
  });

  it('hides Edit Deadline when disabled', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} disabled />);
    expect(screen.queryByText('Edit Deadline')).not.toBeInTheDocument();
  });

  it('enters edit mode', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit Deadline'));
    expect(screen.getByText('Save Deadline')).toBeInTheDocument();
  });

  it('shows late submission policy', () => {
    renderWithProviders(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Not allowed')).toBeInTheDocument();
  });

  it('shows Scheduled badge for future open date', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    renderWithProviders(<DeadlineManagement {...defaultProps} deadline={{ ...defaultProps.deadline, opensAt: future }} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });
});
