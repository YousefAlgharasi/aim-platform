import { render, screen, fireEvent, renderWithProviders } from '../test-utils';
import { AssessmentEditorClient, type AdminAssessmentDetail } from '../../features/assessments';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const makeAssessment = (overrides: Partial<AdminAssessmentDetail> = {}): AdminAssessmentDetail => ({
  id: 'a-1',
  title: 'Unit 1 Quiz',
  type: 'quiz',
  status: 'draft',
  questionCount: 5,
  courseId: null,
  chapterId: null,
  questionIds: ['q-1', 'q-2'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  settings: { timeLimitMinutes: 30, passMark: 70, shuffleQuestions: true },
  ...overrides,
});

describe('AssessmentEditorClient', () => {
  const onUpdate = jest.fn().mockResolvedValue({});

  it('renders assessment title', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText('Unit 1 Quiz')).toBeInTheDocument();
  });

  it('renders type badge', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('renders settings', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders question count', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows edit button for non-archived assessments', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    expect(screen.getByText('Edit Assessment')).toBeInTheDocument();
  });

  it('hides edit button for archived assessments', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment({ status: 'archived' })} onUpdate={onUpdate} />);
    expect(screen.queryByText('Edit Assessment')).not.toBeInTheDocument();
  });

  it('enters edit mode when Edit clicked', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('Edit Assessment'));
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows View Results link', () => {
    renderWithProviders(<AssessmentEditorClient assessment={makeAssessment()} onUpdate={onUpdate} />);
    const link = screen.getByText('View Results →');
    expect(link.closest('a')).toHaveAttribute('href', '/admin/assessments/a-1/results');
  });
});
