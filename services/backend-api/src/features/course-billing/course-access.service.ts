// CourseAccessService — decides whether a student may use a course.
//
// A course is open to a student when it is free (no price, or an effective
// price of 0), or when the student has a paid access window that is still
// running, or one they completed. Paid windows are created when an admin
// approves a payment and last `access_days` (30 by default) from approval.
//
// Windows are settled lazily whenever access is read:
// - finished (all lessons done, every quiz and final exam passed) before
//   expires_at → 'completed' (the course stays open);
// - expires_at passed without finishing → 'failed': the student's lesson
//   progress and assessment attempts in that course are deleted so the
//   retake starts from zero, and a new payment is required.

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import {
  CourseAccessRowStatus,
  CourseAccessState,
  CoursePriceRow,
  PaymentRequestStatus,
  StudentCourseBilling,
} from './course-billing.types';
import { quoteCoursePrice } from './course-pricing.util';

export const COURSE_PAYMENT_REQUIRED = 'COURSE_PAYMENT_REQUIRED';

const DAY_MS = 24 * 60 * 60 * 1000;

interface StudentIds {
  readonly userId: string;
  readonly forms: string[];
}

interface AccessRow {
  readonly id: string;
  readonly course_id: string;
  readonly status: CourseAccessRowStatus;
  readonly starts_at: Date;
  readonly expires_at: Date;
  readonly created_at: Date;
}

interface RequestRow {
  readonly id: string;
  readonly course_id: string;
  readonly status: PaymentRequestStatus;
  readonly admin_note: string | null;
  readonly created_at: Date;
}

interface CompletionRow {
  readonly lesson_count: string;
  readonly completed_lesson_count: string;
  readonly quizzes_passed: boolean;
  readonly exams_passed: boolean;
  readonly finished_at: Date | null;
}

/** Lessons of a course (published path only). */
const COURSE_LESSONS_SQL = `
  SELECT les.id
  FROM levels lv
  JOIN chapters ch ON ch.level_id = lv.id
  JOIN lessons les ON les.chapter_id = ch.id
  WHERE lv.course_id = $1`;

/** Assessments of a course: chapter quizzes and course/chapter exams. */
const COURSE_ASSESSMENTS_SQL = `
  SELECT a.id
  FROM assessments a
  LEFT JOIN chapters ch ON ch.id = a.chapter_id
  LEFT JOIN levels lv ON lv.id = ch.level_id
  WHERE a.course_id = $1 OR lv.course_id = $1`;

interface AdminAccessRow {
  readonly id: string;
  readonly student_id: string;
  readonly student_email: string | null;
  readonly student_name: string | null;
  readonly course_id: string;
  readonly course_title: string;
  readonly status: CourseAccessRowStatus;
  readonly starts_at: Date;
  readonly expires_at: Date;
  readonly completed_at: Date | null;
  readonly failed_at: Date | null;
}

export interface AdminAccessView {
  readonly id: string;
  readonly studentId: string;
  readonly studentEmail: string | null;
  readonly studentName: string | null;
  readonly courseId: string;
  readonly courseTitle: string;
  readonly status: CourseAccessRowStatus | 'expired';
  readonly startsAt: string;
  readonly expiresAt: string;
  readonly completedAt: string | null;
  readonly failedAt: string | null;
}

@Injectable()
export class CourseAccessService {
  private readonly logger = new Logger(CourseAccessService.name);

  constructor(private readonly db: DatabaseService) {}

  /** The student's users.id plus every id form progress tables may hold. */
  async resolveStudent(studentId: string): Promise<StudentIds> {
    const result = await this.db.query<{ user_id: string; supabase_auth_uid: string | null; profile_id: string | null }>(
      `SELECT u.id AS user_id, u.supabase_auth_uid::text AS supabase_auth_uid, sp.id AS profile_id
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id::text = $1 OR u.supabase_auth_uid::text = $1 OR sp.id::text = $1
       LIMIT 1`,
      [studentId],
    );
    const row = result.rows[0];
    if (!row) {
      return { userId: studentId, forms: [studentId] };
    }
    const forms = [row.user_id, row.supabase_auth_uid, row.profile_id, studentId].filter(
      (v, i, all): v is string => !!v && all.indexOf(v) === i,
    );
    return { userId: row.user_id, forms };
  }

  async getPriceRows(courseIds?: string[]): Promise<Map<string, CoursePriceRow>> {
    const result = courseIds
      ? await this.db.query<CoursePriceRow>(`SELECT * FROM course_prices WHERE course_id = ANY($1)`, [courseIds])
      : await this.db.query<CoursePriceRow>(`SELECT * FROM course_prices`);
    return new Map(result.rows.map((r) => [r.course_id, r]));
  }

  /** Billing (price quote + access) for each course, settling expired windows first. */
  async getBillingForCourses(studentId: string, courseIds: string[], now = new Date()): Promise<Map<string, StudentCourseBilling>> {
    const student = await this.resolveStudent(studentId);
    await this.settleWindows(student, now);

    const [prices, accessRes, requestRes] = await Promise.all([
      this.getPriceRows(courseIds),
      this.db.query<AccessRow>(
        `SELECT DISTINCT ON (course_id) id, course_id, status, starts_at, expires_at, created_at
         FROM course_access
         WHERE student_id = $1 AND course_id = ANY($2) AND status <> 'revoked'
         ORDER BY course_id, created_at DESC`,
        [student.userId, courseIds],
      ),
      this.db.query<RequestRow>(
        `SELECT DISTINCT ON (course_id) id, course_id, status, admin_note, created_at
         FROM course_payment_requests
         WHERE student_id = $1 AND course_id = ANY($2)
         ORDER BY course_id, created_at DESC`,
        [student.userId, courseIds],
      ),
    ]);
    const accessByCourse = new Map(accessRes.rows.map((r) => [r.course_id, r]));
    const requestByCourse = new Map(requestRes.rows.map((r) => [r.course_id, r]));

    const out = new Map<string, StudentCourseBilling>();
    for (const courseId of courseIds) {
      const price = quoteCoursePrice(prices.get(courseId), now);
      out.set(courseId, {
        courseId,
        price,
        access: this.composeAccess(price.isFree, accessByCourse.get(courseId), requestByCourse.get(courseId), now),
      });
    }
    return out;
  }

  async getBilling(studentId: string, courseId: string, now = new Date()): Promise<StudentCourseBilling> {
    const map = await this.getBillingForCourses(studentId, [courseId], now);
    return map.get(courseId)!;
  }

  private composeAccess(
    isFree: boolean,
    access: AccessRow | undefined,
    request: RequestRow | undefined,
    now: Date,
  ): CourseAccessState {
    const base = {
      startsAt: null,
      expiresAt: null,
      daysLeft: null,
      rejectionNote: null,
      pendingRequestId: null,
    };

    if (access?.status === 'active' && new Date(access.expires_at) > now) {
      const expires = new Date(access.expires_at);
      return {
        ...base,
        status: 'active',
        hasAccess: true,
        startsAt: new Date(access.starts_at).toISOString(),
        expiresAt: expires.toISOString(),
        daysLeft: Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / DAY_MS)),
      };
    }
    if (access?.status === 'completed') {
      return { ...base, status: 'completed', hasAccess: true, startsAt: new Date(access.starts_at).toISOString(), expiresAt: new Date(access.expires_at).toISOString() };
    }
    if (isFree) {
      return { ...base, status: 'free', hasAccess: true };
    }
    if (request?.status === 'pending') {
      return { ...base, status: 'pending', hasAccess: false, pendingRequestId: request.id };
    }
    const requestIsNewer = !!request && (!access || new Date(request.created_at) > new Date(access.created_at));
    if (request?.status === 'rejected' && requestIsNewer) {
      return { ...base, status: 'rejected', hasAccess: false, rejectionNote: request.admin_note };
    }
    if (access?.status === 'failed' || access?.status === 'active') {
      return { ...base, status: 'failed', hasAccess: false, expiresAt: new Date(access.expires_at).toISOString() };
    }
    return { ...base, status: 'none', hasAccess: false };
  }

  /** Throws COURSE_PAYMENT_REQUIRED (402) unless the student may use [courseId]. */
  async assertAccess(studentId: string, courseId: string | null): Promise<void> {
    if (!courseId) return;
    const billing = await this.getBilling(studentId, courseId);
    if (!billing.access.hasAccess) {
      throw new AppError({
        code: COURSE_PAYMENT_REQUIRED,
        message:
          billing.access.status === 'failed'
            ? 'Your time for this course ended. Pay again to retake it.'
            : 'This course needs to be purchased before you can continue.',
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        details: { courseId, status: billing.access.status },
      });
    }
  }

  async courseIdForLevel(levelId: string): Promise<string | null> {
    const r = await this.db.query<{ course_id: string }>(`SELECT course_id FROM levels WHERE id::text = $1`, [levelId]);
    return r.rows[0]?.course_id ?? null;
  }

  async courseIdForChapter(chapterId: string): Promise<string | null> {
    const r = await this.db.query<{ course_id: string }>(
      `SELECT lv.course_id FROM chapters ch JOIN levels lv ON lv.id = ch.level_id WHERE ch.id::text = $1`,
      [chapterId],
    );
    return r.rows[0]?.course_id ?? null;
  }

  async courseIdForLesson(lessonId: string): Promise<string | null> {
    const r = await this.db.query<{ course_id: string }>(
      `SELECT lv.course_id FROM lessons les
       JOIN chapters ch ON ch.id = les.chapter_id
       JOIN levels lv ON lv.id = ch.level_id
       WHERE les.id::text = $1`,
      [lessonId],
    );
    return r.rows[0]?.course_id ?? null;
  }

  async courseIdForAssessment(assessmentId: string): Promise<string | null> {
    const r = await this.db.query<{ course_id: string | null }>(
      `SELECT COALESCE(a.course_id, lv.course_id) AS course_id
       FROM assessments a
       LEFT JOIN chapters ch ON ch.id = a.chapter_id
       LEFT JOIN levels lv ON lv.id = ch.level_id
       WHERE a.id::text = $1`,
      [assessmentId],
    );
    return r.rows[0]?.course_id ?? null;
  }

  /** Paid access windows for the admin dashboard, newest first. */
  async listForAdmin(status?: string): Promise<AdminAccessView[]> {
    const valid = ['active', 'completed', 'failed', 'revoked'];
    const filter = status && valid.includes(status) ? status : null;
    const result = await this.db.query<AdminAccessRow>(
      `SELECT ca.id, ca.student_id, u.email AS student_email, sp.display_name AS student_name,
              ca.course_id, co.title AS course_title, ca.status, ca.starts_at, ca.expires_at,
              ca.completed_at, ca.failed_at
       FROM course_access ca
       JOIN users u ON u.id = ca.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = ca.student_id
       JOIN courses co ON co.id = ca.course_id
       WHERE ($1::text IS NULL OR ca.status = $1)
       ORDER BY ca.created_at DESC
       LIMIT 500`,
      [filter],
    );
    const now = Date.now();
    return result.rows.map((r) => {
      const expires = new Date(r.expires_at);
      // Windows past their deadline are settled the next time the student
      // is seen; show them as expired here rather than active.
      const status = r.status === 'active' && expires.getTime() <= now ? 'expired' : r.status;
      return {
        id: r.id,
        studentId: r.student_id,
        studentEmail: r.student_email,
        studentName: r.student_name,
        courseId: r.course_id,
        courseTitle: r.course_title,
        status,
        startsAt: new Date(r.starts_at).toISOString(),
        expiresAt: expires.toISOString(),
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : null,
        failedAt: r.failed_at ? new Date(r.failed_at).toISOString() : null,
      };
    });
  }

  /** Grants a fresh access window (called when an admin approves a payment). */
  async grantAccess(
    userId: string,
    courseId: string,
    accessDays: number,
    paymentRequestId: string | null,
    now = new Date(),
  ): Promise<void> {
    // Any leftover active window (shouldn't normally exist) is closed first.
    await this.db.query(
      `UPDATE course_access SET status = 'revoked' WHERE student_id = $1 AND course_id = $2 AND status = 'active'`,
      [userId, courseId],
    );
    await this.db.query(
      `INSERT INTO course_access (student_id, course_id, payment_request_id, status, starts_at, expires_at)
       VALUES ($1, $2, $3, 'active', $4, $5)`,
      [userId, courseId, paymentRequestId, now, new Date(now.getTime() + accessDays * DAY_MS)],
    );
  }

  /** Settles every active window of the student (completed / failed). */
  async settleWindows(student: StudentIds, now = new Date()): Promise<void> {
    const active = await this.db.query<AccessRow>(
      `SELECT id, course_id, status, starts_at, expires_at, created_at
       FROM course_access WHERE student_id = $1 AND status = 'active'`,
      [student.userId],
    );
    for (const window of active.rows) {
      const completion = await this.courseCompletion(student, window.course_id);
      const expires = new Date(window.expires_at);
      if (completion.done && completion.finishedAt && completion.finishedAt <= expires) {
        await this.db.query(
          `UPDATE course_access SET status = 'completed', completed_at = $2 WHERE id = $1 AND status = 'active'`,
          [window.id, completion.finishedAt],
        );
      } else if (now >= expires) {
        await this.failWindow(student, window, now);
      }
    }
  }

  private async failWindow(student: StudentIds, window: AccessRow, now: Date): Promise<void> {
    const updated = await this.db.query(
      `UPDATE course_access SET status = 'failed', failed_at = $2 WHERE id = $1 AND status = 'active'`,
      [window.id, now],
    );
    if (!updated.rowCount) return; // settled concurrently
    await this.db.query(
      `DELETE FROM lesson_progress
       WHERE student_id::text = ANY($2) AND lesson_id IN (${COURSE_LESSONS_SQL})`,
      [window.course_id, student.forms],
    );
    await this.db.query(
      `DELETE FROM assessment_attempts
       WHERE student_id::text = ANY($2) AND assessment_id IN (${COURSE_ASSESSMENTS_SQL})`,
      [window.course_id, student.forms],
    );
    this.logger.log(`Course access ${window.id} expired unfinished; progress reset for course ${window.course_id}`);
  }

  async courseCompletion(student: StudentIds, courseId: string): Promise<{ done: boolean; finishedAt: Date | null }> {
    const result = await this.db.query<CompletionRow>(
      `WITH lessons_in_course AS (
         SELECT les.id
         FROM levels lv
         JOIN chapters ch ON ch.level_id = lv.id AND ch.status = 'published'
         JOIN lessons les ON les.chapter_id = ch.id AND les.status = 'published'
         WHERE lv.course_id = $1 AND lv.status = 'published'
       ),
       assessments_in_course AS (
         SELECT a.id, a.type
         FROM assessments a
         LEFT JOIN chapters ch ON ch.id = a.chapter_id
         LEFT JOIN levels lv ON lv.id = ch.level_id
         WHERE (a.course_id = $1 OR lv.course_id = $1) AND a.status = 'published'
       ),
       passes AS (
         SELECT ar.assessment_id, MIN(ar.graded_at) AS first_pass
         FROM assessment_results ar
         WHERE ar.passed = true AND ar.student_id::text = ANY($2)
           AND ar.assessment_id IN (SELECT id FROM assessments_in_course)
         GROUP BY ar.assessment_id
       ),
       done_lessons AS (
         SELECT lp.lesson_id, MIN(COALESCE(lp.completed_at, lp.updated_at)) AS completed_at
         FROM lesson_progress lp
         WHERE lp.completed = true AND lp.student_id::text = ANY($2)
           AND lp.lesson_id IN (SELECT id FROM lessons_in_course)
         GROUP BY lp.lesson_id
       )
       SELECT
         (SELECT COUNT(*) FROM lessons_in_course) AS lesson_count,
         (SELECT COUNT(*) FROM done_lessons) AS completed_lesson_count,
         NOT EXISTS (SELECT 1 FROM assessments_in_course a WHERE a.type = 'quiz'
                     AND a.id NOT IN (SELECT assessment_id FROM passes)) AS quizzes_passed,
         NOT EXISTS (SELECT 1 FROM assessments_in_course a WHERE a.type = 'exam'
                     AND a.id NOT IN (SELECT assessment_id FROM passes)) AS exams_passed,
         GREATEST(
           (SELECT MAX(completed_at) FROM done_lessons),
           (SELECT MAX(first_pass) FROM passes)
         ) AS finished_at`,
      [courseId, student.forms],
    );
    const row = result.rows[0];
    const lessons = Number(row.lesson_count);
    const done =
      lessons > 0 && Number(row.completed_lesson_count) >= lessons && row.quizzes_passed && row.exams_passed;
    return { done, finishedAt: row.finished_at ? new Date(row.finished_at) : null };
  }
}
