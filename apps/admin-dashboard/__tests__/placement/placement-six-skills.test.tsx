import { screen, renderWithProviders } from '../test-utils';
import { AdminPlacementResultsList } from '../../features/placement/pages/placement-results-list';
import { AdminPlacementSectionsList } from '../../features/placement/pages/placement-sections-list';
import { AdminPlacementQuestionsList } from '../../features/placement/pages/placement-questions-list';
import { StudentProgressClient } from '../../features/students';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
}));
jest.mock('../../core/api', () => ({
  adminApiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
  AdminApiClientError: class extends Error { status = 500; },
}));

const skillScores = [
  { skillCode: 'grammar', percent: 80 },
  { skillCode: 'vocabulary', percent: 70 },
  { skillCode: 'reading', percent: 60 },
  { skillCode: 'listening', percent: 50 },
  { skillCode: 'writing', percent: 90 },
  { skillCode: 'speaking', percent: 30 },
];

describe('admin placement — six skills', () => {
  it('results table shows all six skill columns and the overall score', () => {
    renderWithProviders(
      <AdminPlacementResultsList
        total={1} page={1} totalPages={1} filterLevel=""
        results={[{
          resultId: 'r1', studentId: 's1', studentName: 'Jane', estimatedLevel: 'intermediate',
          completedAt: '2026-11-01T00:00:00Z', initialPathReady: true, skillSummary: [], skillScores, overallPercent: 63,
        }]}
      />,
    );
    for (const h of ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Speaking', 'Overall (6 skills)']) {
      expect(screen.getByRole('columnheader', { name: h })).toBeInTheDocument();
    }
    expect(screen.getByText('63%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('sections list shows bank size and how many are drawn per student, incl. writing/speaking', () => {
    renderWithProviders(
      <AdminPlacementSectionsList
        sections={[
          { id: '1', placementTestId: 't', title: 'Grammar', skillCode: 'grammar', order: 1, questionCount: 36, activeQuestionCount: 36, drawCount: 9, createdAt: '' },
          { id: '2', placementTestId: 't', title: 'Speaking', skillCode: 'speaking', order: 6, questionCount: 11, activeQuestionCount: 10, drawCount: 1, createdAt: '' },
        ]}
      />,
    );
    expect(screen.getByText('Drawn per student')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Speaking', { selector: '.skill-badge' })).toBeInTheDocument();
    expect(screen.getByText(/10 active/)).toBeInTheDocument();
  });

  it('questions list shows the level band and whether a question is in the random draw', () => {
    renderWithProviders(
      <AdminPlacementQuestionsList
        testId="t" sectionId="s"
        questions={[
          { id: 'q1', placementSectionId: 's', questionType: 'writing', prompt: 'Write about…', mediaUrl: null, orderIndex: 101, skillCode: 'writing', difficulty: 3, isActive: false, createdAt: '' },
        ]}
      />,
    );
    expect(screen.getByText('Writing (AI-graded)')).toBeInTheDocument();
    expect(screen.getByText('3 · A2.2')).toBeInTheDocument();
    expect(screen.getByText('Retired')).toBeInTheDocument();
  });
});
