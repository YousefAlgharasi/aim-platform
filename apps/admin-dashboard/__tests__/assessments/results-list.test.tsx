import { render, screen, renderWithProviders } from '../test-utils';
import { AssessmentResultsList } from '../../features/assessments/pages/results-list';
import { type AdminAssessmentResultItem } from '../../features/assessments/api/admin-assessment-results-api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const makeResult = (overrides: Partial<AdminAssessmentResultItem> = {}): AdminAssessmentResultItem => ({
  id: 'r-1',
  studentId: 'student-123',
  studentName: null,
  assessmentId: 'a-1',
  assessmentTitle: null,
  score: 85,
  maxScore: 100,
  passed: true,
  attemptedAt: '2026-01-15T10:00:00Z',
  completedAt: '2026-01-15T10:30:00Z',
  ...overrides,
});

describe('AssessmentResultsList', () => {
  it('renders score', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[makeResult()]} total={1} page={1} totalPages={1} />);
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders pass badge', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[makeResult()]} total={1} page={1} totalPages={1} />);
    expect(screen.getByText('Pass')).toBeInTheDocument();
  });

  it('renders fail badge', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[makeResult({ passed: false })]} total={1} page={1} totalPages={1} />);
    expect(screen.getByText('Fail')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[]} total={0} page={1} totalPages={0} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it('shows total count', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[makeResult()]} total={3} page={1} totalPages={1} />);
    expect(screen.getByText('3 results total')).toBeInTheDocument();
  });

  it('shows in progress for null completedAt', () => {
    renderWithProviders(<AssessmentResultsList assessmentId="a-1" results={[makeResult({ completedAt: null })]} total={1} page={1} totalPages={1} />);
    expect(screen.getByText('In progress')).toBeInTheDocument();
  });
});
