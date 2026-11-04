import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PracticeTopicsPage } from '../features/practice-topics/PracticeTopicsPage';
import { WritingPracticePage } from '../features/practice-topics/WritingPracticePage';
import { ar } from '../i18n/ar';

const mockNavigate = jest.fn();
const mockApi = { list: jest.fn(), startSpeaking: jest.fn(), completeSpeaking: jest.fn(), submitWriting: jest.fn() };

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ topicId: 'w1' }),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../components/common/PageTitleBar', () => ({
  PageTitleBar: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
// Stable object, like the real provider (pages list `t` in effect dependencies).
const mockI18n = { t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])) };
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));
jest.mock('../features/practice-topics/practiceTopicsApi', () => ({
  ...jest.requireActual('../features/practice-topics/practiceTopicsApi'),
  practiceTopicsApi: {
    list: (...a: unknown[]) => mockApi.list(...a),
    startSpeaking: (...a: unknown[]) => mockApi.startSpeaking(...a),
    completeSpeaking: (...a: unknown[]) => mockApi.completeSpeaking(...a),
    submitWriting: (...a: unknown[]) => mockApi.submitWriting(...a),
  },
}));

const SPEAKING = { id: 's1', kind: 'speaking', title: 'At the doctor', description: 'Tell the doctor how you feel', levelCode: 'A2', xpReward: 30, timeLimitSeconds: 240, minWords: null };
const WRITING = { id: 'w1', kind: 'writing', title: 'My family', description: null, levelCode: 'A1', xpReward: 20, timeLimitSeconds: null, minWords: 3 };

beforeEach(() => jest.clearAllMocks());

describe('PracticeTopicsPage', () => {
  it('lists topics with XP and time, and starts a speaking session in the voice screen', async () => {
    mockApi.list.mockResolvedValue([SPEAKING]);
    mockApi.startSpeaking.mockResolvedValue({ attemptId: 'a1', sessionId: 'sess1', topic: SPEAKING });
    render(<PracticeTopicsPage kind="speaking" />);

    expect(await screen.findByText('At the doctor')).toBeInTheDocument();
    expect(screen.getByText('+30 XP')).toBeInTheDocument();
    expect(screen.getByText('4 min')).toBeInTheDocument();
    fireEvent.click(screen.getByText('At the doctor'));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/voice-teacher/sess1', {
      state: { practice: { attemptId: 'a1', title: 'At the doctor', xpReward: 30, timeLimitSeconds: 240 }, lessonTitle: 'At the doctor' },
    }));
  });

  it('shows the "start a course" screen when the backend answers 402', async () => {
    mockApi.list.mockRejectedValue({ statusCode: 402, message: 'x' });
    render(<PracticeTopicsPage kind="writing" />);

    expect(await screen.findByText('Start a course to unlock this')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Choose a course'));
    expect(mockNavigate).toHaveBeenCalledWith('/curriculum');
  });

  it('opens a writing topic page', async () => {
    mockApi.list.mockResolvedValue([WRITING]);
    render(<PracticeTopicsPage kind="writing" />);
    fireEvent.click(await screen.findByText('My family'));
    expect(mockNavigate).toHaveBeenCalledWith('/practice/writing/w1');
  });
});

describe('WritingPracticePage', () => {
  it('needs the minimum words, then shows the AI score, corrections and XP', async () => {
    mockApi.list.mockResolvedValue([WRITING]);
    mockApi.submitWriting.mockResolvedValue({
      attemptId: 'x', score: 72, summary: 'Good start.', xpAwarded: 20,
      corrections: [{ original: 'I goed', correction: 'I went', explanation: 'Past tense' }],
    });
    render(<WritingPracticePage />);

    const box = await screen.findByLabelText('Your paragraph');
    const submit = screen.getByRole('button', { name: 'Submit for marking' });
    expect(submit).toBeDisabled();
    fireEvent.change(box, { target: { value: 'I goed home' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(await screen.findByText('72')).toBeInTheDocument();
    expect(mockApi.submitWriting).toHaveBeenCalledWith('w1', 'I goed home');
    expect(screen.getByText('+20 XP')).toBeInTheDocument();
    expect(screen.getByText('Good start.')).toBeInTheDocument();
    expect(screen.getByText('I goed')).toBeInTheDocument();
    expect(screen.getByText('I went')).toBeInTheDocument();
  });

  it('shows an error and keeps the text when marking fails', async () => {
    mockApi.list.mockResolvedValue([WRITING]);
    mockApi.submitWriting.mockRejectedValue({ statusCode: 502, message: 'We could not mark your paragraph right now. Please try again.' });
    render(<WritingPracticePage />);
    fireEvent.change(await screen.findByLabelText('Your paragraph'), { target: { value: 'one two three' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit for marking' }));
    expect(await screen.findByText(/could not mark your paragraph/)).toBeInTheDocument();
    expect(screen.getByLabelText('Your paragraph')).toHaveValue('one two three');
  });
});

describe('Arabic strings', () => {
  it('has an Arabic translation for every practice string', () => {
    for (const key of ['Practice Speaking', 'Write a Paragraph', 'Start a course to unlock this', 'Submit for marking', 'What to fix', '+{xp} XP', 'Finish to earn +{xp} XP']) {
      expect(ar[key]).toBeTruthy();
    }
    expect(ar['+{xp} XP']).toContain('{xp}');
  });
});
