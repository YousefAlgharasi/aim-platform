// Streak celebration rules (pure, no React). The streak itself is computed by the backend
// (services/backend-api/src/features/engagement); nothing here changes or invents progress.
//
// Day boundary: the backend counts streak days in UTC, so "today" here is the UTC calendar day too.
import type { EngagementSummary } from '../features/dashboard/dashboardApi';

export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365] as const;

export function isMilestone(days: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(days);
}

/** yyyy-mm-dd in UTC: the same day key the backend uses for streak days. */
export function streakDay(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export interface SummarySnapshot {
  summary: EngagementSummary;
  /** UTC day the snapshot was fetched on. */
  day: string;
}

export interface CelebrationRecord { day: string; streak: number }

export interface StreakCelebration {
  /** Count shown before the transition (always current - 1). */
  previous: number;
  current: number;
  milestone: boolean;
  day: string;
}

/** Any activity the server already counted as finished today (lessons, speaking or writing practice). */
export function hadCompletionToday(summary: EngagementSummary): boolean {
  if (summary.goal.completedToday > 0) return true;
  return (summary.challenges ?? []).some((c) => c.key.startsWith('practice_') && c.progressCount > 0);
}

/**
 * Decide whether a confirmed completion earns the "new streak day" celebration.
 *   after    – summary fetched after the server confirmed the completion.
 *   before   – the last summary seen before that completion (null if none was loaded).
 *   last     – the celebration already recorded on this device for this learner.
 * Returns null when today was already celebrated, already earned elsewhere, or there is no streak.
 */
export function decideCelebration(
  after: EngagementSummary,
  before: SummarySnapshot | null,
  last: CelebrationRecord | null,
  today: string = streakDay(),
): StreakCelebration | null {
  const current = after.goal.streakDays;
  if (!Number.isFinite(current) || current < 1) return null;
  if (last?.day === today) return null;
  // Finished something earlier today (another tab or device): the day was earned then, not now.
  if (before && before.day === today && hadCompletionToday(before.summary)) return null;
  return { previous: current - 1, current, milestone: isMilestone(current), day: today };
}

const key = (uid: string) => `aim-streak-celebrated:${uid}`;

export function readCelebrationRecord(uid: string): CelebrationRecord | null {
  try {
    const raw = JSON.parse(localStorage.getItem(key(uid)) ?? 'null') as Partial<CelebrationRecord> | null;
    return raw && typeof raw.day === 'string' && typeof raw.streak === 'number' ? { day: raw.day, streak: raw.streak } : null;
  } catch {
    return null;
  }
}

export function writeCelebrationRecord(uid: string, record: CelebrationRecord) {
  try { localStorage.setItem(key(uid), JSON.stringify(record)); } catch { /* per-device convenience only */ }
}

export type StreakTone = 'start' | 'going' | 'week' | 'two-weeks' | 'month' | 'milestone';

export function streakTone(days: number): StreakTone {
  if (days === 7) return 'week';
  if (days === 14) return 'two-weeks';
  if (days === 30) return 'month';
  if (isMilestone(days)) return 'milestone';
  return days <= 1 ? 'start' : 'going';
}

/** English source strings (also the i18n keys). */
export const STREAK_TONE_TEXT: Record<StreakTone, string> = {
  start: 'A great start!',
  going: 'Keep it going!',
  week: 'One full week. Well done!',
  'two-weeks': 'Two weeks strong!',
  month: 'Thirty days. That is real dedication!',
  milestone: 'A big milestone. Well done!',
};
