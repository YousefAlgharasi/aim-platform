// CertificateService.
//
// Scope: Issues and reads course-completion certificates for students.
//
// Backend authority rules:
// - Course completion is decided exclusively by CourseCompletionService
//   (every published lesson in the course completed for that student).
//   This service never recomputes or overrides that.
// - A certificate is issued at most once per (student, course) — see the
//   certificates_student_course_unique constraint. Issuing is idempotent:
//   calling issueIfCompleted again after a certificate already exists just
//   returns the existing one.
// - score_snapshot is captured once, at issuance — it is a record of what
//   the student had achieved at that point, not a live view. Admins see the
//   student's current scores separately (assessment results are still
//   readable live); this snapshot is specifically for the certificate.

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { courseTextSql } from '../../common/locale/course-text.sql';
import { DEFAULT_LOCALE, SupportedLocale } from '../../common/locale/locale.constants';
import { CourseCompletionService } from '../lessons/course-completion.service';
import { Certificate, CertificateScoreSnapshotEntry } from './certificate.types';
import {
  bestResultPerAssessment, computeCourse1000PointBreakdown, computeCourseScorePercent, toScorePercent,
} from './course-score.util';

interface CertificateRow {
  id: string;
  student_id: string;
  course_id: string;
  course_title: string;
  display_name: string | null;
  email: string | null;
  issued_at: string;
  score_snapshot: unknown;
}

interface AssessmentResultRow {
  assessment_id: string;
  title: string;
  type: string;
  score: string;
  max_score: string;
  passed: boolean;
}

// Snapshots written before version 2 stored a practice accuracy that was
// always 100% (see toCertificate).
const SNAPSHOT_SCORING_VERSION = 2;

// Public base URL printed on certificates for verification links.
const CERTIFICATE_VERIFY_BASE_URL = (
  process.env.CERTIFICATE_VERIFY_BASE_URL ?? 'https://aim-platform-gswy.onrender.com'
).replace(/\/+$/, '');

@Injectable()
export class CertificateService {
  constructor(
    private readonly db: DatabaseService,
    private readonly courseCompletion: CourseCompletionService,
  ) {}

  /**
   * Every assessment result belonging to this course for this student — a
   * course-level final exam (assessments.course_id = courseId) or a
   * chapter-gated quiz within one of the course's chapters
   * (assessments.chapter_id -> chapters -> levels.course_id = courseId).
   */
  async getCourseAssessmentResults(
    studentId: string,
    courseId: string,
  ): Promise<CertificateScoreSnapshotEntry[]> {
    const result = await this.db.query<AssessmentResultRow & { is_final_exam: boolean }>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT ar.assessment_id, a.title, a.type, ar.score, ar.max_score, ar.passed,
              (a.course_id = $2 AND a.chapter_id IS NULL) AS is_final_exam
       FROM assessment_results ar
       JOIN assessments a ON a.id = ar.assessment_id
       WHERE (
           ar.student_id = $1
           OR ar.student_id IN (SELECT profile_id FROM resolved_student)
           OR ar.student_id IN (SELECT user_id FROM resolved_student)
           OR ar.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
         )
         AND (
           a.course_id = $2
           OR a.chapter_id IN (
             SELECT c.id FROM chapters c
             JOIN levels lv ON lv.id = c.level_id
             WHERE lv.course_id = $2
           )
         )
       ORDER BY ar.created_at ASC`,
      [studentId, courseId],
    );

    return result.rows.map((r) => {
      const score = Number(r.score);
      const maxScore = Number(r.max_score);
      return {
        assessmentId: r.assessment_id,
        title: r.title,
        type: r.type === 'exam' ? 'exam' : 'quiz',
        isFinalExam: r.is_final_exam ?? false,
        score,
        maxScore,
        scorePercent: toScorePercent(score, maxScore),
        passed: r.passed,
      };
    });
  }

  /**
   * The student's accuracy across lesson practice in this course, as a
   * 0-100 percent, or null when they have no practice attempts here.
   *
   * Practice attempts store the question id as item_id, so they're scoped to
   * the course through the questions its lessons practice (lesson_skills ->
   * question_skills — the same link SessionQuestionsService uses to serve
   * them). Quiz/exam answers bridged into AIM are recorded as
   * 'practice_question' and are excluded so they aren't counted twice.
   */
  async getCoursePracticeAccuracy(studentId: string, courseId: string): Promise<number | null> {
    const result = await this.db.query<{ total: string; correct: string }>(
      `WITH course_questions AS (
         SELECT DISTINCT qs.question_id
         FROM lessons l
         JOIN chapters c ON c.id = l.chapter_id
         JOIN levels lv ON lv.id = c.level_id
         JOIN lesson_skills ls ON ls.lesson_id = l.id
         JOIN question_skills qs ON qs.skill_id = ls.skill_id
         WHERE lv.course_id = $2
       ),
       resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE la.is_correct = true) AS correct
       FROM lesson_attempts la
       WHERE la.item_type = 'lesson_question'
         AND la.item_id IN (SELECT question_id FROM course_questions)
         AND (
           la.student_id = $1
           OR la.student_id IN (SELECT profile_id FROM resolved_student)
           OR la.student_id IN (SELECT user_id FROM resolved_student)
           OR la.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
         )`,
      [studentId, courseId],
    );

    const total = Number(result.rows[0]?.total ?? 0);
    const correct = Number(result.rows[0]?.correct ?? 0);
    if (total === 0) return null;
    return Math.round((correct / total) * 100);
  }

  async getForStudentAndCourse(studentId: string, courseId: string): Promise<Certificate | null> {
    const result = await this.db.query<CertificateRow>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT cert.id, cert.student_id, cert.course_id, co.title AS course_title,
              COALESCE(sp.display_name, u.email) AS display_name,
              u.email, cert.issued_at, cert.score_snapshot
       FROM certificates cert
       JOIN courses co ON co.id = cert.course_id
       LEFT JOIN users u ON u.id = cert.student_id OR u.supabase_auth_uid = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id OR sp.id = cert.student_id
       WHERE (
         cert.student_id = $1
         OR cert.student_id IN (SELECT profile_id FROM resolved_student)
         OR cert.student_id IN (SELECT user_id FROM resolved_student)
         OR cert.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
       ) AND cert.course_id = $2
       LIMIT 1`,
      [studentId, courseId],
    );
    const row = result.rows[0];
    return row ? this.toCertificate(row) : null;
  }

  async getById(id: string, locale: SupportedLocale = DEFAULT_LOCALE): Promise<Certificate | null> {
    const text = courseTextSql('co', '$2');
    const result = await this.db.query<CertificateRow>(
      `SELECT cert.id, cert.student_id, cert.course_id, ${text.title} AS course_title,
              COALESCE(sp.display_name, u.email) AS display_name,
              u.email, cert.issued_at, cert.score_snapshot
       FROM certificates cert
       JOIN courses co ON co.id = cert.course_id
       ${text.joins}
       LEFT JOIN users u ON u.id = cert.student_id OR u.supabase_auth_uid = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id OR sp.id = cert.student_id
       WHERE cert.id = $1
       LIMIT 1`,
      [id, locale],
    );
    const row = result.rows[0];
    return row ? this.toCertificate(row) : null;
  }

  /**
   * List all certificates for a student. Automatically checks completed courses
   * and issues certificates for any completed course that doesn't have one yet.
   */
  async listForStudent(studentId: string, locale: SupportedLocale = DEFAULT_LOCALE): Promise<Certificate[]> {
    const completedCourses = await this.db.query<{ course_id: string }>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       ),
       course_lessons AS (
         SELECT co.id AS course_id, les.id AS lesson_id
         FROM courses co
         JOIN levels lv ON lv.course_id = co.id AND lv.status = 'published'
         JOIN chapters ch ON ch.level_id = lv.id AND ch.status = 'published'
         JOIN lessons les ON les.chapter_id = ch.id AND les.status = 'published'
       )
       SELECT co.id AS course_id
       FROM courses co
       JOIN course_lessons clsn ON clsn.course_id = co.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = clsn.lesson_id AND (
         lp.student_id = $1
         OR lp.student_id IN (SELECT profile_id FROM resolved_student)
         OR lp.student_id IN (SELECT user_id FROM resolved_student)
         OR lp.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
       ) AND lp.completed = true
       GROUP BY co.id
       HAVING COUNT(DISTINCT clsn.lesson_id) > 0 AND COUNT(DISTINCT lp.lesson_id) = COUNT(DISTINCT clsn.lesson_id)`,
      [studentId],
    );

    for (const row of completedCourses.rows) {
      await this.issueIfCompleted(studentId, row.course_id);
    }

    const text = courseTextSql('co', '$2');
    const result = await this.db.query<CertificateRow>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $1 OR u.supabase_auth_uid = $1 OR sp.id = $1
         LIMIT 1
       )
       SELECT cert.id, cert.student_id, cert.course_id, ${text.title} AS course_title,
              COALESCE(sp.display_name, u.email) AS display_name,
              u.email, cert.issued_at, cert.score_snapshot
       FROM certificates cert
       JOIN courses co ON co.id = cert.course_id
       ${text.joins}
       LEFT JOIN users u ON u.id = cert.student_id OR u.supabase_auth_uid = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id OR sp.id = cert.student_id
       WHERE cert.student_id = $1
          OR cert.student_id IN (SELECT profile_id FROM resolved_student)
          OR cert.student_id IN (SELECT user_id FROM resolved_student)
          OR cert.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
       ORDER BY cert.issued_at DESC`,
      [studentId, locale],
    );

    return Promise.all(result.rows.map((r) => this.toCertificate(r)));
  }

  /**
   * Issues a certificate the first time a course is found complete. Safe to
   * call repeatedly (e.g. every time the admin profile page loads) — a
   * no-op once a certificate already exists, and returns null if the course
   * still isn't complete.
   */
  async issueIfCompleted(studentId: string, courseId: string): Promise<Certificate | null> {
    const existing = await this.getForStudentAndCourse(studentId, courseId);
    if (existing) return existing;

    const complete = await this.courseCompletion.isCourseComplete(studentId, courseId);
    if (!complete) return null;

    const snapshot = bestResultPerAssessment(await this.getCourseAssessmentResults(studentId, courseId));
    const practiceAccuracy = await this.getCoursePracticeAccuracy(studentId, courseId);
    const breakdown = computeCourse1000PointBreakdown(snapshot, practiceAccuracy);

    const fullSnapshot = {
      scoringVersion: SNAPSHOT_SCORING_VERSION,
      assessments: snapshot,
      breakdown,
      practiceAccuracy,
    };

    await this.db.query(
      `INSERT INTO certificates (student_id, course_id, score_snapshot)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentId, courseId, JSON.stringify(fullSnapshot)],
    );

    return this.getForStudentAndCourse(studentId, courseId);
  }

  async verifyOwnership(certificateId: string, studentId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `WITH resolved_student AS (
         SELECT sp.id AS profile_id, sp.user_id, u.supabase_auth_uid
         FROM users u
         LEFT JOIN student_profiles sp ON sp.user_id = u.id
         WHERE u.id = $2 OR u.supabase_auth_uid = $2 OR sp.id = $2
         LIMIT 1
       )
       SELECT cert.id
       FROM certificates cert
       WHERE cert.id = $1
         AND (
           cert.student_id = $2
           OR cert.student_id IN (SELECT profile_id FROM resolved_student)
           OR cert.student_id IN (SELECT user_id FROM resolved_student)
           OR cert.student_id IN (SELECT supabase_auth_uid FROM resolved_student)
         )
       LIMIT 1`,
      [certificateId, studentId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  private async toCertificate(row: CertificateRow): Promise<Certificate> {
    let assessments: CertificateScoreSnapshotEntry[] = [];
    let practiceAccuracy: number | null = null;

    if (row.score_snapshot && typeof row.score_snapshot === 'object') {
      if (Array.isArray(row.score_snapshot)) {
        assessments = row.score_snapshot as CertificateScoreSnapshotEntry[];
        practiceAccuracy = await this.getCoursePracticeAccuracy(row.student_id, row.course_id);
      } else {
        const obj = row.score_snapshot as {
          scoringVersion?: number;
          assessments?: CertificateScoreSnapshotEntry[];
          practiceAccuracy?: number | null;
        };
        assessments = obj.assessments ?? [];
        if ((obj.scoringVersion ?? 1) >= SNAPSHOT_SCORING_VERSION) {
          practiceAccuracy = typeof obj.practiceAccuracy === 'number' ? obj.practiceAccuracy : null;
        } else {
          // Version-1 snapshots always stored 100% practice: the old query
          // never matched any attempt. Use the real accuracy instead.
          practiceAccuracy = await this.getCoursePracticeAccuracy(row.student_id, row.course_id);
        }
      }
    } else {
      practiceAccuracy = await this.getCoursePracticeAccuracy(row.student_id, row.course_id);
    }

    assessments = bestResultPerAssessment(assessments);
    const breakdown = computeCourse1000PointBreakdown(assessments, practiceAccuracy);

    return {
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      courseTitle: row.course_title,
      studentName: row.display_name ?? row.email ?? null,
      issuedAt: row.issued_at,
      scoreSnapshot: assessments,
      breakdown,
      totalPoints: breakdown.totalPoints,
      overallScorePercent: breakdown.overallPercent,
      verificationUrl: `${CERTIFICATE_VERIFY_BASE_URL}/certificates/${row.id}/verify`,
    };
  }
}
