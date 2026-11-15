// AchievementsRepository.
//
// Scope: Backend-owned achievement catalog + per-student unlock state
// persistence.
//
// Security rules:
//   - student_id always JWT-resolved by the caller — never trusted from a
//     client body.
//   - achievement_definitions is read-only from this repository's
//     perspective; it is seeded via migration, never written by client
//     requests.
//   - unlockAchievement is intended to be invoked only from backend
//     event-processing code (lesson completion, streak, assessment-pass),
//     never from a client-facing endpoint.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AchievementCounters } from './achievement-rules';

interface AchievementDefinitionRow {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: string;
  readonly rule_type: string | null;
  readonly rule_threshold: number | null;
}

interface StudentAchievementRow {
  readonly achievement_id: string;
  readonly unlocked_at: Date | null;
}

@Injectable()
export class AchievementsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findActiveDefinitions(): Promise<AchievementDefinitionRow[]> {
    const result = await this.db.query<AchievementDefinitionRow>(
      `SELECT id, key, title, description, icon, category, rule_type, rule_threshold
       FROM achievement_definitions
       WHERE is_active = true
       ORDER BY created_at ASC`,
    );
    return result.rows;
  }

  async findUnlockStateForStudent(studentId: string): Promise<StudentAchievementRow[]> {
    const result = await this.db.query<StudentAchievementRow>(
      `SELECT achievement_id, unlocked_at
       FROM student_achievements
       WHERE student_id = $1`,
      [studentId],
    );
    return result.rows;
  }

  async unlockAchievement(studentId: string, achievementId: string): Promise<void> {
    await this.db.query(
      `INSERT INTO student_achievements (student_id, achievement_id, unlocked_at)
       VALUES ($1, $2, now())
       ON CONFLICT (student_id, achievement_id)
         DO UPDATE SET unlocked_at = COALESCE(student_achievements.unlocked_at, EXCLUDED.unlocked_at),
                        updated_at = now()`,
      [studentId, achievementId],
    );
  }

  async countCompletedLessons(studentId: string): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM lesson_progress WHERE student_id = $1 AND completed = true`,
      [studentId],
    );
    return parseInt(res.rows[0]?.count ?? '0', 10);
  }

  async countPassedAssessments(studentId: string): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM assessment_results WHERE student_id = $1 AND passed = true`,
      [studentId],
    );
    return parseInt(res.rows[0]?.count ?? '0', 10);
  }

  /**
   * Every counter an achievement rule can use, measured for one student. The id passed in is the sign-in id;
   * tables keyed by users.id / profile id are matched too (see admin-student-ids.ts for why).
   */
  async getCounters(studentId: string): Promise<AchievementCounters> {
    const res = await this.db.query<Record<string, string | number | null>>(
      `WITH ids AS (
         SELECT $1::uuid AS id
         UNION SELECT u.id FROM users u WHERE u.id = $1 OR u.supabase_auth_uid = $1
         UNION SELECT sp.id FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE u.id = $1 OR u.supabase_auth_uid = $1
       ),
       active_days AS (
         SELECT (last_active_at AT TIME ZONE 'UTC')::date AS d FROM lesson_progress
          WHERE student_id IN (SELECT id FROM ids) AND last_active_at IS NOT NULL
         UNION SELECT (graded_at AT TIME ZONE 'UTC')::date FROM assessment_results
          WHERE student_id IN (SELECT id FROM ids) AND graded_at IS NOT NULL
         UNION SELECT (completed_at AT TIME ZONE 'UTC')::date FROM practice_attempts
          WHERE student_id IN (SELECT id FROM ids) AND completed_at IS NOT NULL
       ),
       runs AS (
         SELECT count(*) AS len FROM (
           SELECT d, d - (row_number() OVER (ORDER BY d))::int AS grp FROM active_days
         ) x GROUP BY grp
       )
       SELECT
         (SELECT count(*) FROM lesson_progress WHERE student_id IN (SELECT id FROM ids) AND completed) AS lessons_completed,
         (SELECT count(*) FROM assessment_results WHERE student_id IN (SELECT id FROM ids) AND passed) AS assessments_passed,
         (SELECT count(*) FROM assessment_results WHERE student_id IN (SELECT id FROM ids) AND max_score > 0 AND score >= max_score) AS perfect_scores,
         COALESCE((SELECT max(len) FROM runs), 0) AS streak_days,
         (SELECT count(*) FROM lesson_attempts WHERE student_id IN (SELECT id FROM ids) AND is_correct) AS correct_answers,
         (SELECT count(*) FROM practice_attempts WHERE student_id IN (SELECT id FROM ids) AND kind = 'speaking' AND status = 'completed') AS speaking_practices,
         (SELECT count(*) FROM practice_attempts WHERE student_id IN (SELECT id FROM ids) AND kind = 'writing' AND status = 'completed') AS writing_practices,
         (SELECT count(*) FROM mistakes WHERE student_id IN (SELECT id FROM ids) AND is_resolved) AS mistakes_fixed,
         (SELECT count(*) FROM student_skill_states WHERE student_id IN (SELECT id FROM ids) AND mastery_score >= 0.8) AS skills_mastered,
         (SELECT count(*) FROM certificates WHERE student_id IN (SELECT id FROM ids)) AS courses_completed,
         (COALESCE((SELECT SUM(l.xp_value) FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
                     WHERE lp.student_id IN (SELECT id FROM ids) AND lp.completed), 0)
          + COALESCE((SELECT SUM(xp_awarded) FROM practice_attempts WHERE student_id IN (SELECT id FROM ids) AND xp_awarded > 0), 0)) AS xp_total`,
      [studentId],
    );
    const row = res.rows[0] ?? {};
    const n = (k: string): number => Number(row[k] ?? 0);
    return {
      lessons_completed: n('lessons_completed'),
      assessments_passed: n('assessments_passed'),
      perfect_scores: n('perfect_scores'),
      streak_days: n('streak_days'),
      correct_answers: n('correct_answers'),
      speaking_practices: n('speaking_practices'),
      writing_practices: n('writing_practices'),
      mistakes_fixed: n('mistakes_fixed'),
      skills_mastered: n('skills_mastered'),
      courses_completed: n('courses_completed'),
      xp_total: n('xp_total'),
    };
  }
}
