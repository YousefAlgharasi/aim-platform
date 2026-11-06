import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CurrentCourseLessons, lessonStatuses, nextLesson, useCurrentChapter } from '../features/dashboard/widgets/CurrentCourseLessons';

/** Mirrors how the dashboard uses it: the hook loads, the card renders only when ready. */
function Harness({ courseId, courseTitle }: { courseId: string; courseTitle: string | null }) {
  const { state, chapter } = useCurrentChapter(courseId);
  return state === 'ready' && chapter ? <CurrentCourseLessons courseId={courseId} courseTitle={courseTitle} data={chapter} /> : null;
}

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
let mockQuiz: Record<string, unknown> | null = null;
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
          quiz: chapterId ? mockQuiz : null,
        }),
}));

const OPEN = { courseId: 'c1', locked: false, access: undefined };
beforeEach(() => { mockCourse = { ...OPEN }; mockLessonsFail = false; mockQuiz = null; });

describe('CurrentCourseLessons', () => {
  it("lists the active chapter's lessons with real completion and lock states", async () => {
    render(<Harness courseId="c1" courseTitle="Starter English" />);
    expect(await screen.findByText('Eleven to twenty')).toBeInTheDocument();
    expect(screen.getByText('Starter English')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Numbers')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /One to ten/ })).toHaveAttribute('href', '/lessons/a');
    expect(screen.getByText('1/3 lessons')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Eleven to twenty/ })).toHaveAttribute('href', '/lessons/b');
    const locked = screen.getByText('Tens').closest('[role=listitem]');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: /Tens/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All chapters' })).toHaveAttribute('href', '/curriculum/c1');
  });

  it('ends the roadmap with the chapter quiz, locked until every lesson is done', async () => {
    mockQuiz = { assessmentId: 'q1', title: 'Numbers quiz', completed: false, locked: true };
    render(<Harness courseId="c1" courseTitle="Starter English" />);
    expect(await screen.findByText('Numbers quiz')).toBeInTheDocument();
    expect(screen.getByText('Chapter quiz')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Numbers quiz/ })).not.toBeInTheDocument();
    expect(screen.getByText('Numbers quiz').closest('[role=listitem]')).toHaveAttribute('aria-disabled', 'true');
  });

  it('opens the chapter quiz as the next step once it is unlocked', async () => {
    mockQuiz = { assessmentId: 'q1', title: 'Numbers quiz', completed: false, locked: false };
    render(<Harness courseId="c1" courseTitle="Starter English" />);
    expect(await screen.findByRole('link', { name: /Numbers quiz/ })).toHaveAttribute('href', '/assessments/q1');
  });

  it('tapping a locked lesson explains what to finish first', async () => {
    render(<Harness courseId="c1" courseTitle="Starter English" />);
    const locked = (await screen.findByText('Tens')).closest('button') as HTMLElement;
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(locked);
    expect(screen.getByRole('status')).toHaveTextContent('Finish Lesson 2 first');
  });

  it('shows nothing for a locked course', async () => {
    mockCourse = { ...OPEN, locked: true };
    const { container } = render(<Harness courseId="c1" courseTitle="X" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
  });

  it('still lists the lessons of an unpaid course', async () => {
    mockCourse = { ...OPEN, access: { hasAccess: false, status: 'none' } };
    render(<Harness courseId="c1" courseTitle="X" />);
    expect(await screen.findByText('Eleven to twenty')).toBeInTheDocument();
  });

  it('hides silently when the backend denies the lessons', async () => {
    mockLessonsFail = true;
    const { container } = render(<Harness courseId="c1" courseTitle="X" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
  });
});

describe('what is next in the course', () => {
  const lesson = (id: string, completed: boolean, current: boolean) => ({ id, title: id, completed, current, xpValue: 0, description: '' }) as never;

  it('picks the marked current lesson, locks the ones after it', () => {
    const l = [lesson('a', true, false), lesson('b', false, true), lesson('c', false, false)];
    expect(lessonStatuses(l)).toEqual(['completed', 'current', 'locked']);
    expect(nextLesson(l)?.id).toBe('b');
  });
  it('with no current marker, picks the first open unfinished lesson', () => {
    const l = [lesson('a', true, false), lesson('b', false, false), lesson('c', false, false)];
    expect(nextLesson(l)?.id).toBe('b');
  });
  it('has nothing next when the chapter is finished', () => {
    expect(nextLesson([lesson('a', true, false)])).toBeNull();
  });
});
