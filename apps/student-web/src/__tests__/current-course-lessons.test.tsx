import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CurrentCourseLessons } from '../features/dashboard/widgets/CurrentCourseLessons';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({
    t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
    plural: (_n: number, f: Record<string, string>) => f.other,
  }),
}));

let mockCourse: Record<string, unknown>;
let mockLessonsFail = false;
jest.mock('../features/curriculum/curriculumApi', () => ({
  ...jest.requireActual('../features/curriculum/curriculumApi'),
  fetchStudentCourses: () => Promise.resolve([mockCourse]),
  fetchCourseLevels: () => Promise.resolve([{ id: 'l1' }]),
  fetchStudentChapters: () => Promise.resolve({
    chapters: [
      { chapterId: 'ch1', title: 'Greetings', status: 'completed' },
      { chapterId: 'ch2', title: 'Numbers', status: 'in_progress' },
      { chapterId: 'ch3', title: 'Colours', status: 'not_started' },
    ],
    finalExam: null,
  }),
}));
jest.mock('../features/lessons/lessonsApi', () => ({
  fetchStudentLessons: (chapterId: string) =>
    mockLessonsFail
      ? Promise.reject(new Error('403'))
      : Promise.resolve({
          lessons: [
            { id: 'a', title: 'One to ten', completed: true, current: false, xpValue: 10, description: '' },
            { id: 'b', title: 'Eleven to twenty', completed: false, current: true, xpValue: 10, description: '' },
            { id: 'c', title: 'Tens', completed: false, current: false, xpValue: 10, description: '' },
          ],
          quiz: chapterId ? null : null,
        }),
}));

const OPEN = { courseId: 'c1', locked: false, access: undefined };
beforeEach(() => { mockCourse = { ...OPEN }; mockLessonsFail = false; });

describe('CurrentCourseLessons', () => {
  it("lists the active chapter's lessons with real completion and lock states", async () => {
    render(<CurrentCourseLessons courseId="c1" courseTitle="Starter English" />);
    expect(await screen.findByText('Eleven to twenty')).toBeInTheDocument();
    expect(screen.getByText('Starter English · Chapter 2: Numbers')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /One to ten/ })).toHaveAttribute('href', '/lessons/a');
    expect(screen.getByRole('link', { name: /Eleven to twenty/ })).toHaveAttribute('href', '/lessons/b');
    const locked = screen.getByText('Tens').closest('[role=listitem]');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: /Tens/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All chapters' })).toHaveAttribute('href', '/curriculum/c1');
  });

  it('shows nothing for a locked course', async () => {
    mockCourse = { ...OPEN, locked: true };
    const { container } = render(<CurrentCourseLessons courseId="c1" courseTitle="X" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
  });

  it('still lists the lessons of an unpaid course', async () => {
    mockCourse = { ...OPEN, access: { hasAccess: false, status: 'none' } };
    render(<CurrentCourseLessons courseId="c1" courseTitle="X" />);
    expect(await screen.findByText('Eleven to twenty')).toBeInTheDocument();
  });

  it('hides silently when the backend denies the lessons', async () => {
    mockLessonsFail = true;
    const { container } = render(<CurrentCourseLessons courseId="c1" courseTitle="X" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
  });
});
