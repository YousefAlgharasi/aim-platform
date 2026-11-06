import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { SpotCard } from '../features/improve/ImprovePage';
import type { WeakSpot } from '../features/improve/ImprovePage';
import type { MistakeItem } from '../features/learner/learnerApi';
import { loadSkillTitles, resetSkillTitles } from '../features/progress/skillTitles';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => <a href={String(to)} {...rest}>{children as never}</a>,
}));
jest.mock('../config', () => ({ config: { apiBaseUrl: '/api', googleClientId: '' } }));
const mockGet = jest.fn();
jest.mock('../api/client', () => ({ apiClient: { get: (...a: unknown[]) => mockGet(...a) } }));
jest.mock('../i18n/I18nContext', () => ({
  useI18n: () => ({
    t: (s: string, p?: Record<string, unknown>) => s.replace(/\{(\w+)\}/g, (_, k) => String(p?.[k])),
    plural: (_n: number, f: Record<string, string>) => f.other,
  }),
}));

const spot = {
  skillId: 'en.a1.pho.short_vowels', weakness: null, skill: null, lessonId: 'L1', severity: 'emerging', attempts: 0,
} as unknown as WeakSpot;
const mistake = (n: number, over: Partial<MistakeItem> = {}): MistakeItem => ({
  itemId: `q${n}`, type: 'multiple_choice', prompt: `Question ${n}`, listeningScript: null, options: [],
  yourAnswer: `wrong ${n}`, answeredAt: '2026-11-05T10:00:00Z', skillIds: ['en.a1.pho.short_vowels'], ...over,
});

beforeEach(async () => {
  mockGet.mockResolvedValue({ skills: [{ key: 'en.a1.pho.short_vowels', title: 'Short Vowel Sounds' }] });
  resetSkillTitles();
  await loadSkillTitles();
});

describe('Improve weak-spot card — real mistakes', () => {
  it('shows the readable skill name and the questions the student actually missed', () => {
    render(<SpotCard spot={spot} mistakes={[mistake(1), mistake(2)]} />);
    expect(screen.getByRole('heading', { name: 'Short Vowel Sounds' })).toBeInTheDocument();
    expect(screen.getByText('Questions you missed')).toBeInTheDocument();
    expect(screen.getByText(/Question 1/)).toBeInTheDocument();
    expect(screen.getByText('Last time you answered: ⁨wrong 1⁩')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fix them' })).toHaveAttribute('href', '/mistakes?skill=en.a1.pho.short_vowels');
  });

  it('previews two and says how many more there are', () => {
    render(<SpotCard spot={spot} mistakes={[mistake(1), mistake(2), mistake(3)]} />);
    expect(screen.queryByText(/Question 3/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'See all 3 and fix them' })).toHaveAttribute('href', '/mistakes?skill=en.a1.pho.short_vowels');
  });

  it('has no mistakes section when the skill has no missed questions', () => {
    render(<SpotCard spot={spot} mistakes={[]} />);
    expect(screen.queryByText('Questions you missed')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Practice now' })).toBeInTheDocument();
  });
});
