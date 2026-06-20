import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentsList } from '../../app/admin/assessments/assessments-list';
import type { AdminAssessmentListItem } from '../../lib/api/admin-assessments-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../lib/api', () => ({
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
    render(<AssessmentsList {...defaultProps} />);
    const link = screen.getByText('Unit 1 Quiz');
    expect(link.closest('a')).toHaveAttribute('href', '/admin/assessments/a-1');
  });

  it('renders type badge', () => {
    render(<AssessmentsList {...defaultProps} />);
    expect(screen.getAllByText('Quiz').length).toBeGreaterThan(0);
  });

  it('renders status badge', () => {
    render(<AssessmentsList {...defaultProps} />);
    expect(screen.getAllByText('draft').length).toBeGreaterThan(0);
  });

  it('renders question count', () => {
    render(<AssessmentsList {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<AssessmentsList {...defaultProps} assessments={[]} total={0} />);
    expect(screen.getByText(/no assessments/i)).toBeInTheDocument();
  });

  it('opens create form', () => {
    render(<AssessmentsList {...defaultProps} />);
    fireEvent.click(screen.getByText('+ New Assessment'));
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('renders type filter', () => {
    render(<AssessmentsList {...defaultProps} />);
    expect(screen.getByLabelText('Filter by type')).toBeInTheDocument();
  });

  it('shows total count', () => {
    render(<AssessmentsList {...defaultProps} total={3} />);
    expect(screen.getByText('3 assessments')).toBeInTheDocument();
  });
});
