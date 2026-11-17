import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { VoicePage } from '../features/settings/VoicePage';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
  useNavigate: () => jest.fn(),
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockI18n = {
  t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
  plural: (_n: number, f: Record<string, string>) => f.other,
  locale: 'en',
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));

const mockGet = jest.fn();
const mockSave = jest.fn();
const mockPreview = jest.fn();
jest.mock('../features/settings/voiceApi', () => ({
  ...jest.requireActual('../features/settings/voiceApi'),
  voiceApi: { get: (...a: unknown[]) => mockGet(...a), save: (...a: unknown[]) => mockSave(...a), preview: (...a: unknown[]) => mockPreview(...a) },
}));

const voices = (names: Array<[string, 'female' | 'male']>) => names.map(([id, gender]) => ({ id, name: id[0].toUpperCase() + id.slice(1), nameAr: id, gender }));
const en = { code: 'en', selected: null, available: true, voices: voices([['hannah', 'female'], ['austin', 'male']]) };
const ar = { code: 'ar', selected: 'fahad', available: true, voices: voices([['lulwa', 'female'], ['fahad', 'male']]) };

beforeEach(() => {
  mockGet.mockResolvedValue({ languages: [en, ar] });
  mockSave.mockResolvedValue({});
  mockPreview.mockResolvedValue(new Blob(['x']));
  (global as unknown as { URL: { createObjectURL: () => string; revokeObjectURL: () => void } }).URL.createObjectURL = () => 'blob:x';
  (global as unknown as { URL: { revokeObjectURL: () => void } }).URL.revokeObjectURL = () => undefined;
});

describe('teacher voice page', () => {
  it('lists the voices of each enabled language and marks the current choice', async () => {
    render(<VoicePage />);
    expect(await screen.findByText('English voice')).toBeInTheDocument();
    expect(screen.getByText('Arabic voice')).toBeInTheDocument();
    expect(screen.getByText('Hannah')).toBeInTheDocument();
    expect(screen.getByText('Selected')).toBeInTheDocument(); // fahad
    expect(screen.getByText('Use the default voice')).toBeInTheDocument();
  });

  it('saves the voice the student chooses', async () => {
    render(<VoicePage />);
    await screen.findByText('English voice');
    fireEvent.click(screen.getAllByText('Choose')[1]); // Austin (second English voice)
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith({ en: 'austin' }));
    expect(await screen.findByText('Voice saved. Your teacher will use it from the next reply.')).toBeInTheDocument();
  });

  it('filters by woman / man', async () => {
    render(<VoicePage />);
    await screen.findByText('English voice');
    fireEvent.click(screen.getAllByRole('tab', { name: 'Man' })[0]);
    expect(screen.queryByText('Hannah')).not.toBeInTheDocument();
    expect(screen.getByText('Austin')).toBeInTheDocument();
  });

  it('resets a language to the default voice', async () => {
    render(<VoicePage />);
    fireEvent.click(await screen.findByText('Use the default voice'));
    await waitFor(() => expect(mockSave).toHaveBeenCalledWith({ ar: null }));
  });

  it('fetches a sample only when the student asks to listen', async () => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    render(<VoicePage />);
    await screen.findByText('English voice');
    expect(mockPreview).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByText('Listen')[0]);
    await waitFor(() => expect(mockPreview).toHaveBeenCalledWith('en', 'hannah'));
  });

  it('says the Arabic voice is not available when the admin has not set it up', async () => {
    mockGet.mockResolvedValue({ languages: [en, { ...ar, available: false }] });
    render(<VoicePage />);
    expect(await screen.findByText('The Arabic voice is not available yet.')).toBeInTheDocument();
  });
});
