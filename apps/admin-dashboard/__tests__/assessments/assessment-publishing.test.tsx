import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentPublishing } from '../../app/admin/assessments/[assessmentId]/assessment-publishing';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const defaultProps = {
  assessmentId: 'a-1',
  status: 'draft' as const,
  questionCount: 5,
  onPublish: jest.fn().mockResolvedValue({}),
  onUnpublish: jest.fn().mockResolvedValue({}),
  onArchive: jest.fn().mockResolvedValue({}),
};

describe('AssessmentPublishing', () => {
  it('shows Publish button for draft status', () => {
    render(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  it('shows Unpublish button for published status', () => {
    render(<AssessmentPublishing {...defaultProps} status="published" />);
    expect(screen.getByText('Unpublish')).toBeInTheDocument();
  });

  it('shows Archive button for non-archived status', () => {
    render(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('shows archived message for archived status', () => {
    render(<AssessmentPublishing {...defaultProps} status="archived" />);
    expect(screen.getByText(/This assessment is archived/i)).toBeInTheDocument();
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });

  it('does not show Publish for published status', () => {
    render(<AssessmentPublishing {...defaultProps} status="published" />);
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
    expect(screen.getByText('Unpublish')).toBeInTheDocument();
  });

  it('does not show Archive for archived status', () => {
    render(<AssessmentPublishing {...defaultProps} status="archived" />);
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });
});
