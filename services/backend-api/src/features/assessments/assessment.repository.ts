// P10-022: AssessmentRepository.
//
// Scope: Data-access layer for the assessment feature. Encapsulates all
//        raw SQL queries for assessments, sections, questions, attempts,
//        answers, deadlines, and results.
//
// Security rules:
//   - Never returns correct_answer, is_correct (raw), points, section weights,
//     pass_threshold, late_penalty_percent, or grading_mode to callers that
//     pass data toward Flutter. Those fields are used internally only.
//   - score, passed, and latePenaltyApplied are written by the grading/
//     result services only — no client-supplied value is persisted here.
//   - All student-scoped queries enforce student_id ownership.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// Inlined until P10-020 branch merges
export interface AssessmentRow {
  id: string; type: string; title: string; description: string | null;
  status: string; created_by: string; created_at: Date; updated_at: Date;
  chapter_id: string | null;
  course_id: string | null;
}
export interface AssessmentSectionRow {
  id: string; assessment_id: string; title: string; order: number;
  weight: number; // backend-only
}
export interface AssessmentAttemptRow {
  id: string; assessment_id: string; student_id: string;
  attempt_number: number; status: string;
  started_at: Date; submitted_at: Date | null; expires_at: Date | null;
}
export interface AssessmentDeadlineRow {
  id: string; assessment_id: string; student_id: string | null;
  opens_at: Date; closes_at: Date; extended_closes_at: Date | null;
  late_window_seconds: number | null; late_penalty_percent: number; // backend-only
  is_active: boolean;
}

@Injectable()
export class AssessmentRepository {
  constructor(private readonly db: DatabaseService) {}

  // -----------------------------------------------------------------------
  // Assessments
  // -----------------------------------------------------------------------

  async findPublishedById(id: string): Promise<AssessmentRow> {
    const res = await this.db.query<AssessmentRow>(
      `SELECT id, type, title, description, status, created_by, created_at, updated_at, chapter_id, course_id
       FROM assessments WHERE id = $1 AND status = 'published'`,
      [id],
    );
    if (!res.rows[0]) throw new NotFoundException(`Assessment ${id} not found`);
    return res.rows[0];
  }

  async findAllPublished(): Promise<AssessmentRow[]> {
    const res = await this.db.query<AssessmentRow>(
      `SELECT id, type, title, description, status, created_by, created_at, updated_at, chapter_id, course_id
       FROM assessments WHERE status = 'published' ORDER BY created_at DESC`,
    );
    return res.rows;
  }

  // -----------------------------------------------------------------------
  // Sections
  // -----------------------------------------------------------------------

  async findSectionsByAssessment(assessmentId: string): Promise<AssessmentSectionRow[]> {
    const res = await this.db.query<AssessmentSectionRow>(
      `SELECT id, assessment_id, title, "order", weight
       FROM assessment_sections WHERE assessment_id = $1 ORDER BY "order"`,
      [assessmentId],
    );
    return res.rows;
  }

  async countQuestionsPerSection(assessmentId: string): Promise<Map<string, number>> {
    const res = await this.db.query<{ section_id: string | null; count: string }>(
      `SELECT section_id, COUNT(*)::text AS count
       FROM assessment_questions WHERE assessment_id = $1 GROUP BY section_id`,
      [assessmentId],
    );
    const map = new Map<string, number>();
    for (const row of res.rows) {
      if (row.section_id) map.set(row.section_id, parseInt(row.count, 10));
    }
    return map;
  }

  // -----------------------------------------------------------------------
  // Deadlines  (late_window_seconds / late_penalty_percent: backend-only)
  // -----------------------------------------------------------------------

  async findEffectiveDeadline(
    assessmentId: string,
    studentId: string,
  ): Promise<AssessmentDeadlineRow | null> {
    // Per-student extension takes precedence over global deadline
    const res = await this.db.query<AssessmentDeadlineRow>(
      `SELECT id, assessment_id, student_id, opens_at, closes_at,
              extended_closes_at, late_window_seconds, late_penalty_percent, is_active
       FROM assessment_deadlines
       WHERE assessment_id = $1 AND is_active = TRUE
         AND (student_id = $2 OR student_id IS NULL)
       ORDER BY student_id NULLS LAST LIMIT 1`,
      [assessmentId, studentId],
    );
    return res.rows[0] ?? null;
  }

  // -----------------------------------------------------------------------
  // Attempts
  // -----------------------------------------------------------------------

  async findAttemptById(attemptId: string): Promise<AssessmentAttemptRow | null> {
    const res = await this.db.query<AssessmentAttemptRow>(
      `SELECT id, assessment_id, student_id, attempt_number, status,
              started_at, submitted_at, expires_at
       FROM assessment_attempts WHERE id = $1`,
      [attemptId],
    );
    return res.rows[0] ?? null;
  }

  /**
   * The student's still-open attempt for this assessment (not yet submitted,
   * and not expired), if any — so startAttempt can resume it instead of
   * creating a new one and burning an attempt slot on a student who simply
   * left the app mid-attempt.
   */
  async findActiveAttempt(
    assessmentId: string,
    studentId: string,
  ): Promise<AssessmentAttemptRow | null> {
    const res = await this.db.query<AssessmentAttemptRow>(
      `SELECT id, assessment_id, student_id, attempt_number, status,
              started_at, submitted_at, expires_at
       FROM assessment_attempts
       WHERE assessment_id = $1 AND student_id = $2
         AND status IN ('started', 'in_progress')
         AND (expires_at IS NULL OR expires_at > NOW())
       ORDER BY started_at DESC
       LIMIT 1`,
      [assessmentId, studentId],
    );
    return res.rows[0] ?? null;
  }

  async countAttemptsByStudent(assessmentId: string, studentId: string): Promise<number> {
    const res = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM assessment_attempts
       WHERE assessment_id = $1 AND student_id = $2`,
      [assessmentId, studentId],
    );
    return parseInt(res.rows[0]?.count ?? '0', 10);
  }

  async createAttempt(
    assessmentId: string,
    studentId: string,
    attemptNumber: number,
    expiresAt: Date | null,
  ): Promise<AssessmentAttemptRow> {
    const res = await this.db.query<AssessmentAttemptRow>(
      `INSERT INTO assessment_attempts
         (assessment_id, student_id, attempt_number, status, started_at, expires_at)
       VALUES ($1, $2, $3, 'started', NOW(), $4)
       RETURNING id, assessment_id, student_id, attempt_number, status,
                 started_at, submitted_at, expires_at`,
      [assessmentId, studentId, attemptNumber, expiresAt],
    );
    return res.rows[0];
  }

  async updateAttemptStatus(attemptId: string, status: string): Promise<void> {
    await this.db.query(
      `UPDATE assessment_attempts SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, attemptId],
    );
  }

  // -----------------------------------------------------------------------
  // Answers  (response_value only — no correctness persisted here)
  // -----------------------------------------------------------------------

  async upsertAnswer(
    attemptId: string,
    questionLinkId: string,
    responseValue: string,
  ): Promise<string> {
    const res = await this.db.query<{ id: string }>(
      `INSERT INTO assessment_attempt_answers
         (attempt_id, assessment_question_link_id, response_value, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (attempt_id, assessment_question_link_id)
       DO UPDATE SET response_value = EXCLUDED.response_value,
                     updated_at = NOW()
       RETURNING id`,
      [attemptId, questionLinkId, responseValue],
    );
    return res.rows[0]?.id ?? '';
  }
}
