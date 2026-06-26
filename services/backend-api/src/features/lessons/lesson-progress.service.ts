// LessonProgressService.
//
// Scope: Backend-owned per-student lesson progress tracking only.
//
// Security rules:
//   - studentId always JWT-resolved by the caller — never trusted from a
//     client body.
//   - percent is clamped to 0-100 server-side.
//   - completed is only ever set TRUE via markComplete; recordProgress can
//     never set it.

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  LessonProgressAckResponse,
  RecordLessonProgressInput,
} from './lesson-progress.types';

interface LessonProgressRow {
  readonly lesson_id: string;
  readonly percent: number;
  readonly completed: boolean;
  readonly updated_at: string;
}

interface LessonRow {
  readonly id: string;
}

@Injectable()
export class LessonProgressService {
  constructor(private readonly db: DatabaseService) {}

  async recordProgress(input: RecordLessonProgressInput): Promise<LessonProgressAckResponse> {
    await this.assertLessonExists(input.lessonId);

    const safePercent = Math.min(Math.max(Math.round(input.percent), 0), 100);

    const result = await this.db.query<LessonProgressRow>(
      `INSERT INTO lesson_progress (student_id, lesson_id, percent, last_active_at)
            VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, lesson_id)
         DO UPDATE SET
            percent = GREATEST(lesson_progress.percent, EXCLUDED.percent),
            last_active_at = NOW(),
            updated_at = NOW()
       RETURNING lesson_id, percent, completed, updated_at`,
      [input.studentId, input.lessonId, safePercent],
    );

    return this.toAck(result.rows[0]);
  }

  async markComplete(studentId: string, lessonId: string): Promise<LessonProgressAckResponse> {
    await this.assertLessonExists(lessonId);

    const result = await this.db.query<LessonProgressRow>(
      `INSERT INTO lesson_progress (student_id, lesson_id, percent, completed, completed_at, last_active_at)
            VALUES ($1, $2, 100, TRUE, NOW(), NOW())
       ON CONFLICT (student_id, lesson_id)
         DO UPDATE SET
            percent = 100,
            completed = TRUE,
            completed_at = COALESCE(lesson_progress.completed_at, NOW()),
            last_active_at = NOW(),
            updated_at = NOW()
       RETURNING lesson_id, percent, completed, updated_at`,
      [studentId, lessonId],
    );

    return this.toAck(result.rows[0]);
  }

  private async assertLessonExists(lessonId: string): Promise<void> {
    const result = await this.db.query<LessonRow>(
      `SELECT id FROM lessons WHERE id = $1`,
      [lessonId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Lesson not found');
    }
  }

  private toAck(row: LessonProgressRow): LessonProgressAckResponse {
    return {
      lessonId: row.lesson_id,
      percent: row.percent,
      completed: row.completed,
      updatedAt: row.updated_at,
    };
  }
}
