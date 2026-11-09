import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VocabularyLibraryPage } from '../features/learner/VocabularyLibraryPage';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatDate: (d: string) => d,
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const mockList = jest.fn();
const mockSave = jest.fn();
const mockUnsave = jest.fn();
const mockAudio = jest.fn();
jest.mock('../features/learner/learnerApi', () => ({
  vocabularyLibraryApi: {
    list: (...a: unknown[]) => mockList(...a),
    save: (...a: unknown[]) => mockSave(...a),
    unsave: (...a: unknown[]) => mockUnsave(...a),
    audio: (...a: unknown[]) => mockAudio(...a),
  },
}));

const WORDS = [
  { id: 'w1', word: 'borrow', translationAr: 'يستعير', exampleSentence: 'Can I borrow your pen?', partOfSpeech: 'verb', level: 'intermediate', saved: false },
  { id: 'w2', word: 'apple', translationAr: 'تفاحة', exampleSentence: 'I eat an apple every day.', partOfSpeech: 'noun', level: 'beginner', saved: true },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockList.mockResolvedValue({ words: WORDS, total: 2, limit: 24, offset: 0 });
  mockSave.mockResolvedValue({ saved: true });
  mockUnsave.mockResolvedValue({ saved: false });
});

describe('Vocabulary library', () => {
  it('shows each word with its Arabic translation and example sentence', async () => {
    render(<VocabularyLibraryPage />);
    expect(await screen.findByText('borrow')).toBeInTheDocument();
    expect(screen.getByText('يستعير')).toBeInTheDocument();
    expect(screen.getByText('“Can I borrow your pen?”')).toBeInTheDocument();
    expect(screen.getByText('Intermediate', { selector: 'span' })).toBeInTheDocument();
  });

  it('saves a word to My words and shows it as saved', async () => {
    render(<VocabularyLibraryPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Save borrow to My words' }));
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith('w1'));
    expect(await screen.findByRole('button', { name: 'Remove borrow from My words' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('removes an already saved word', async () => {
    render(<VocabularyLibraryPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Remove apple from My words' }));
    await waitFor(() => expect(mockUnsave).toHaveBeenCalledWith('w2'));
  });

  it('puts the save button back and tells the student when saving fails', async () => {
    mockSave.mockRejectedValue(new Error('boom'));
    render(<VocabularyLibraryPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Save borrow to My words' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save borrow to My words' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('filters by difficulty', async () => {
    render(<VocabularyLibraryPage />);
    await screen.findByText('borrow');
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }));
    await waitFor(() => expect(mockList).toHaveBeenLastCalledWith(expect.objectContaining({ level: 'advanced', offset: 0 })));
  });

  it('asks the server for the pronunciation when Listen is pressed', async () => {
    mockAudio.mockRejectedValue(new Error('no audio'));
    render(<VocabularyLibraryPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Listen to borrow' }));
    await waitFor(() => expect(mockAudio).toHaveBeenCalledWith('w1'));
    // No server audio and no browser speech in the test environment: the student is told.
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not play the audio');
  });

  it('shows an empty state when nothing matches', async () => {
    mockList.mockResolvedValue({ words: [], total: 0, limit: 24, offset: 0 });
    render(<VocabularyLibraryPage />);
    expect(await screen.findByText('No words found')).toBeInTheDocument();
  });
});
