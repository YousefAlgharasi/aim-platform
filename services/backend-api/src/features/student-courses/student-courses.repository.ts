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
  readonly quiz_count: string;
  readonly quizzes_passed: boolean;
  readonly exam_count: string;
  readonly exam_passed: boolean;
  readonly track_slug: string | null;
  readonly cefr_rank: number | null;
  readonly max_unlocked_cefr_rank: number | null;
}

@Injectable()
export class StudentCoursesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findCoursesWithProgress(studentId: string): Promise<StudentCourseRow[]> {
    const result = await this.db.query<StudentCourseRow>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       ),
       course_levels AS (
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
       ),
       level_state AS (
         SELECT sls.track_slug, sls.max_unlocked_cefr_rank
         FROM student_level_state sls
         WHERE sls.student_id = $1
            OR sls.student_id IN (SELECT profile_id FROM resolved_student)
            OR sls.student_id IN (SELECT user_id FROM resolved_student)
       )
       SELECT
         co.id AS course_id,
         co.title AS title,
         co.description AS description,
         co.sort_order AS sort_order,
         cl.level_code AS level_code,
         COUNT(DISTINCT clsn.lesson_id) AS lesson_count,
         COUNT(DISTINCT CASE WHEN lp.completed THEN clsn.lesson_id END) AS completed_lesson_count,
         (
           SELECT COUNT(*) FROM assessments a
           JOIN chapters ch ON ch.id = a.chapter_id
           JOIN levels lv2 ON lv2.id = ch.level_id
           WHERE lv2.course_id = co.id AND a.type = 'quiz' AND a.status = 'published'
         ) AS quiz_count,
         NOT EXISTS (
           SELECT 1 FROM assessments a
           JOIN chapters ch ON ch.id = a.chapter_id
           JOIN levels lv2 ON lv2.id = ch.level_id
           WHERE lv2.course_id = co.id AND a.type = 'quiz' AND a.status = 'published'
             AND NOT EXISTS (
               SELECT 1 FROM assessment_results ar
               WHERE ar.assessment_id = a.id AND (
                 ar.student_id = $1
                 OR ar.student_id IN (SELECT user_id FROM resolved_student)
                 OR ar.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
                 OR ar.student_id IN (SELECT profile_id FROM resolved_student)
               ) AND ar.passed = true
             )
         ) AS quizzes_passed,
         (
           SELECT COUNT(*) FROM assessments a
           LEFT JOIN chapters ch ON ch.id = a.chapter_id
           LEFT JOIN levels lv2 ON lv2.id = ch.level_id
           WHERE (a.course_id = co.id OR lv2.course_id = co.id) AND a.type = 'exam' AND a.status = 'published'
         ) AS exam_count,
         NOT EXISTS (
           SELECT 1 FROM assessments a
           LEFT JOIN chapters ch ON ch.id = a.chapter_id
           LEFT JOIN levels lv2 ON lv2.id = ch.level_id
           WHERE (a.course_id = co.id OR lv2.course_id = co.id) AND a.type = 'exam' AND a.status = 'published'
             AND NOT EXISTS (
               SELECT 1 FROM assessment_results ar
               WHERE ar.assessment_id = a.id AND (
                 ar.student_id = $1
                 OR ar.student_id IN (SELECT user_id FROM resolved_student)
                 OR ar.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
                 OR ar.student_id IN (SELECT profile_id FROM resolved_student)
               ) AND ar.passed = true
             )
         ) AS exam_passed,
         co.track_slug AS track_slug,
         co.cefr_rank AS cefr_rank,
         ls.max_unlocked_cefr_rank AS max_unlocked_cefr_rank
       FROM courses co
       LEFT JOIN course_levels cl ON cl.course_id = co.id
       LEFT JOIN course_lessons clsn ON clsn.course_id = co.id
       LEFT JOIN lesson_progress lp
         ON lp.lesson_id = clsn.lesson_id AND (
           lp.student_id = $1
           OR lp.student_id IN (SELECT user_id FROM resolved_student)
           OR lp.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
           OR lp.student_id IN (SELECT profile_id FROM resolved_student)
         )
       LEFT JOIN level_state ls ON (
         ls.track_slug = co.track_slug
         OR (ls.track_slug = 'english' AND (co.track_slug = 'general_english' OR co.track_slug IS NULL OR co.track_slug = 'english'))
         OR (ls.track_slug = 'general_english' AND (co.track_slug = 'english' OR co.track_slug IS NULL OR co.track_slug = 'general_english'))
       )
       WHERE co.status = 'published'
       GROUP BY co.id, co.title, co.description, co.sort_order, cl.level_code,
                co.track_slug, co.cefr_rank, ls.max_unlocked_cefr_rank
       ORDER BY co.cefr_rank ASC NULLS LAST, co.sort_order ASC, co.created_at ASC`,
      [studentId],
    );
    return result.rows;
  }

  /** Course id of the student's active enrollment, or null. */
  async findActiveEnrollmentCourseId(studentId: string): Promise<string | null> {
    const result = await this.db.query<{ course_id: string }>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, u.id AS user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT ce.course_id
       FROM course_enrollments ce
       WHERE ce.status = 'active'
         AND (
           ce.student_id = $1
           OR ce.student_id IN (SELECT user_id FROM resolved_student)
           OR ce.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
           OR ce.student_id IN (SELECT profile_id FROM resolved_student)
         )
       ORDER BY ce.created_at DESC
       LIMIT 1`,
      [studentId],
    );
    return result.rows[0]?.course_id ?? null;
  }
}
