// StudentCoursesRepository.
//
// Scope: Read-only aggregation of published course/level/lesson curriculum
// data joined with a student's lesson_progress rows, for the mobile
// Courses screen. Never writes lesson_progress — that stays owned by
// LessonProgressService (features/lessons).
//
// Security rules:
//   - studentId always JWT-resolved by the caller — never trusted from a
//     client body.
//   - Only 'published' courses/levels/chapters/lessons are counted —
//     matches the existing GET /curriculum/courses published-only
//     contract.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

interface StudentCourseRow {
  readonly course_id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sort_order: number;
  readonly level_code: string | null;
  readonly lesson_count: string;
  readonly completed_lesson_count: string;
}

@Injectable()
export class StudentCoursesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findCoursesWithProgress(studentId: string): Promise<StudentCourseRow[]> {
    const result = await this.db.query<StudentCourseRow>(
      `WITH course_levels AS (
         SELECT DISTINCT ON (course_id) course_id, code AS level_code
         FROM levels
         WHERE status = 'published'
         ORDER BY course_id, sort_order ASC
       ),
       course_lessons AS (
         SELECT co.id AS course_id, les.id AS lesson_id
         FROM courses co
         JOIN levels lv ON lv.course_id = co.id AND lv.status = 'published'
         JOIN chapters ch ON ch.level_id = lv.id AND ch.status = 'published'
         JOIN lessons les ON les.chapter_id = ch.id AND les.status = 'published'
       )
       SELECT
         co.id AS course_id,
         co.title AS title,
         co.description AS description,
         co.sort_order AS sort_order,
         cl.level_code AS level_code,
         COUNT(DISTINCT clsn.lesson_id) AS lesson_count,
         COUNT(DISTINCT CASE WHEN lp.completed THEN clsn.lesson_id END) AS completed_lesson_count
       FROM courses co
       LEFT JOIN course_levels cl ON cl.course_id = co.id
       LEFT JOIN course_lessons clsn ON clsn.course_id = co.id
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = clsn.lesson_id AND lp.student_id = $1
       WHERE co.status = 'published'
       GROUP BY co.id, co.title, co.description, co.sort_order, cl.level_code
       ORDER BY co.sort_order ASC, co.created_at ASC`,
      [studentId],
    );
    return result.rows;
  }
}
