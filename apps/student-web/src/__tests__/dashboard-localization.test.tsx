import { render, screen, fireEvent } from '@testing-library/react';
import { translate, setCurrentLocale, type Locale } from '../i18n';
import { ChallengeWidget } from '../features/dashboard/widgets/ChallengeWidget';
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
    const { unmount } = render(<ChallengeWidget challenges={[challenge(title, description) as never]} />);
    expect(screen.getByText(arTitle)).toBeTruthy();
    expect(screen.getByText(arDescription)).toBeTruthy();
    expect(screen.queryByText(title)).toBeNull();
    unmount();

    useLocale('en');
    render(<ChallengeWidget challenges={[challenge(title, description) as never]} />);
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByText(description)).toBeTruthy();
  });

  it('keeps an edited or unknown template in its original text instead of breaking', () => {
    useLocale('ar');
    render(<ChallengeWidget challenges={[challenge('Weekend sprint', 'Finish 3 lessons.') as never]} />);
    expect(screen.getByText('Weekend sprint')).toBeTruthy();
    expect(screen.getByText('Finish 3 lessons.')).toBeTruthy();
  });

  it('"Go to lessons" opens the course itself, or the list when no course is known', () => {
    useLocale('en');
    const { unmount } = render(<ChallengeWidget challenges={[challenge('Finish a lesson', 'Complete 1 lesson today.') as never]} courseId="c9" />);
    expect(screen.getByText('Go to lessons').closest('a')?.getAttribute('href')).toBe('/curriculum/c9');
    unmount();
    render(<ChallengeWidget challenges={[challenge('Finish a lesson', 'Complete 1 lesson today.') as never]} />);
    expect(screen.getByText('Go to lessons').closest('a')?.getAttribute('href')).toBe('/curriculum');
  });

  it('isolates the text direction of database-provided text', () => {
    useLocale('ar');
    render(<ChallengeWidget challenges={[challenge('Finish a lesson', 'Complete 1 lesson today.') as never]} />);
    expect(screen.getByText('أكمل درسًا').className).toContain('[unicode-bidi:plaintext]');
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
    // The description is no longer shown inline: an Info button opens it in a popover.
    expect(screen.queryByText('Learn to recognize and write all 26 English letters.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /وصف الدرس/ }));
    const description = screen.getByText('Learn to recognize and write all 26 English letters.');
    expect(description.getAttribute('dir')).toBe('auto');
    expect(screen.getByText('ابدأ الدرس')).toBeTruthy();
    expect(screen.getByText(/ابدأ من هنا/)).toBeTruthy();
    expect(document.querySelector('bdi')?.textContent).toBe('Alphabet');
  });
});

describe('Daily challenges list', () => {
  const row = (key: string, title: string, description: string, completed = false) =>
    ({ key, title, description, targetCount: 1, progressCount: completed ? 1 : 0, completed }) as never;

  it('shows the lesson, speaking and writing challenges, each linking to where it is done', () => {
    useLocale('en');
    render(
      <ChallengeWidget
        courseId="c9"
        challenges={[
          row('complete_one_lesson', 'Finish a lesson', 'Complete 1 lesson today.'),
          row('practice_speaking', 'Speaking practice', 'Finish 1 speaking practice today.'),
          row('practice_writing', 'Write a paragraph', 'Write and submit 1 paragraph in Practice today.', true),
        ]}
      />,
    );
    expect(screen.getByText('Go to lessons').closest('a')?.getAttribute('href')).toBe('/curriculum/c9');
    expect(screen.getByText('Start speaking').closest('a')?.getAttribute('href')).toBe('/practice/speaking');
    // A finished challenge shows its status instead of a link.
    expect(screen.queryByText('Start writing')).toBeNull();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
  });

  it('is translated to Arabic', () => {
    useLocale('ar');
    render(<ChallengeWidget challenges={[row('practice_speaking', 'Speaking practice', 'Finish 1 speaking practice today.'), row('practice_writing', 'Write a paragraph', 'Write and submit 1 paragraph in Practice today.')]} />);
    expect(screen.getByText('تحديات اليوم')).toBeTruthy();
    expect(screen.getByText('تدريب المحادثة')).toBeTruthy();
    expect(screen.getByText('اكتب فقرة')).toBeTruthy();
    expect(screen.getByText('ابدأ المحادثة').closest('a')?.getAttribute('href')).toBe('/practice/speaking');
    expect(screen.getByText('ابدأ الكتابة').closest('a')?.getAttribute('href')).toBe('/practice/writing');
  });

  it('translates the goal challenge with the student\'s own number', () => {
    useLocale('ar');
    render(<ChallengeWidget challenges={[{ key: 'daily_goal', title: 'Reach your daily goal', description: 'Complete 3 lessons today.', targetCount: 3, progressCount: 1, completed: false } as never]} />);
    expect(screen.getByText('حقّق هدفك اليومي')).toBeTruthy();
    expect(screen.getByText(/أكمل 3 دروس اليوم\./)).toBeTruthy();
    expect(screen.getByText('1/3')).toBeTruthy();
    // The progress circle already shows progress: no bar here.
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('Leaderboard', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { LeaderboardList } = require('../features/leaderboard/LeaderboardList');
  const board = {
    period: 'week',
    entries: [{ rank: 1, name: 'Sara K.', xp: 90, isYou: false }, { rank: 2, name: 'Omar T.', xp: 70, isYou: false }],
    you: { rank: 9, name: 'Y S.', xp: 5, isYou: true },
  };

  it('lists the top learners and shows the caller below them when outside the list', () => {
    useLocale('en');
    render(<LeaderboardList board={board} emptyText="empty" />);
    expect(screen.getByText('Sara K.')).toBeTruthy();
    expect(screen.getByText('90 XP')).toBeTruthy();
    const mine = screen.getByText('Y S.').closest('li');
    expect(mine?.getAttribute('aria-current')).toBe('true');
    expect(screen.getByText('9')).toBeTruthy();
  });

  it('does not repeat the caller when already in the top list', () => {
    useLocale('en');
    render(<LeaderboardList board={{ ...board, entries: [{ rank: 1, name: 'Y S.', xp: 90, isYou: true }], you: { rank: 1, name: 'Y S.', xp: 90, isYou: true } }} emptyText="empty" />);
    expect(screen.getAllByText('Y S.')).toHaveLength(1);
  });

  it('says so when nobody is ranked yet', () => {
    useLocale('en');
    render(<LeaderboardList board={{ period: 'week', entries: [], you: null }} emptyText="Nobody yet" />);
    expect(screen.getByText('Nobody yet')).toBeTruthy();
  });

  it('shows Arabic for the labels', () => {
    useLocale('ar');
    render(<LeaderboardList board={board} emptyText="x" />);
    expect(screen.getByText('90 نقطة')).toBeTruthy();
    expect(screen.getByText('أنت')).toBeTruthy();
  });
});
