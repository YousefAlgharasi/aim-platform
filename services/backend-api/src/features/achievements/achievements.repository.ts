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

interface AchievementDefinitionRow {
  readonly id: string;
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: string;
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
      `SELECT id, key, title, description, icon, category
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
}
