import { decideCelebration, hadCompletionToday, isMilestone, streakDay, streakTone, type SummarySnapshot } from '../interaction/streak';
import type { EngagementSummary } from '../features/dashboard/dashboardApi';

function summary(streakDays: number, completedToday = 0, practice: { speaking?: number; writing?: number } = {}): EngagementSummary {
  return {
    goal: { targetLessons: 1, completedToday, streakDays },
    challenge: null,
    challenges: [
      { key: 'daily_goal', title: '', description: '', targetCount: 1, progressCount: Math.min(completedToday, 1), completed: completedToday >= 1 },
      { key: 'practice_speaking', title: '', description: '', targetCount: 1, progressCount: practice.speaking ?? 0, completed: false },
      { key: 'practice_writing', title: '', description: '', targetCount: 1, progressCount: practice.writing ?? 0, completed: false },
    ],
  };
}
const snap = (s: EngagementSummary, day: string): SummarySnapshot => ({ summary: s, day });
const TODAY = '2026-11-10';
const YESTERDAY = '2026-11-09';

describe('streak celebration decision', () => {
  test('first finished activity today celebrates and shows the previous count', () => {
    const c = decideCelebration(summary(3, 1), snap(summary(2, 0), TODAY), { day: YESTERDAY, streak: 2 }, TODAY);
    expect(c).toEqual({ previous: 2, current: 3, milestone: false, day: TODAY });
  });

  test('another activity the same day does not celebrate again', () => {
    expect(decideCelebration(summary(3, 2), snap(summary(3, 1), TODAY), { day: TODAY, streak: 3 }, TODAY)).toBeNull();
  });

  test('refresh or duplicate completion event: the stored record blocks a replay even with no earlier snapshot', () => {
    expect(decideCelebration(summary(3, 1), null, { day: TODAY, streak: 3 }, TODAY)).toBeNull();
  });

  test('day already earned on another device or tab (no local record) stays quiet', () => {
    expect(decideCelebration(summary(3, 2), snap(summary(3, 1), TODAY), { day: YESTERDAY, streak: 2 }, TODAY)).toBeNull();
    expect(decideCelebration(summary(3, 0, { writing: 1 }), snap(summary(3, 0, { speaking: 1 }), TODAY), null, TODAY)).toBeNull();
  });

  test('consecutive days: each new day celebrates once with the next count', () => {
    const day2 = decideCelebration(summary(2, 1), snap(summary(1, 0), TODAY), { day: YESTERDAY, streak: 1 }, TODAY);
    expect(day2?.previous).toBe(1);
    expect(day2?.current).toBe(2);
  });

  test('missed days: the streak restarts at 1 with the "start" wording', () => {
    const c = decideCelebration(summary(1, 1), snap(summary(0, 0), TODAY), { day: '2026-11-01', streak: 6 }, TODAY);
    expect(c).toEqual({ previous: 0, current: 1, milestone: false, day: TODAY });
    expect(streakTone(1)).toBe('start');
  });

  test('a snapshot from before UTC midnight does not hide the new day', () => {
    // Tab left open overnight: yesterday's summary showed a finished lesson, but that was yesterday.
    const c = decideCelebration(summary(4, 1), snap(summary(3, 1), YESTERDAY), { day: YESTERDAY, streak: 3 }, TODAY);
    expect(c?.current).toBe(4);
  });

  test('no streak from the server means no celebration (nothing is invented)', () => {
    expect(decideCelebration(summary(0, 0), null, null, TODAY)).toBeNull();
  });

  test('milestones are flagged at 7, 14 and 30', () => {
    for (const n of [7, 14, 30]) {
      expect(decideCelebration(summary(n, 1), null, null, TODAY)?.milestone).toBe(true);
    }
    expect(isMilestone(8)).toBe(false);
    expect(streakTone(7)).toBe('week');
    expect(streakTone(14)).toBe('two-weeks');
    expect(streakTone(30)).toBe('month');
    expect(streakTone(5)).toBe('going');
  });

  test('the day key is the UTC calendar day, matching the backend streak boundary', () => {
    expect(streakDay(new Date('2026-11-10T23:59:59.000Z'))).toBe('2026-11-10');
    expect(streakDay(new Date('2026-11-11T00:00:00.000Z'))).toBe('2026-11-11');
    // 02:30 on the 11th in UTC+3 is still the 10th in UTC.
    expect(streakDay(new Date('2026-11-11T02:30:00.000+03:00'))).toBe('2026-11-10');
  });

  test('hadCompletionToday reads lessons and practice, not the lesson goal row', () => {
    expect(hadCompletionToday(summary(2, 0))).toBe(false);
    expect(hadCompletionToday(summary(2, 1))).toBe(true);
    expect(hadCompletionToday(summary(2, 0, { speaking: 1 }))).toBe(true);
  });
});
