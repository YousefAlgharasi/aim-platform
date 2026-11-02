import { screen, renderWithProviders, fireEvent, waitFor } from '../test-utils';
import PracticeTopicsPage from '../../app/admin/practice/page';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const ok = (data: unknown) => ({ ok: true, status: 200, json: async () => ({ data }) });

const SPEAKING = {
  id: 't1', kind: 'speaking', levelCode: 'A2', xpReward: 30, timeLimitSeconds: 240, minWords: null,
  aiPrompt: 'You are Mr. Brown', sortOrder: 2, isActive: true,
  translations: { en: { title: 'Asking for a day off', description: null }, ar: { title: 'طلب إجازة', description: null } },
};
const WRITING = { ...SPEAKING, id: 't2', kind: 'writing', minWords: 30, translations: { en: { title: 'My family' } } };

beforeEach(() => mockFetch.mockReset());

describe('PracticeTopicsPage', () => {
  it('lists speaking topics with Arabic title, XP and time, and switches to writing', async () => {
    mockFetch.mockResolvedValueOnce(ok([SPEAKING, WRITING]));
    renderWithProviders(<PracticeTopicsPage />);

    expect(await screen.findByText('Asking for a day off')).toBeInTheDocument();
    expect(screen.getByText('طلب إجازة')).toBeInTheDocument();
    expect(screen.getByText('4 min')).toBeInTheDocument();
    expect(screen.queryByText('My family')).not.toBeInTheDocument();
    expect(mockFetch.mock.calls[0][0]).toBe('/api/admin/proxy/practice/topics');

    fireEvent.click(screen.getByRole('button', { name: 'Write a Paragraph' }));
    expect(screen.getByText('My family')).toBeInTheDocument();
    expect(screen.getByText('missing')).toBeInTheDocument(); // no Arabic title yet
  });

  it('creates a topic with English + Arabic text and the time in seconds', async () => {
    mockFetch.mockResolvedValueOnce(ok([])).mockResolvedValueOnce(ok({ id: 'n1' })).mockResolvedValueOnce(ok([]));
    renderWithProviders(<PracticeTopicsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Add topic' }));

    fireEvent.change(screen.getByLabelText('Title (English)'), { target: { value: 'At the bank' } });
    fireEvent.change(screen.getByLabelText('Title (Arabic)'), { target: { value: 'في البنك' } });
    fireEvent.change(screen.getByLabelText('Time limit (minutes)'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/AI prompt/), { target: { value: 'You are a bank clerk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(3));
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toBe('/api/admin/proxy/practice/topics');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({
      kind: 'speaking', xpReward: 20, timeLimitSeconds: 180, aiPrompt: 'You are a bank clerk', minWords: null,
      translations: { en: { title: 'At the bank' }, ar: { title: 'في البنك' } },
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Saved.');
  });

  it('needs an English title and an AI prompt before it can save', async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    renderWithProviders(<PracticeTopicsPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Add topic' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
