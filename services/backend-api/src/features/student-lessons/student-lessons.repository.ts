// StudentLessonsRepository.
//
// Scope: Read-only aggregation of published lesson curriculum data under a
// single chapter, joined with a student's lesson_progress row, for the
// mobile Lesson List screen. Never writes lesson_progress — that stays
// owned by LessonProgressService (features/lessons).
//
// Security rules:
//   - studentId always JWT-resolved by the caller — never trusted from a
//     client body.
//   - Only 'published' lessons are counted — matches the existing
//     GET /curriculum/lessons published-only contract.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface StudentLessonRow {
  readonly lesson_id: string;
  readonly title: string;
  readonly description: string;
  readonly xp_value: number;
  readonly sort_order: number;
  readonly completed: boolean;
}

export interface ChapterQuizRow {
  readonly assessment_id: string;
  readonly title: string;
}

@Injectable()
export class StudentLessonsRepository {
  constructor(private readonly db: DatabaseService) {}

  async findLessonsWithProgress(studentId: string, chapterId: string): Promise<StudentLessonRow[]> {
    const result = await this.db.query<StudentLessonRow>(
      `SELECT
         l.id AS lesson_id,
         l.title AS title,
         l.description AS description,
         l.xp_value AS xp_value,
         l.sort_order AS sort_order,
         COALESCE(lp.completed, false) AS completed
       FROM lessons l
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = l.id AND lp.student_id = $2
       WHERE l.chapter_id = $1 AND l.status = 'published'
       ORDER BY l.sort_order ASC, l.created_at ASC`,
      [chapterId, studentId],
    );
    return result.rows;
  }

  /** The published quiz assessment linked to this chapter (assessments.chapter_id), or null. */
  async findQuizForChapter(chapterId: string): Promise<ChapterQuizRow | null> {
    const result = await this.db.query<ChapterQuizRow>(
      `SELECT id AS assessment_id, title
       FROM assessments
       WHERE chapter_id = $1 AND type = 'quiz' AND status = 'published'
       LIMIT 1`,
      [chapterId],
    );
    return result.rows[0] ?? null;
  }

  /** True when the student has a passing assessment_results row for this assessment. */
  async hasPassingResult(studentId: string, assessmentId: string): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM assessment_results
         WHERE assessment_id = $1 AND student_id = $2 AND passed = true
       ) AS exists`,
      [assessmentId, studentId],
    );
    return result.rows[0]?.exists ?? false;
  }
}
