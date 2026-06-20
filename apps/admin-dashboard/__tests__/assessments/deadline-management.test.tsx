import { render, screen, fireEvent } from '@testing-library/react';
import { DeadlineManagement } from '../../app/admin/assessments/[assessmentId]/deadline-management';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
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
    render(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Always Open')).toBeInTheDocument();
  });

  it('shows Not set for empty dates', () => {
    render(<DeadlineManagement {...defaultProps} />);
    const notSetElements = screen.getAllByText('Not set');
    expect(notSetElements.length).toBeGreaterThanOrEqual(2);
  });

  it('shows Edit Deadline button', () => {
    render(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Edit Deadline')).toBeInTheDocument();
  });

  it('hides Edit Deadline when disabled', () => {
    render(<DeadlineManagement {...defaultProps} disabled />);
    expect(screen.queryByText('Edit Deadline')).not.toBeInTheDocument();
  });

  it('enters edit mode', () => {
    render(<DeadlineManagement {...defaultProps} />);
    fireEvent.click(screen.getByText('Edit Deadline'));
    expect(screen.getByText('Save Deadline')).toBeInTheDocument();
  });

  it('shows late submission policy', () => {
    render(<DeadlineManagement {...defaultProps} />);
    expect(screen.getByText('Not allowed')).toBeInTheDocument();
  });

  it('shows Scheduled badge for future open date', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    render(<DeadlineManagement {...defaultProps} deadline={{ ...defaultProps.deadline, opensAt: future }} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });
});
