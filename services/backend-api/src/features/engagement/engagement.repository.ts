// EngagementRepository.
//
// Scope: Backend-owned per-student daily goal + daily challenge persistence.
//
// Security rules:
//   - student_id always JWT-resolved by the caller — never trusted from a
//     client body.
//   - Challenge templates are read-only from this repository's perspective;
//     they are seeded via migration, never written by client requests.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface LearningGoalRow {
  readonly student_id: string;
  readonly daily_goal_lessons: number;
}

interface ChallengeTemplateRow {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly challenge_type: 'lessons' | 'streak';
  readonly target_count: number;
}

/**
 * XP earned from Practice Speaking / Write a Paragraph (practice_attempts.xp_awarded), as a scalar
 * subquery for the student in $1 (matched by users.id or the Supabase auth uid, like other tables).
 * [extraCondition] narrows it by date. Added to the lesson XP so one total drives levels and badges.
 */
const practiceXp = (extraCondition = ''): string =>
  `COALESCE((SELECT SUM(pa.xp_awarded) FROM practice_attempts pa
     WHERE pa.student_id IN (SELECT u.id FROM users u WHERE u.id = $1 OR u.supabase_auth_uid = $1)
       AND pa.xp_awarded > 0 ${extraCondition}), 0)::int`;

const PRACTICE_XP_TODAY = `AND (pa.completed_at AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date`;
const PRACTICE_XP_LAST_WEEK = `AND (pa.completed_at AT TIME ZONE 'UTC')::date >= date_trunc('week', (now() AT TIME ZONE 'UTC'))::date - 7
       AND (pa.completed_at AT TIME ZONE 'UTC')::date < date_trunc('week', (now() AT TIME ZONE 'UTC'))::date`;
const PRACTICE_XP_ON_DAY = `AND (pa.completed_at AT TIME ZONE 'UTC')::date = daily.day`;

/**
 * XP per student from lessons and Practice, as CTEs (`events`, `totals`). Lesson progress is keyed by the sign-in id
 * (users.supabase_auth_uid) and practice attempts by users.id, so both are mapped to users.id here.
 * [since] limits it to events at or after that moment (SQL expression); `reached_at` is when the latest XP arrived,
 * used to break ties in favour of whoever got there first.
 */
const xpTotalsCte = (since?: string): string => `
  events AS (
    SELECT u.id AS user_id, l.xp_value::int AS xp, COALESCE(lp.completed_at, lp.updated_at) AS at
    FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    JOIN users u ON u.supabase_auth_uid = lp.student_id
    WHERE lp.completed = true ${since ? `AND COALESCE(lp.completed_at, lp.updated_at) >= ${since}` : ''}
    UNION ALL
    SELECT pa.student_id AS user_id, pa.xp_awarded AS xp, pa.completed_at AS at
    FROM practice_attempts pa
    WHERE pa.xp_awarded > 0 AND pa.completed_at IS NOT NULL ${since ? `AND pa.completed_at >= ${since}` : ''}
  ),
  totals AS (
    SELECT sp.user_id, u.supabase_auth_uid, sp.display_name,
           COALESCE(SUM(e.xp), 0)::int AS xp, MAX(e.at) AS reached_at
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN events e ON e.user_id = sp.user_id
    GROUP BY sp.user_id, u.supabase_auth_uid, sp.display_name
  )`;

/** Monday 00:00 UTC of the current week. */
const WEEK_START = `(date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')`;

export interface LeaderboardRow {
  readonly rank: number;
  readonly display_name: string | null;
  readonly xp: number;
  readonly is_you: boolean;
}

@Injectable()
export class EngagementRepository {
  constructor(private readonly db: DatabaseService) {}

  async findGoal(studentId: string): Promise<LearningGoalRow | null> {
    const result = await this.db.query<LearningGoalRow>(
      `SELECT student_id, daily_goal_lessons FROM student_learning_goals WHERE student_id = $1`,
      [studentId],
    );
    return result.rows[0] ?? null;
  }

  async upsertGoal(studentId: string, dailyGoalLessons: number): Promise<LearningGoalRow> {
    const result = await this.db.query<LearningGoalRow>(
      `INSERT INTO student_learning_goals (student_id, daily_goal_lessons)
       VALUES ($1, $2)
       ON CONFLICT (student_id)
         DO UPDATE SET daily_goal_lessons = EXCLUDED.daily_goal_lessons, updated_at = now()
       RETURNING student_id, daily_goal_lessons`,
      [studentId, dailyGoalLessons],
    );
    return result.rows[0];
  }

  async countLessonsCompletedToday(studentId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM lesson_progress
       WHERE student_id = $1 AND completed = true AND completed_at::date = (now() AT TIME ZONE 'UTC')::date`,
      [studentId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  async findActiveDates(studentId: string, limit: number): Promise<string[]> {
    const result = await this.db.query<{ active_date: string }>(
      `SELECT DISTINCT active_date FROM (
         SELECT (last_active_at AT TIME ZONE 'UTC')::date::text AS active_date
         FROM lesson_progress
         WHERE student_id = $1 AND last_active_at IS NOT NULL
         UNION
         SELECT (graded_at AT TIME ZONE 'UTC')::date::text AS active_date
         FROM assessment_results
         WHERE student_id = $1 AND graded_at IS NOT NULL
         UNION
         -- Practice Speaking / Write a Paragraph earn XP, so they keep the streak alive too.
         SELECT (pa.completed_at AT TIME ZONE 'UTC')::date::text AS active_date
         FROM practice_attempts pa
         WHERE pa.student_id IN (SELECT u.id FROM users u WHERE u.id = $1 OR u.supabase_auth_uid = $1)
           AND pa.completed_at IS NOT NULL
       ) sub
       ORDER BY active_date DESC
       LIMIT $2`,
      [studentId, limit],
    );
    return result.rows.map((row) => row.active_date);
  }

  /** Dates the student covered with a freeze, newest first. */
  async findFrozenDates(studentId: string, limit: number): Promise<string[]> {
    const result = await this.db.query<{ frozen_date: string }>(
      `SELECT frozen_date::text AS frozen_date FROM streak_freezes
       WHERE student_id = $1 ORDER BY frozen_date DESC LIMIT $2`,
      [studentId, limit],
    );
    return result.rows.map((row) => row.frozen_date);
  }

  async countFreezesThisMonth(studentId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM streak_freezes
       WHERE student_id = $1
         AND (created_at AT TIME ZONE 'UTC') >= date_trunc('month', now() AT TIME ZONE 'UTC')`,
      [studentId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /**
   * Record a freeze for [date] only if the monthly allowance is not used up. One statement, so two quick taps
   * cannot go over the allowance. Returns false when nothing was inserted (allowance used, or date already frozen).
   */
  async insertFreezeIfAllowed(studentId: string, date: string, allowance: number): Promise<boolean> {
    const result = await this.db.query(
      `INSERT INTO streak_freezes (student_id, frozen_date)
       SELECT $1::uuid, $2::date
       WHERE (SELECT COUNT(*) FROM streak_freezes
              WHERE student_id = $1::uuid
                AND (created_at AT TIME ZONE 'UTC') >= date_trunc('month', now() AT TIME ZONE 'UTC')) < $3
       ON CONFLICT (student_id, frozen_date) DO NOTHING`,
      [studentId, date, allowance],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Practice sessions (speaking / writing) the student finished today (UTC), for the daily practice challenges. */
  async countPracticeCompletedToday(studentId: string): Promise<{ speaking: number; writing: number }> {
    const result = await this.db.query<{ kind: string; n: number }>(
      `SELECT pa.kind, COUNT(*)::int AS n
       FROM practice_attempts pa
       WHERE pa.student_id IN (SELECT u.id FROM users u WHERE u.id = $1 OR u.supabase_auth_uid = $1)
         AND pa.status = 'completed' ${PRACTICE_XP_TODAY}
       GROUP BY pa.kind`,
      [studentId],
    );
    const by = (kind: string): number => result.rows.find((r) => r.kind === kind)?.n ?? 0;
    return { speaking: by('speaking'), writing: by('writing') };
  }

  async findActiveChallengeTemplates(): Promise<ChallengeTemplateRow[]> {
    const result = await this.db.query<ChallengeTemplateRow>(
      `SELECT id, key, title, description, challenge_type, target_count
       FROM daily_challenge_templates
       WHERE is_active = true
       ORDER BY key ASC`,
    );
    return result.rows;
  }

  async findXpLevels(): Promise<XpLevelRow[]> {
    const result = await this.db.query<XpLevelRow>(
      `SELECT level, min_xp FROM xp_levels ORDER BY level ASC`,
    );
    return result.rows;
  }

  async sumTotalXp(studentId: string): Promise<number> {
    const result = await this.db.query<{ total_xp: number }>(
      `SELECT (COALESCE(SUM(l.xp_value), 0) + ${practiceXp()})::int AS total_xp
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.student_id = $1 AND lp.completed = true`,
      [studentId],
    );
    return result.rows[0]?.total_xp ?? 0;
  }

  async sumXpToday(studentId: string): Promise<number> {
    const result = await this.db.query<{ xp_today: number }>(
      `SELECT (COALESCE(SUM(l.xp_value), 0) + ${practiceXp(PRACTICE_XP_TODAY)})::int AS xp_today
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       WHERE lp.student_id = $1 AND lp.completed = true
         AND (lp.completed_at AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date`,
      [studentId],
    );
    return result.rows[0]?.xp_today ?? 0;
  }

  /** Sum of XP earned in the 7 UTC days immediately before the current week. */
  async sumXpLastWeek(studentId: string): Promise<number> {
    const result = await this.db.query<{ total_xp: number }>(
      `WITH week_bounds AS (
         SELECT date_trunc('week', (now() AT TIME ZONE 'UTC'))::date AS week_start
       )
       SELECT (COALESCE(SUM(l.xp_value), 0) + ${practiceXp(PRACTICE_XP_LAST_WEEK)})::int AS total_xp
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id, week_bounds wb
       WHERE lp.student_id = $1 AND lp.completed = true
         AND (lp.completed_at AT TIME ZONE 'UTC')::date >= wb.week_start - INTERVAL '7 days'
         AND (lp.completed_at AT TIME ZONE 'UTC')::date < wb.week_start`,
      [studentId],
    );
    return result.rows[0]?.total_xp ?? 0;
  }

  async findWeeklyXp(studentId: string): Promise<WeeklyXpRow[]> {
    const result = await this.db.query<WeeklyXpRow>(
      `WITH week_bounds AS (
         SELECT date_trunc('week', (now() AT TIME ZONE 'UTC'))::date AS week_start
       ),
       days AS (
         SELECT generate_series(0, 6) AS day_offset
       ),
       daily AS (
         SELECT (wb.week_start + d.day_offset) AS day
         FROM week_bounds wb, days d
       )
       SELECT daily.day::text AS day,
              (COALESCE(SUM(l.xp_value), 0) + ${practiceXp(PRACTICE_XP_ON_DAY)})::int AS xp
       FROM daily
       LEFT JOIN lesson_progress lp
         ON lp.student_id = $1 AND lp.completed = true
         AND (lp.completed_at AT TIME ZONE 'UTC')::date = daily.day
       LEFT JOIN lessons l ON l.id = lp.lesson_id
       GROUP BY daily.day
       ORDER BY daily.day ASC`,
      [studentId],
    );
    return result.rows;
  }

  async countUnlockedBadges(studentId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM student_achievements
       WHERE student_id = $1 AND unlocked_at IS NOT NULL`,
      [studentId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /**
   * Percentile rank (0 = best) of studentId's total XP among all students
   * (every row in student_profiles), lowest total_xp tying at 1 (worst).
   * Returns null if studentId has no student_profiles row.
   */
  async findRankPercentile(studentId: string): Promise<number | null> {
    const result = await this.db.query<{ pct_rank: number }>(
      `WITH ${xpTotalsCte()},
       ranked AS (
         SELECT supabase_auth_uid, PERCENT_RANK() OVER (ORDER BY xp DESC) AS pct_rank
         FROM totals
       )
       SELECT pct_rank FROM ranked WHERE supabase_auth_uid = $1`,
      [studentId],
    );
    return result.rows[0]?.pct_rank ?? null;
  }

  /** The top [limit] students by XP for the period, plus the caller's own row. Only students with XP > 0 are ranked. */
  async findLeaderboard(studentId: string, period: 'week' | 'all', limit: number): Promise<LeaderboardRow[]> {
    const result = await this.db.query<LeaderboardRow>(
      `WITH ${xpTotalsCte(period === 'week' ? WEEK_START : undefined)},
       ranked AS (
         SELECT display_name, xp, supabase_auth_uid = $1 AS is_you,
                ROW_NUMBER() OVER (ORDER BY xp DESC, reached_at ASC NULLS LAST, user_id) AS rank
         FROM totals
         WHERE xp > 0
       )
       SELECT rank::int AS rank, display_name, xp, is_you
       FROM ranked
       WHERE rank <= $2 OR is_you
       ORDER BY rank`,
      [studentId, limit],
    );
    return result.rows;
  }
}

interface XpLevelRow {
  readonly level: number;
  readonly min_xp: number;
}

interface WeeklyXpRow {
  readonly day: string;
  readonly xp: number;
}
