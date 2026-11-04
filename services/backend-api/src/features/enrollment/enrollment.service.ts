// EnrollmentService.
//
// Scope: "Which course is this student currently enrolled in" only.
//
// Responsibility:
//   Backend-owned course_enrollments table — the only place a student's
//   current/active course is recorded. Before this existed there was no
//   explicit "start a course" action and no single source of truth for
//   "what course am I in"; lesson_progress rows only ever existed once a
//   student had already opened a specific lesson.
//
// Backend authority rules enforced here:
//   - student_id is always sourced from the verified JWT by the caller —
//     never accepted as a raw client payload field by this service.
//   - courseId must reference an existing, published course; a locked or
//     unpublished course is rejected with NOT_FOUND rather than silently
//     enrolling the student in something they can't see.
//   - A student has at most one active enrollment at a time (also enforced
//     at the DB layer by a partial unique index). Enrolling in a new course
//     transitions the previous active enrollment to 'switched' — enrollment
//     history is preserved, never deleted.
//   - No AIM Engine, mastery, difficulty, or skill-map logic here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { SupportedLocale } from '../../common/locale/locale.constants';
import { courseTextSql } from '../../common/locale/course-text.sql';
import { CurrentEnrollmentResponse, EnrollResponse, EnrollmentRow } from './enrollment.types';

interface CourseRow {
  readonly id: string;
  readonly title: string;
  readonly locale: string;
}

@Injectable()
export class EnrollmentService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Enroll the student in [courseId], making it their active course.
   *
   * Steps:
   *   1. Verify the course exists and is published.
   *   2. Transition any existing active enrollment to 'switched'.
   *   3. Insert a new active enrollment row.
   *
   * Idempotent: enrolling in the course that's already active returns the
   * existing enrollment rather than creating a duplicate switch/insert pair.
   */
  async enroll(studentId: string, courseId: string, locale: SupportedLocale = 'en'): Promise<EnrollResponse> {
    const text = courseTextSql('co', '$2');
    const courseResult = await this.db.query<CourseRow>(
      `SELECT co.id, ${text.title} AS title, ${text.locale} AS locale
       FROM courses co
       ${text.joins}
       WHERE co.id = $1 AND co.status = 'published' LIMIT 1`,
      [courseId, locale],
    );
    const course = courseResult.rows[0];
    if (!course) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Course not found: ${courseId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const currentResult = await this.db.query<{ course_id: string }>(
      `SELECT course_id FROM course_enrollments WHERE student_id = $1 AND status = 'active' LIMIT 1`,
      [studentId],
    );
    const current = currentResult.rows[0];

    if (current?.course_id === courseId) {
      const existing = await this.db.query<EnrollmentRow>(
        `SELECT ce.id, ce.course_id, ${text.title} AS course_title, ${text.locale} AS course_locale, ce.enrolled_at
         FROM course_enrollments ce
         JOIN courses co ON co.id = ce.course_id
         ${text.joins}
         WHERE ce.student_id = $1 AND ce.status = 'active'
         LIMIT 1`,
        [studentId, locale],
      );
      const row = existing.rows[0];
      return {
        courseId: row.course_id,
        courseTitle: row.course_title,
        locale: row.course_locale,
        enrolledAt: row.enrolled_at,
      };
    }

    if (current) {
      await this.db.query(
        `UPDATE course_enrollments
         SET status = 'switched', updated_at = now()
         WHERE student_id = $1 AND status = 'active'`,
        [studentId],
      );
    }

    const insertResult = await this.db.query<{ enrolled_at: string }>(
      `INSERT INTO course_enrollments (student_id, course_id, status)
       VALUES ($1, $2, 'active')
       RETURNING enrolled_at`,
      [studentId, courseId],
    );

    return {
      courseId: course.id,
      courseTitle: course.title,
      locale: course.locale,
      enrolledAt: insertResult.rows[0].enrolled_at,
    };
  }

  /** Return the student's current active enrollment, or found: false. */
  async getCurrentEnrollment(studentId: string, locale: SupportedLocale = 'en'): Promise<CurrentEnrollmentResponse> {
    const text = courseTextSql('co', '$2');
    const result = await this.db.query<EnrollmentRow>(
      `SELECT ce.id, ce.course_id, ${text.title} AS course_title, ${text.locale} AS course_locale, ce.enrolled_at
       FROM course_enrollments ce
       JOIN courses co ON co.id = ce.course_id
       ${text.joins}
       WHERE ce.student_id = $1 AND ce.status = 'active'
       LIMIT 1`,
      [studentId, locale],
    );
    const row = result.rows[0];

    if (!row) {
      return { found: false, courseId: null, courseTitle: null, locale: null, enrolledAt: null };
    }

    return {
      found: true,
      courseId: row.course_id,
      courseTitle: row.course_title,
      locale: row.course_locale,
      enrolledAt: row.enrolled_at,
    };
  }
}
