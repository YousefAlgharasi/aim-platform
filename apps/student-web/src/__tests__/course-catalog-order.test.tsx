import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { CourseCatalog } from '../features/curriculum/CourseCatalog';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({
    t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
    plural: (_n: number, f: Record<string, string>) => f.other,
  }),
}));
jest.mock('../features/level/LevelContext', () => ({ useLearnerLevel: () => ({ band: null, hasPlacement: true, loading: false }) }));
jest.mock('../features/level/LevelBadge', () => ({ LevelBadge: () => null, RelationChip: () => null }));
jest.mock('../features/curriculum/useCourseChapterInfo', () => ({ useCourseChapterInfo: () => ({}) }));
jest.mock('../components/common/Popover', () => ({ Popover: () => null }));

const course = (courseId: string, title: string, levelCode: string | null) => ({
  courseId, title, description: null, levelCode, lessonCount: 12, completedLessonCount: 0,
  quizCount: 1, examCount: 0, percent: 0, status: 'not_started', locked: false,
});
jest.mock('../features/curriculum/curriculumApi', () => ({
  ...jest.requireActual('../features/curriculum/curriculumApi'),
  fetchStudentCourses: () => Promise.resolve([
    course('s', 'Starter', null), course('a', 'A1.1', 'A1'), course('w', 'Writing 1', null), course('b', 'A2.1', 'A2'),
  ]),
  fetchCurrentEnrollment: () => Promise.resolve({ found: false, courseId: null }),
}));

describe('Courses page order', () => {
  it('puts the beginner Starter course first, and keeps later unlevelled courses under "More courses"', async () => {
    render(<CourseCatalog />);
    const start = await screen.findByRole('region', { name: 'Start here' });
    expect(within(start).getByText('Starter')).toBeInTheDocument();
    const more = screen.getByRole('region', { name: 'More courses' });
    expect(within(more).getByText('Writing 1')).toBeInTheDocument();
    expect(within(more).queryByText('Starter')).not.toBeInTheDocument();
    // Start here comes before the first level section.
    const regions = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'));
    expect(regions.indexOf('Start here')).toBeLessThan(regions.findIndex((l) => l?.startsWith('A1')));
  });
});
