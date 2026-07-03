// StudentChaptersRepository.
//
// Scope: Read-only aggregation of published chapter/lesson curriculum data
// under a single level, joined with a student's lesson_progress rows, for
// the mobile Chapter List screen. Never writes lesson_progress — that stays
// owned by LessonProgressService (features/lessons).
//
// Security rules:
//   - studentId always JWT-resolved by the caller — never trusted from a
//     client body.
//   - Only 'published' chapters/lessons are counted — matches the existing
//     GET /curriculum/chapters published-only contract.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface StudentChapterRow {
  readonly chapter_id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sort_order: number;
  readonly level_code: string | null;
  readonly lesson_count: string;
  readonly completed_lesson_count: string;
}

@Injectable()
export class StudentChaptersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findChaptersWithProgress(
    studentId: string,
    levelId: string,
  ): Promise<StudentChapterRow[]> {
    const result = await this.db.query<StudentChapterRow>(
      `WITH chapter_lessons AS (
         SELECT ch.id AS chapter_id, les.id AS lesson_id
         FROM chapters ch
         JOIN lessons les ON les.chapter_id = ch.id AND les.status = 'published'
         WHERE ch.level_id = $1 AND ch.status = 'published'
       )
       SELECT
         ch.id AS chapter_id,
         ch.title AS title,
         ch.description AS description,
         ch.sort_order AS sort_order,
         lv.code AS level_code,
         COUNT(DISTINCT cl.lesson_id) AS lesson_count,
         COUNT(DISTINCT CASE WHEN lp.completed THEN cl.lesson_id END) AS completed_lesson_count
       FROM chapters ch
       JOIN levels lv ON lv.id = ch.level_id
       LEFT JOIN chapter_lessons cl ON cl.chapter_id = ch.id
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = cl.lesson_id AND lp.student_id = $2
       WHERE ch.level_id = $1 AND ch.status = 'published'
       GROUP BY ch.id, ch.title, ch.description, ch.sort_order, lv.code
       ORDER BY ch.sort_order ASC, ch.created_at ASC`,
      [levelId, studentId],
    );
    return result.rows;
  }
}
