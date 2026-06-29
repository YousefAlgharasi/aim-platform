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
      `SELECT DISTINCT (last_active_at AT TIME ZONE 'UTC')::date::text AS active_date
       FROM lesson_progress
       WHERE student_id = $1
       ORDER BY active_date DESC
       LIMIT $2`,
      [studentId, limit],
    );
    return result.rows.map((row) => row.active_date);
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
}
