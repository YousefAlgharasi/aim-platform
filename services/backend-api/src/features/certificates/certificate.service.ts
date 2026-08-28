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
import { CourseCompletionService } from '../lessons/course-completion.service';
import { Certificate, CertificateScoreSnapshotEntry } from './certificate.types';
import { computeCourseScorePercent, toScorePercent } from './course-score.util';

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
    const result = await this.db.query<AssessmentResultRow>(
      `SELECT ar.assessment_id, a.title, a.type, ar.score, ar.max_score, ar.passed
       FROM assessment_results ar
       JOIN assessments a ON a.id = ar.assessment_id
       WHERE ar.student_id = $1
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
        score,
        maxScore,
        scorePercent: toScorePercent(score, maxScore),
        passed: r.passed,
      };
    });
  }

  async getForStudentAndCourse(studentId: string, courseId: string): Promise<Certificate | null> {
    const result = await this.db.query<CertificateRow>(
      `SELECT cert.id, cert.student_id, cert.course_id, co.title AS course_title,
              sp.display_name, u.email, cert.issued_at, cert.score_snapshot
       FROM certificates cert
       JOIN courses co ON co.id = cert.course_id
       LEFT JOIN users u ON u.id = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE cert.student_id = $1 AND cert.course_id = $2
       LIMIT 1`,
      [studentId, courseId],
    );
    const row = result.rows[0];
    return row ? this.toCertificate(row) : null;
  }

  async getById(id: string): Promise<Certificate | null> {
    const result = await this.db.query<CertificateRow>(
      `SELECT cert.id, cert.student_id, cert.course_id, co.title AS course_title,
              sp.display_name, u.email, cert.issued_at, cert.score_snapshot
       FROM certificates cert
       JOIN courses co ON co.id = cert.course_id
       LEFT JOIN users u ON u.id = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE cert.id = $1
       LIMIT 1`,
      [id],
    );
    const row = result.rows[0];
    return row ? this.toCertificate(row) : null;
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

    const snapshot = await this.getCourseAssessmentResults(studentId, courseId);

    await this.db.query(
      `INSERT INTO certificates (student_id, course_id, score_snapshot)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, course_id) DO NOTHING`,
      [studentId, courseId, JSON.stringify(snapshot)],
    );

    return this.getForStudentAndCourse(studentId, courseId);
  }

  private toCertificate(row: CertificateRow): Certificate {
    const rawSnapshot = (Array.isArray(row.score_snapshot) ? row.score_snapshot : []) as CertificateScoreSnapshotEntry[];
    return {
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      courseTitle: row.course_title,
      studentName: row.display_name ?? row.email ?? null,
      issuedAt: row.issued_at,
      scoreSnapshot: rawSnapshot,
      overallScorePercent: computeCourseScorePercent(rawSnapshot),
    };
  }
}
