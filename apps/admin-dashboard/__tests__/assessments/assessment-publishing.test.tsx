import { screen, fireEvent, renderWithProviders } from '../test-utils';
import { AssessmentPublishing } from '../../features/assessments';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
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
    renderWithProviders(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getByText('Publish')).toBeInTheDocument();
  });

  it('shows Unpublish button for published status', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} status="published" />);
    expect(screen.getByText('Unpublish')).toBeInTheDocument();
  });

  it('shows Archive button for non-archived status', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('shows archived message for archived status', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} status="archived" />);
    expect(screen.getByText(/This assessment is archived/i)).toBeInTheDocument();
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
  });

  it('does not show Publish for published status', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} status="published" />);
    expect(screen.queryByText('Publish')).not.toBeInTheDocument();
    expect(screen.getByText('Unpublish')).toBeInTheDocument();
  });

  it('does not show Archive for archived status', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} status="archived" />);
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
  });

  it('shows status badge', () => {
    renderWithProviders(<AssessmentPublishing {...defaultProps} />);
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });
});
