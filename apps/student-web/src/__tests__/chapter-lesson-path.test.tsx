import '@testing-library/jest-dom';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ChapterLessonList } from '../features/curriculum/ChapterLessonList';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, state: _state, ...rest }: { children: unknown; to: string; state?: unknown }) => (
    <a href={String(to)} {...rest}>{children as never}</a>
  ),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({
    t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
    plural: (_n: number, forms: Record<string, string>) => forms.other,
  }),
}));

const mockFetchLessons = jest.fn();
jest.mock('../features/lessons/lessonsApi', () => ({
  fetchStudentLessons: (...a: unknown[]) => mockFetchLessons(...a),
}));

const LEVEL = { id: 'l1', courseId: 'c1', title: 'Level 1', code: 'A1', description: null, status: 'published', sortOrder: 1 };
const chapter = (over: Record<string, unknown>) => ({
  chapterId: 'ch', title: 'Chapter', description: null, levelCode: 'A1',
  lessonCount: 3, completedLessonCount: 0, quizCount: 1, percent: 0, status: 'not_started', ...over,
});
const CH1 = chapter({ chapterId: 'ch1', title: 'Greetings', status: 'in_progress', completedLessonCount: 1, percent: 33 });
const CH2 = chapter({ chapterId: 'ch2', title: 'Numbers', lessonCount: 2, quizCount: 1 });

const lessonsResponse = (quiz: Record<string, unknown> | null = null) => ({
  lessons: [
    { id: 'a', title: 'Hello', completed: true, current: false, xpValue: 10, description: '' },
    { id: 'b', title: 'Good morning', completed: false, current: true, xpValue: 10, description: '' },
    { id: 'c', title: 'Goodbye', completed: false, current: false, xpValue: 0, description: '' },
  ],
  quiz,
});

function renderList(chapters = [CH1, CH2], finalExam: unknown = null) {
  return render(
    <ChapterLessonList
      courseId="c1"
      levels={[{ level: LEVEL, chapters } as never]}
      finalExam={finalExam as never}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchLessons.mockResolvedValue(lessonsResponse());
});

describe('ChapterLessonList winding path', () => {
  it('gives each chapter a labelled section with a numbered heading', async () => {
    renderList();
    await screen.findByRole('link', { name: 'Hello' });
    const first = screen.getByRole('region', { name: 'Greetings' });
    expect(within(first).getByRole('heading', { name: 'Chapter 1: Greetings' })).toBeInTheDocument();
    const second = screen.getByRole('region', { name: 'Numbers' });
    expect(within(second).getByRole('heading', { name: 'Chapter 2: Numbers' })).toBeInTheDocument();
  });

  it('loads every chapter, locked ones included, so the whole course is on the path', async () => {
    renderList();
    await screen.findAllByRole('link', { name: 'Hello' });
    expect(mockFetchLessons).toHaveBeenCalledTimes(2);
    expect(mockFetchLessons).toHaveBeenCalledWith('ch1');
    expect(mockFetchLessons).toHaveBeenCalledWith('ch2');
  });

  it('shows a locked chapter\'s real lessons, all locked and not clickable', async () => {
    renderList();
    await screen.findByRole('link', { name: 'Hello' });
    const second = screen.getByRole('region', { name: 'Numbers' });
    await within(second).findByText('Good morning');
    const nodes = within(second).getAllByRole('listitem');
    expect(nodes).toHaveLength(3);
    nodes.forEach((n) => expect(n).toHaveAttribute('aria-disabled', 'true'));
    expect(within(second).queryByRole('link')).not.toBeInTheDocument();
    expect(within(second).getByText('Hello')).toBeInTheDocument();
  });

  it('makes finished and current lessons links to the lesson page', async () => {
    renderList();
    const done = await screen.findByRole('link', { name: 'Hello' });
    expect(done).toHaveAttribute('href', '/lessons/a');
    expect(done.closest('li')).toHaveAttribute('data-status', 'completed'); // finished lesson is marked done
    expect(done.closest('li')?.querySelector('svg')).toBeTruthy(); // with a check mark in its node
    const current = screen.getByRole('link', { name: 'Good morning' });
    expect(current).toHaveAttribute('href', '/lessons/b');
    expect(current.closest('li')).toHaveAttribute('data-status', 'current'); // the current node is called out
  });

  it('locks every lesson after the current one', async () => {
    renderList();
    await screen.findAllByRole('link', { name: 'Hello' });
    const first = screen.getByRole('region', { name: 'Greetings' });
    await within(first).findByText('Goodbye');
    expect(within(first).queryByRole('link', { name: 'Goodbye' })).not.toBeInTheDocument();
    const locked = within(first).getByText('Goodbye').closest('[role=listitem]');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
  });

  it('links an unlocked chapter quiz and locks it until the lessons are done', async () => {
    mockFetchLessons.mockResolvedValue(lessonsResponse({ assessmentId: 'q1', title: 'Greetings quiz', locked: false, completed: false }));
    const { unmount } = renderList();
    const first = () => screen.getByRole('region', { name: 'Greetings' });
    await screen.findAllByRole('link', { name: 'Hello' });
    expect(within(first()).getByRole('link', { name: 'Greetings quiz' })).toHaveAttribute('href', '/assessments/q1');
    unmount();

    mockFetchLessons.mockResolvedValue(lessonsResponse({ assessmentId: 'q1', title: 'Greetings quiz', locked: true, completed: false }));
    renderList();
    await screen.findAllByRole('link', { name: 'Hello' });
    await within(first()).findByText('Greetings quiz');
    expect(within(first()).queryByRole('link', { name: 'Greetings quiz' })).not.toBeInTheDocument();
    const quiz = within(first()).getByText('Greetings quiz').closest('[role=listitem]');
    expect(quiz).toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps a passed chapter quiz open', async () => {
    mockFetchLessons.mockResolvedValue(lessonsResponse({ assessmentId: 'q1', title: 'Greetings quiz', locked: true, completed: true }));
    renderList();
    expect(await screen.findByRole('link', { name: 'Greetings quiz' })).toHaveAttribute('href', '/assessments/q1');
  });

  it('links the final exam when it is unlocked', async () => {
    renderList([CH1], { assessmentId: 'ex1', title: 'Final exam: A1', unlocked: true });
    expect(await screen.findByRole('link', { name: 'Final exam: A1' })).toHaveAttribute('href', '/assessments/ex1');
    expect(screen.getByText('All chapters complete — the final exam is ready.')).toBeInTheDocument();
  });

  it('keeps the final exam locked and not clickable until every chapter is done', async () => {
    renderList([CH1], { assessmentId: 'ex1', title: 'Final exam: A1', unlocked: false });
    await screen.findByRole('link', { name: 'Hello' });
    expect(screen.queryByRole('link', { name: 'Final exam: A1' })).not.toBeInTheDocument();
    expect(screen.getByText('Complete every chapter (lessons and quizzes) to unlock the final exam.')).toBeInTheDocument();
  });

  it('shows the score for a passed final exam, and it stays openable', async () => {
    renderList([CH1], { assessmentId: 'ex1', title: 'Final exam: A1', unlocked: true, passed: true, score: 90 });
    expect(await screen.findByRole('link', { name: 'Final exam: A1' })).toBeInTheDocument();
    expect(screen.getByText('Final exam completed and passed (score 90).')).toBeInTheDocument();
  });

  it('shows an error with Retry when the lessons fail, and recovers on retry', async () => {
    mockFetchLessons.mockRejectedValueOnce(new Error('Network down'));
    renderList([CH1]);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Network down');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('link', { name: 'Hello' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockFetchLessons).toHaveBeenCalledTimes(2);
  });

  it('says so when an unlocked chapter has no published lessons', async () => {
    mockFetchLessons.mockResolvedValue({ lessons: [], quiz: null });
    renderList([CH1]);
    expect(await screen.findByText('No lessons published in this chapter yet.')).toBeInTheDocument();
  });

  it('shows a finished chapter open too, with no way to fold it', async () => {
    const DONE = chapter({ chapterId: 'done', title: 'Basics', status: 'completed', completedLessonCount: 3, percent: 100 });
    renderList([DONE, CH1]);
    await screen.findAllByRole('link', { name: 'Hello' });
    expect(mockFetchLessons).toHaveBeenCalledWith('done');
    expect(mockFetchLessons).toHaveBeenCalledWith('ch1');
    const basics = screen.getByRole('region', { name: 'Basics' });
    expect(within(basics).getAllByRole('listitem').length).toBeGreaterThan(0);
    expect(within(basics).queryByRole('button', { expanded: true })).not.toBeInTheDocument();
    expect(within(basics).queryByRole('button', { expanded: false })).not.toBeInTheDocument();
  });
});
