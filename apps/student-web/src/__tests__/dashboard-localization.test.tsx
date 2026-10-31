import { render, screen } from '@testing-library/react';
import { translate, setCurrentLocale, type Locale } from '../i18n';
import { ChallengeWidget } from '../features/dashboard/widgets/ChallengeWidget';
import { RecommendationWidget } from '../features/dashboard/widgets/RecommendationWidget';
import { ContinueWidget } from '../features/dashboard/widgets/ContinueWidget';
import { BackLink } from '../features/ai-teacher/ui';
import { humanize } from '../features/progress/aimApi';

let activeLocale: Locale = 'en';
const mockI18n = {
  get t() {
    const locale = activeLocale;
    return (s: string, p?: Record<string, string | number>) => translate(locale, s, p);
  },
  formatNumber: (n: number) => String(n),
};
jest.mock('../i18n/I18nContext', () => ({ useI18n: () => mockI18n }));
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...rest }: { children: unknown; to: string }) => (
    <a href={String(to)} {...rest}>
      {children as never}
    </a>
  ),
}));

function useLocale(locale: Locale) {
  activeLocale = locale;
  setCurrentLocale(locale);
}

afterEach(() => useLocale('en'));

const challenge = (title: string, description: string) => ({
  id: 'c1',
  title,
  description,
  metric: 'lessons',
  targetCount: 1,
  progressCount: 0,
  completed: false,
});

const recommendation = {
  id: 'r1',
  kind: 'review_session',
  targetSkillId: 'vocabulary.everyday_actions',
  targetLessonId: null,
  rank: 1,
  reason: 'review_due',
  basedOnWeaknessId: null,
  generatedAt: '2026-10-31T00:00:00Z',
  expiresAt: null,
  status: 'active',
  updatedAt: '2026-10-31T00:00:00Z',
};

describe('Daily challenge templates', () => {
  it.each([
    ['Finish a lesson', 'Complete 1 lesson today.', 'أكمل درسًا', 'أكمل درسًا واحدًا اليوم.'],
    ['Keep your streak alive', 'Stay active today to extend your learning streak.', 'حافظ على سلسلة أيامك', 'ابقَ نشطًا اليوم لتمديد سلسلة أيام التعلّم.'],
    ['Lesson double', 'Complete 2 lessons today.', 'درسان في يوم', 'أكمل درسين اليوم.'],
  ])('shows Arabic for "%s" and English in English', (title, description, arTitle, arDescription) => {
    useLocale('ar');
    const { unmount } = render(<ChallengeWidget challenge={challenge(title, description) as never} />);
    expect(screen.getByText(arTitle)).toBeTruthy();
    expect(screen.getByText(arDescription)).toBeTruthy();
    expect(screen.queryByText(title)).toBeNull();
    unmount();

    useLocale('en');
    render(<ChallengeWidget challenge={challenge(title, description) as never} />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(description)).toBeTruthy();
  });

  it('keeps an edited or unknown template in its original text instead of breaking', () => {
    useLocale('ar');
    render(<ChallengeWidget challenge={challenge('Weekend sprint', 'Finish 3 lessons.') as never} />);
    expect(screen.getByText('Weekend sprint')).toBeTruthy();
    expect(screen.getByText('Finish 3 lessons.')).toBeTruthy();
  });

  it('isolates the text direction of database-provided text', () => {
    useLocale('ar');
    render(<ChallengeWidget challenge={challenge('Finish a lesson', 'Complete 1 lesson today.') as never} />);
    expect(screen.getByText('أكمل درسًا').className).toContain('[unicode-bidi:plaintext]');
  });
});

describe('Recommendation labels', () => {
  it('shows readable Arabic labels instead of raw enum values', () => {
    useLocale('ar');
    render(<RecommendationWidget recommendations={[recommendation as never]} />);
    expect(screen.getByText('جلسة مراجعة')).toBeTruthy();
    expect(screen.getByText('حان وقت المراجعة')).toBeTruthy();
    expect(screen.queryByText('review_due')).toBeNull();
  });

  it('shows readable English labels instead of raw enum values', () => {
    useLocale('en');
    render(<RecommendationWidget recommendations={[recommendation as never]} />);
    expect(screen.getByText('Review session')).toBeTruthy();
    expect(screen.getByText('Review due')).toBeTruthy();
    expect(screen.queryByText('review_due')).toBeNull();
  });
});

describe('Status vocabulary coverage', () => {
  const vocabulary = [
    'lesson', 'targeted_practice', 'review_session',
    'addresses_weakness', 'reinforces_recent_skill', 'next_in_sequence', 'review_due',
    'emerging', 'developing', 'critical',
    'open', 'improving', 'resolved',
    'active', 'superseded', 'dismissed', 'expired',
    'pending', 'due', 'overdue', 'completed', 'scheduled', 'rescheduled',
    'stable', 'declining', 'insufficient_data',
  ];

  it('has an Arabic translation for every status, kind and reason the backend can send', () => {
    useLocale('ar');
    const untranslated = vocabulary.filter((v) => {
      const english = (() => {
        const s = v.replace(/_/g, ' ');
        return s[0].toUpperCase() + s.slice(1);
      })();
      return humanize(v) === english;
    });
    expect(untranslated).toEqual([]);
  });
});

describe('Back link', () => {
  it('announces the Arabic label to screen readers', () => {
    useLocale('ar');
    render(<BackLink to="/support" label="Back to support" />);
    expect(screen.getByRole('link').getAttribute('aria-label')).toBe('العودة إلى الدعم');
  });

  it('keeps the English label in English', () => {
    useLocale('en');
    render(<BackLink to="/support" label="Back to support" />);
    expect(screen.getByRole('link').getAttribute('aria-label')).toBe('Back to support');
  });
});

describe('Database-provided lesson text in Arabic layout', () => {
  const quickStart = {
    lessonId: 'l1',
    lessonTitle: 'Upper & Lowercase Letters',
    lessonDescription: 'Learn to recognize and write all 26 English letters.',
    skillName: 'Alphabet',
  };

  it('stays readable and direction-isolated; the surrounding labels are Arabic', () => {
    useLocale('ar');
    render(<ContinueWidget continueLesson={null} quickStart={quickStart as never} recommendedCourse={null} enrollment={null} />);
    const title = screen.getByText('Upper & Lowercase Letters');
    expect(title.className).toContain('[unicode-bidi:plaintext]');
    expect(screen.getByText('Learn to recognize and write all 26 English letters.').className).toContain('[unicode-bidi:plaintext]');
    expect(screen.getByText('ابدأ الدرس')).toBeTruthy();
    expect(screen.getByText(/ابدأ من هنا/)).toBeTruthy();
    expect(document.querySelector('bdi')?.textContent).toBe('Alphabet');
  });
});
