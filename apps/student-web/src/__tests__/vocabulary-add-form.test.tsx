import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VocabularyPage } from '../features/learner/VocabularyPage';

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
jest.mock('../features/learner/learnerApi', () => ({
  vocabularyApi: { list: (...a: unknown[]) => mockList(...a), save: (...a: unknown[]) => mockSave(...a), remove: jest.fn(), due: jest.fn(), review: jest.fn() },
}));

beforeEach(() => {
  mockList.mockResolvedValue({ words: [], dueCount: 0 });
  mockSave.mockResolvedValue({});
});

async function openForm() {
  render(<VocabularyPage />);
  fireEvent.click(await screen.findByRole('button', { name: 'Add a word' }));
  return screen.findByRole('form', { name: 'Add a word' });
}

describe('My words — add a word', () => {
  it('asks for the word, its meaning and an example sentence, like the Word of the Day card', async () => {
    await openForm();
    expect(screen.getByLabelText('English word or phrase')).toBeInTheDocument();
    expect(screen.getByLabelText('Meaning (optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Example sentence (optional)')).toBeInTheDocument();
  });

  it('saves all three together', async () => {
    await openForm();
    fireEvent.change(screen.getByLabelText('English word or phrase'), { target: { value: 'borrow' } });
    fireEvent.change(screen.getByLabelText('Meaning (optional)'), { target: { value: 'to take and give back later' } });
    fireEvent.change(screen.getByLabelText('Example sentence (optional)'), { target: { value: 'Can I borrow your pen?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save word' }));
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith({
      word: 'borrow', meaning: 'to take and give back later', context: 'Can I borrow your pen?', source: 'manual',
    }));
  });

  it('keeps the meaning and example optional, and will not save without a word', async () => {
    await openForm();
    expect(screen.getByRole('button', { name: 'Save word' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('English word or phrase'), { target: { value: 'early' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save word' }));
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith({ word: 'early', meaning: undefined, context: undefined, source: 'manual' }));
  });

  it('Cancel closes the form without saving', async () => {
    await openForm();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('form', { name: 'Add a word' })).not.toBeInTheDocument();
    expect(mockSave).not.toHaveBeenCalled();
  });
});
