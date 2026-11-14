import { screen, renderWithProviders, fireEvent, waitFor } from '../test-utils';
import StoriesPage from '../../app/admin/stories/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ data }) });
const fail = (status: number, message: unknown) => ({ ok: false, status, json: async () => ({ error: { message } }) });

const ROW = {
  storyId: 's1', courseId: 'c1', courseTitle: 'A1.1', cefrCode: 'A1', title: "Sarah's Birthday", titleAr: 'عيد ميلاد سارة',
  status: 'published', scenes: 5, questions: 10, words: 218, updatedAt: '2026-11-14T00:00:00Z',
};
const DRAFT = { ...ROW, storyId: 's2', courseId: 'c2', courseTitle: 'A1.2', title: 'Saturday', titleAr: null, status: 'draft' };
const DETAIL = {
  storyId: 's1', courseId: 'c1', courseTitle: 'A1.1', cefrCode: 'A1', title: "Sarah's Birthday", titleAr: null, summary: 'A party.', summaryAr: null, status: 'published',
  skills: [{ key: 'en.a1.gra.articles_a_an', title: 'Articles: a / an' }],
  scenes: [{ id: 'sc1', setting: 'At home', settingAr: null,
    lines: [{ speaker: 'narrator', text: 'It was morning.' }, { speaker: 'sarah', text: 'Today is my birthday!' }],
    questions: [{ id: 'q1', stem: 'Whose birthday is it?', explanation: null, skillKey: null, options: [{ text: 'Sarah', correct: true }, { text: 'Adam', correct: false }] }] }],
};

beforeEach(() => mockFetch.mockReset());

describe('StoriesPage', () => {
  it('lists every story with its status, and offers courses that have none', async () => {
    mockFetch.mockResolvedValueOnce(ok({ stories: [ROW, DRAFT], coursesWithoutStory: [{ id: 'c9', title: 'C2', cefrCode: 'C2' }] }));
    renderWithProviders(<StoriesPage />);
    expect(await screen.findByText("Sarah's Birthday")).toBeInTheDocument();
    expect(screen.getByText('عيد ميلاد سارة')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('missing')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'C2 (C2)' })).toBeInTheDocument();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/admin/proxy/stories');
  });

  it('hides a published story and publishes a draft', async () => {
    mockFetch
      .mockResolvedValueOnce(ok({ stories: [ROW, DRAFT], coursesWithoutStory: [] }))
      .mockResolvedValueOnce(ok({ ok: true }))
      .mockResolvedValueOnce(ok({ stories: [{ ...ROW, status: 'draft' }, DRAFT], coursesWithoutStory: [] }));
    renderWithProviders(<StoriesPage />);
    await screen.findByText("Sarah's Birthday");
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    expect(mockFetch.mock.calls[1][0]).toBe('/api/admin/proxy/stories/s1/status');
    expect(mockFetch.mock.calls[1][1].method).toBe('PATCH');
    expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toEqual({ status: 'draft' });
    expect(await screen.findByText(/Hidden from students/)).toBeInTheDocument();
  });

  it('opens a story to edit, keeps the ids, and saves with PUT', async () => {
    mockFetch
      .mockResolvedValueOnce(ok({ stories: [ROW], coursesWithoutStory: [] }))
      .mockResolvedValueOnce(ok(DETAIL))
      .mockResolvedValueOnce(ok({ ok: true }))
      .mockResolvedValueOnce(ok({ stories: [ROW], coursesWithoutStory: [] }));
    renderWithProviders(<StoriesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));

    const title = await screen.findByLabelText('Title (English)');
    expect(title).toHaveValue("Sarah's Birthday");
    fireEvent.change(title, { target: { value: "Sarah's Big Birthday" } });
    fireEvent.change(screen.getByLabelText('Scene 1 line 2 text'), { target: { value: 'Today is my special birthday!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save story' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(4));
    const [url, init] = mockFetch.mock.calls[2];
    expect(url).toBe('/api/admin/proxy/stories/s1');
    expect(init.method).toBe('PUT');
    const body = JSON.parse(init.body);
    expect(body.title).toBe("Sarah's Big Birthday");
    expect(body.scenes[0].id).toBe('sc1');
    expect(body.scenes[0].questions[0].id).toBe('q1');
    expect(body.scenes[0].lines[1].text).toBe('Today is my special birthday!');
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
  });

  it('does not save an invalid story and says what to fix', async () => {
    mockFetch.mockResolvedValueOnce(ok({ stories: [ROW], coursesWithoutStory: [] })).mockResolvedValueOnce(ok(DETAIL));
    renderWithProviders(<StoriesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    fireEvent.change(await screen.findByLabelText('Title (English)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save story' }));
    expect(await screen.findByText('The story needs a title.')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(2); // list + get only: nothing was sent
  });

  it('shows the backend\'s list of problems when it refuses a save', async () => {
    mockFetch
      .mockResolvedValueOnce(ok({ stories: [ROW], coursesWithoutStory: [] }))
      .mockResolvedValueOnce(ok(DETAIL))
      .mockResolvedValueOnce(fail(400, ['Scene 1, question 1: mark exactly one correct answer.', 'Scene 2 needs a place (setting).']));
    renderWithProviders(<StoriesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    await screen.findByLabelText('Title (English)');
    fireEvent.click(screen.getByRole('button', { name: 'Save story' }));
    expect(await screen.findByText('Scene 2 needs a place (setting).')).toBeInTheDocument();
    expect(screen.getByText('Scene 1, question 1: mark exactly one correct answer.')).toBeInTheDocument();
  });

  it('starts a new story for a course without one', async () => {
    mockFetch
      .mockResolvedValueOnce(ok({ stories: [], coursesWithoutStory: [{ id: 'c9', title: 'C2', cefrCode: 'C2' }] }))
      .mockResolvedValueOnce(ok({ storyId: 'new1' }))
      .mockResolvedValueOnce(ok({ stories: [], coursesWithoutStory: [] }));
    renderWithProviders(<StoriesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Add story' }));
    fireEvent.change(await screen.findByLabelText('Title (English)'), { target: { value: 'The Last Lecture' } });
    fireEvent.change(screen.getByLabelText(/Summary \(English\)/), { target: { value: 'A final lecture.' } });
    fireEvent.change(screen.getByLabelText('Place (English)'), { target: { value: 'Auditorium' } });
    fireEvent.change(screen.getByLabelText('Scene 1 line 1 text'), { target: { value: 'The hall was full.' } });
    fireEvent.change(screen.getByLabelText('Scene 1 line 2 text'), { target: { value: 'Are you ready?' } });
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Where does it happen?' } });
    fireEvent.change(screen.getByLabelText('Scene 1 question 1 answer 1'), { target: { value: 'In an auditorium' } });
    fireEvent.change(screen.getByLabelText('Scene 1 question 1 answer 2'), { target: { value: 'At home' } });
    fireEvent.change(screen.getByLabelText('Scene 1 question 1 answer 3'), { target: { value: 'In a shop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save story' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/admin/proxy/stories');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.courseId).toBe('c9');
    expect(body.status).toBe('draft');
    expect(body.scenes[0].questions[0].options.filter((o: { correct: boolean }) => o.correct)).toHaveLength(1);
  });
});
