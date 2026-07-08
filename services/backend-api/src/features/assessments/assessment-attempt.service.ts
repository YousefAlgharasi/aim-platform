// P10-025: AttemptLifecycleService.
//
// Scope: Start, resume, submit, expire, and cancel attempt lifecycle —
//        all controlled backend-side.
//
// Security rules:
//   - Attempt eligibility (max attempts, deadline window) is always
//     backend-evaluated here; Flutter must never compute it locally.
//   - Attempt status transitions are backend-controlled only; no
//     client-supplied status is trusted.
//   - expiresAt is computed from assessment_settings.time_limit_seconds
//     by the backend; Flutter uses it for display countdown only.
//   - Submission triggers grading via AssessmentGradingService — no
//     client-supplied score or correctness is accepted.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import {
  Injectable, ConflictException, ForbiddenException,
  NotFoundException, Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AssessmentRepository } from './assessment.repository';
import { AssessmentDeadlineService } from './assessment-deadline.service';
import { isChapterLessonsComplete, isCourseChaptersComplete } from './assessment-chapter-gate.util';
import { chapterNotComplete, courseNotComplete } from './assessment-errors';

export interface StartAttemptResult {
  readonly attemptId: string;
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly status: 'started';
  readonly startedAt: Date;
  /** Backend-computed from time_limit_seconds; Flutter uses for display only. */
  readonly expiresAt: Date | null;
}

export interface ResumeAttemptResult {
  readonly attemptId: string;
  readonly status: 'in_progress';
  readonly expiresAt: Date | null;
}

export interface SubmitAttemptResult {
  readonly attemptId: string;
  readonly status: 'submitted';
  readonly submittedAt: Date;
  readonly resultId: string | null; // set after async grading
}

@Injectable()
export class AttemptLifecycleService {
  private readonly logger = new Logger(AttemptLifecycleService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly repo: AssessmentRepository,
    private readonly deadlineSvc: AssessmentDeadlineService,
  ) {}

  // -------------------------------------------------------------------------
  // Start attempt — backend validates eligibility
  // -------------------------------------------------------------------------

  async startAttempt(assessmentId: string, studentId: string): Promise<StartAttemptResult> {
    // 1. Verify assessment exists and is published.
    const assessment = await this.repo.findPublishedById(assessmentId);

    // 1.5. Chapter-gated assessments: reject until every published lesson in
    // the linked chapter is completed. Mirrors the visibility filter in
    // AssessmentService.listForStudent — a student must never be able to
    // attempt an assessment that's hidden from their list by guessing its id.
    if (assessment.chapter_id) {
      const unlocked = await isChapterLessonsComplete(this.db, studentId, assessment.chapter_id);
      if (!unlocked) {
        throw chapterNotComplete();
      }
    }

    // 1.6. Course-gated assessments (final exams): reject until every
    // chapter in the linked course is fully complete (lessons + any
    // chapter quiz, passed). Same defense-in-depth rationale as 1.5.
    if (assessment.course_id) {
      const unlocked = await isCourseChaptersComplete(this.db, studentId, assessment.course_id);
      if (!unlocked) {
        throw courseNotComplete();
      }
    }

    // 2. Check deadline eligibility — backend authority only.
    const eligibility = await this.deadlineSvc.checkSubmissionEligibility(assessmentId, studentId);
    if (!eligibility.eligible) {
      throw new ConflictException(
        eligibility.reason ?? 'DEADLINE_CLOSED',
      );
    }

    // 3. Check max attempts — backend authority only.
    const settingsRes = await this.db.query<{ max_attempts: number; time_limit_seconds: number | null }>(
      `SELECT max_attempts, time_limit_seconds FROM assessment_settings WHERE assessment_id = $1`,
      [assessmentId],
    );
    const settings = settingsRes.rows[0] ?? { max_attempts: 1, time_limit_seconds: null };
    const currentCount = await this.repo.countAttemptsByStudent(assessmentId, studentId);

    if (currentCount >= settings.max_attempts) {
      throw new ConflictException('MAX_ATTEMPTS_REACHED');
    }

    // 4. Compute expiresAt backend-side (Flutter gets for display only).
    const expiresAt = settings.time_limit_seconds
      ? new Date(Date.now() + settings.time_limit_seconds * 1000)
      : null;

    // 5. Create attempt.
    const attempt = await this.repo.createAttempt(
      assessmentId, studentId, currentCount + 1, expiresAt,
    );

    this.logger.log(`Started attempt ${attempt.id} for student ${studentId}`);

    return {
      attemptId: attempt.id,
      assessmentId,
      attemptNumber: attempt.attempt_number,
      status: 'started',
      startedAt: attempt.started_at,
      expiresAt,
    };
  }

  // -------------------------------------------------------------------------
  // Resume attempt — backend validates ownership and resumability
  // -------------------------------------------------------------------------

  async resumeAttempt(attemptId: string, studentId: string): Promise<ResumeAttemptResult> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt) throw new NotFoundException(`Attempt ${attemptId} not found`);
    if (attempt.student_id !== studentId) throw new ForbiddenException('ATTEMPT_NOT_OWNED');

    const resumable = ['started', 'in_progress'];
    if (!resumable.includes(attempt.status)) {
      throw new ConflictException('ATTEMPT_NOT_RESUMABLE');
    }

    await this.repo.updateAttemptStatus(attemptId, 'in_progress');

    return { attemptId, status: 'in_progress', expiresAt: attempt.expires_at };
  }

  // -------------------------------------------------------------------------
  // Submit attempt — backend validates and triggers grading
  // -------------------------------------------------------------------------

  async submitAttempt(attemptId: string, studentId: string): Promise<SubmitAttemptResult> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt) throw new NotFoundException(`Attempt ${attemptId} not found`);
    if (attempt.student_id !== studentId) throw new ForbiddenException('ATTEMPT_NOT_OWNED');
    if (attempt.status === 'submitted' || attempt.status === 'graded') {
      throw new ConflictException('ATTEMPT_ALREADY_SUBMITTED');
    }
    if (!['started', 'in_progress'].includes(attempt.status)) {
      throw new ConflictException('INVALID_ATTEMPT');
    }

    // Backend checks deadline/late policy before accepting submission.
    const eligibility = await this.deadlineSvc.checkSubmissionEligibility(
      attempt.assessment_id, studentId,
    );
    if (!eligibility.eligible) {
      throw new ConflictException('DEADLINE_BLOCKS_SUBMISSION');
    }

    const submittedAt = new Date();
    await this.db.query(
      `UPDATE assessment_attempts
       SET status = 'submitted', submitted_at = $1, updated_at = NOW()
       WHERE id = $2`,
      [submittedAt, attemptId],
    );

    this.logger.log(`Submitted attempt ${attemptId} for student ${studentId}`);

    // Grading is triggered asynchronously by the caller (submission flow).
    return { attemptId, status: 'submitted', submittedAt, resultId: null };
  }

  // -------------------------------------------------------------------------
  // Expire attempt — backend-scheduled job only
  // -------------------------------------------------------------------------

  async expireAttempt(attemptId: string): Promise<void> {
    await this.db.query(
      `UPDATE assessment_attempts
       SET status = 'expired', updated_at = NOW()
       WHERE id = $1 AND status IN ('started', 'in_progress')`,
      [attemptId],
    );
    this.logger.log(`Expired attempt ${attemptId}`);
  }
}
