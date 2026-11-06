import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MistakesPage } from '../features/learner/MistakesPage';
import { FlashcardReview } from '../features/learner/FlashcardReview';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
  useSearchParams: () => [mockParams],
}));
const mockParams = new URLSearchParams('');
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
// Stable function identities, like the real provider: the pages reload when `t` changes.
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const mockList = jest.fn();
const mockCheck = jest.fn();
const mockDue = jest.fn();
const mockReview = jest.fn();
jest.mock('../features/learner/learnerApi', () => ({
  mistakesApi: { list: (...a: unknown[]) => mockList(...a), check: (...a: unknown[]) => mockCheck(...a) },
  vocabularyApi: { due: (...a: unknown[]) => mockDue(...a), review: (...a: unknown[]) => mockReview(...a) },
}));

const q = (n: number) => ({
  itemId: `q${n}`, type: 'multiple_choice', prompt: `Prompt ${n}`, listeningScript: null, yourAnswer: 'bat', answeredAt: '2026-11-05T10:00:00Z',
  options: [{ id: `a${n}`, text: 'bit' }, { id: `b${n}`, text: 'bat' }, { id: `c${n}`, text: 'but' }],
});

describe('My mistakes session', () => {
  beforeEach(() => {
    mockList.mockResolvedValue({ total: 2, items: [q(1), q(2)] });
  });

  it('marks the right and wrong rows with a tick and a cross, explains, then moves on', async () => {
    mockCheck.mockResolvedValue({ correct: false, correctChoiceId: 'a1', correctText: 'bit', explanation: 'Short i as in sit.' });
    render(<MistakesPage />);
    expect(await screen.findByRole('heading', { name: 'Prompt 1' })).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Last time you answered: ⁨bat⁩')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /but/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('Not quite');
    expect(screen.getByRole('status')).toHaveTextContent('Correct answer: ⁨bit⁩');
    expect(screen.getByRole('status')).toHaveTextContent('Short i as in sit.');
    // the right row is flagged by a tick, and answers are locked
    expect(screen.getByRole('button', { name: /bit/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next question' }));
    expect(await screen.findByRole('heading', { name: 'Prompt 2' })).toBeInTheDocument();
  });

  it('ends on a finish screen with the score and next steps', async () => {
    mockList.mockResolvedValue({ total: 1, items: [q(1)] });
    mockCheck.mockResolvedValue({ correct: true, correctChoiceId: 'a1', correctText: 'bit', explanation: null });
    render(<MistakesPage />);
    fireEvent.click(await screen.findByRole('button', { name: /bit/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('Correct — fixed!');
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

    expect(await screen.findByRole('heading', { name: 'Round complete' })).toBeInTheDocument();
    expect(screen.getByText('You fixed every one. Nice work.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See weak spots' })).toHaveAttribute('href', '/improve');
    expect(screen.queryByRole('button', { name: 'Try the rest' })).not.toBeInTheDocument();
  });

  it('offers to try the rest when some are still wrong', async () => {
    mockList.mockResolvedValue({ total: 1, items: [q(1)] });
    mockCheck.mockResolvedValue({ correct: false, correctChoiceId: 'a1', correctText: 'bit', explanation: null });
    render(<MistakesPage />);
    fireEvent.click(await screen.findByRole('button', { name: /but/ }));
    await screen.findByRole('status');
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(await screen.findByText('You fixed 0 of 1.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try the rest' })).toBeInTheDocument();
  });

  it('says so when there is nothing to fix', async () => {
    mockList.mockResolvedValue({ total: 0, items: [] });
    render(<MistakesPage />);
    expect(await screen.findByText('Nothing to fix')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Keep practicing' })).toHaveAttribute('href', '/curriculum');
  });
});

describe('My words review session', () => {
  const word = (id: string, w: string, meaning: string | null = 'a meaning') => ({ id, word: w, meaning, context: 'In a sentence.', source: 'manual', box: 1 });

  it('flips the card, records the answer, and finishes with the score', async () => {
    mockDue.mockResolvedValue({ cards: [word('1', 'borrow')] });
    mockReview.mockResolvedValue(undefined);
    const onDone = jest.fn();
    render(<FlashcardReview onDone={onDone} />);

    expect(await screen.findByText('borrow')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show the meaning' }));
    expect(await screen.findByText('a meaning')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'I knew it' }));

    await waitFor(() => expect(mockReview).toHaveBeenCalledWith('1', true));
    expect(await screen.findByRole('heading', { name: 'Review complete' })).toBeInTheDocument();
    expect(screen.getByText('You knew every word. Great memory.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to My words' }));
    expect(onDone).toHaveBeenCalled();
  });

  it('shows the partial score when some words were missed', async () => {
    mockDue.mockResolvedValue({ cards: [word('1', 'one'), word('2', 'two')] });
    mockReview.mockResolvedValue(undefined);
    render(<FlashcardReview onDone={jest.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Show the meaning' }));
    fireEvent.click(await screen.findByRole('button', { name: 'I knew it' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Show the meaning' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Not yet' }));
    expect(await screen.findByText('You knew 1 of 2.')).toBeInTheDocument();
  });

  it('says when no words are due', async () => {
    mockDue.mockResolvedValue({ cards: [] });
    render(<FlashcardReview onDone={jest.fn()} />);
    expect(await screen.findByText('No words are due right now.')).toBeInTheDocument();
  });
});
