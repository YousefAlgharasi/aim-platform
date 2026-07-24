import { screen, fireEvent, renderWithProviders } from '../test-utils';
import { AssessmentsList } from '../../features/assessments/pages/assessments-list';
import type { AdminAssessmentListItem } from '../../features/assessments/api/admin-assessments-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin/assessments',
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const makeAssessment = (overrides: Partial<AdminAssessmentListItem> = {}): AdminAssessmentListItem => ({
  id: 'a-1',
  title: 'Unit 1 Quiz',
  type: 'quiz',
  status: 'draft',
  questionCount: 5,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const defaultProps = {
  assessments: [makeAssessment()],
  total: 1,
  page: 1,
  totalPages: 1,
  filterType: '',
  onCreateAssessment: jest.fn().mockResolvedValue({}),
};

describe('AssessmentsList', () => {
  it('renders assessment title as link', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    const link = screen.getByText('Unit 1 Quiz');
    expect(link.closest('a')).toHaveAttribute('href', '/admin/assessments/a-1');
  });

  it('renders type badge', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    expect(screen.getAllByText('Quiz').length).toBeGreaterThan(0);
  });

  it('renders status badge', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });

  it('renders question count', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} assessments={[]} total={0} />);
    expect(screen.getByText(/no assessments/i)).toBeInTheDocument();
  });

  it('opens create form', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Assessment'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders type filter and search input', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} />);
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search assessments...')).toBeInTheDocument();
  });

  it('shows total count', () => {
    renderWithProviders(<AssessmentsList {...defaultProps} total={3} />);
    expect(screen.getByText('3 assessments')).toBeInTheDocument();
  });
});
