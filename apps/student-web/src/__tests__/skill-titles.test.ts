import { setCurrentLocale } from '../i18n';
import { prettifySkillId } from '../features/progress/aimApi';
import { loadSkillTitles, resetSkillTitles } from '../features/progress/skillTitles';

const mockGet = jest.fn();
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
jest.mock('../api/client', () => ({ apiClient: { get: (...a: unknown[]) => mockGet(...a) } }));

beforeEach(() => {
  jest.clearAllMocks();
  resetSkillTitles();
  setCurrentLocale('en');
});

describe('skill names', () => {
  it('without the catalogue, tidies the key instead of showing it raw', () => {
    expect(prettifySkillId('en.a1.pho.short_vowels')).toBe('Short Vowels');
    expect(prettifySkillId('vocabulary.everyday_actions')).toBe('Everyday Actions');
    expect(prettifySkillId('skill:arabic:p1:vocab')).toBe('Vocab');
  });

  it('shows the real title once the catalogue is loaded', async () => {
    mockGet.mockResolvedValue({ skills: [
      { key: 'en.a1.pho.short_vowels', title: 'Short Vowel Sounds' },
      { key: 'en.a1.spe.introduce_self', title: 'Introduce Yourself' },
      { key: 'en.a1.pho.letter_recognition', title: 'Letter Recognition (A-Z)' },
    ] });
    await loadSkillTitles();
    expect(mockGet).toHaveBeenCalledWith('/student/skills/titles');
    expect(prettifySkillId('en.a1.pho.short_vowels')).toBe('Short Vowel Sounds');
    expect(prettifySkillId('en.a1.spe.introduce_self')).toBe('Introduce Yourself');
    expect(prettifySkillId('en.a1.pho.letter_recognition')).toBe('Letter Recognition (A-Z)');
    // A key the catalogue does not know still gets the tidy fallback.
    expect(prettifySkillId('en.z9.unknown.some_skill')).toBe('Some Skill');
  });

  it('shows the Arabic name in Arabic', async () => {
    mockGet.mockResolvedValue({ skills: [{ key: 'en.a1.pho.short_vowels', title: 'Short Vowel Sounds' }] });
    await loadSkillTitles();
    setCurrentLocale('ar');
    expect(prettifySkillId('en.a1.pho.short_vowels')).toBe('أصوات الحروف المتحركة القصيرة');
  });

  it('loads the catalogue once, and retries after a failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('down')).mockResolvedValue({ skills: [{ key: 'k', title: 'A Title' }] });
    await loadSkillTitles();
    expect(prettifySkillId('k')).toBe('K'); // failed: falls back, no crash
    await loadSkillTitles(); // retried
    await loadSkillTitles(); // cached
    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(prettifySkillId('k')).toBe('A Title');
  });
});
