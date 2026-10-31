import { fireEvent, render, screen, waitFor } from '../test-utils';
import { CurriculumTree, type CurriculumTreeActions } from '../../features/content/components/curriculum-tree';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const level = { id: 'lv1', courseId: 'c1', title: 'Level One', code: 'A1', slug: null, description: null, status: 'published', sortOrder: 1 };
const chapter = (id: string, title: string, availableLocales: string[]) => ({
  id, levelId: 'lv1', title, slug: null, description: null, status: 'published', sortOrder: 1, createdAt: '', updatedAt: '', availableLocales,
});
const lessonRow = (id: string, title: string, availableLocales: string[]) => ({
  id, chapterId: 'ch1', title, description: 'd', status: 'published', sortOrder: 1, systemPrompt: null, createdAt: '', updatedAt: '', availableLocales,
});

function makeActions(overrides: Partial<CurriculumTreeActions> = {}): CurriculumTreeActions {
  return {
    fetchLevels: jest.fn().mockResolvedValue({ data: [level] }),
    createLevel: jest.fn().mockResolvedValue({}),
    updateLevel: jest.fn().mockResolvedValue({}),
    transitionLevel: jest.fn().mockResolvedValue({}),
    fetchChapters: jest.fn().mockResolvedValue({
      data: [chapter('ch1', 'Greetings', ['en']), chapter('ch2', 'Family', ['en', 'ar'])],
    }),
    createChapter: jest.fn().mockResolvedValue({}),
    updateChapter: jest.fn().mockResolvedValue({}),
    transitionChapter: jest.fn().mockResolvedValue({}),
    fetchLessons: jest.fn().mockResolvedValue({
      data: [lessonRow('ls1', 'Hello', ['en']), lessonRow('ls2', 'Goodbye', ['en', 'ar'])],
    }),
    createLesson: jest.fn().mockResolvedValue({}),
    updateLesson: jest.fn().mockResolvedValue({}),
    transitionLesson: jest.fn().mockResolvedValue({}),
    fetchLessonSkills: jest.fn().mockResolvedValue({ data: [] }),
    ...overrides,
  } as unknown as CurriculumTreeActions;
}

async function expandAll() {
  fireEvent.click((await screen.findAllByLabelText('Expand'))[0]);
  await screen.findByText('Greetings');
  fireEvent.click(screen.getAllByLabelText('Expand')[0]);
  await screen.findByText('Hello');
}

describe('CurriculumTree translation indicators', () => {
  it('flags only chapters and lessons that lack an Arabic translation, without extra requests', async () => {
    const actions = makeActions();
    render(<CurriculumTree courseId="c1" courseTitle="Course" actions={actions} />);
    await expandAll();
    expect(screen.getAllByText('Arabic missing')).toHaveLength(2);
    expect(actions.fetchChapters).toHaveBeenCalledTimes(1);
    expect(actions.fetchLessons).toHaveBeenCalledTimes(1);
  });

  it('shows no badge when availability is unknown', async () => {
    const actions = makeActions({
      fetchChapters: jest.fn().mockResolvedValue({ data: [chapter('ch1', 'Greetings', [])] }),
      fetchLessons: jest.fn().mockResolvedValue({ data: [lessonRow('ls1', 'Hello', [])] }),
    });
    render(<CurriculumTree courseId="c1" courseTitle="Course" actions={actions} />);
    await expandAll();
    expect(screen.queryByText('Arabic missing')).not.toBeInTheDocument();
  });

  it('passes the chapter translation loader to the edit form', async () => {
    const loadChapterTranslations = jest.fn().mockResolvedValue({ data: { translations: [] } });
    const actions = makeActions({ loadChapterTranslations });
    render(<CurriculumTree courseId="c1" courseTitle="Course" actions={actions} />);
    fireEvent.click((await screen.findAllByLabelText('Expand'))[0]);
    await screen.findByText('Greetings');
    fireEvent.click(screen.getAllByText('Edit')[1]);
    await waitFor(() => expect(loadChapterTranslations).toHaveBeenCalledWith('ch1'));
    expect(await screen.findByRole('tab', { name: /العربية/ })).toBeInTheDocument();
  });

  it('passes the lesson translation loader to the edit form and saves translations through updateLesson', async () => {
    const loadLessonTranslations = jest.fn().mockResolvedValue({ data: { translations: [] } });
    const updateLesson = jest.fn().mockResolvedValue({});
    const actions = makeActions({ loadLessonTranslations, updateLesson });
    render(<CurriculumTree courseId="c1" courseTitle="Course" actions={actions} />);
    await expandAll();
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[2]);
    await waitFor(() => expect(loadLessonTranslations).toHaveBeenCalledWith('ls1'));
    await waitFor(() => expect(screen.queryByText(/Loading translations/)).not.toBeInTheDocument());
    fireEvent.click(await screen.findByRole('tab', { name: /العربية/ }));
    fireEvent.change(screen.getByLabelText('عنوان الدرس'), { target: { value: 'مرحبا' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(updateLesson).toHaveBeenCalled());
    expect(updateLesson.mock.calls[0][0]).toBe('ls1');
    expect(updateLesson.mock.calls[0][1].translations).toEqual({ ar: { title: 'مرحبا', description: null } });
  });
});
