// P10-026: AnswerSubmissionService.
//
// Scope: Validate and persist student answers within an active attempt.
//
// Security rules:
//   - Accepts only { assessmentQuestionLinkId, responseValue } from client.
//   - Rejects any client-supplied isCorrect, score, passed, or correctAnswer.
//   - Never evaluates correctness here — that is the grading service's job.
//   - Verifies attempt ownership (student_id) before persisting.
//   - Verifies attempt is in_progress/started before accepting answers.
//   - Verifies the question belongs to the attempt's assessment.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, DB credentials, or AI provider keys.

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface SubmitAnswerInput {
  readonly attemptId: string;
  readonly studentId: string;
  readonly assessmentQuestionLinkId: string;
  /** Opaque student selection — correctness never evaluated here. */
  readonly responseValue: string;
}

export interface SubmittedAnswerDto {
  readonly answerId: string;
  readonly assessmentQuestionLinkId: string;
  readonly submittedAt: Date;
  // isCorrect, pointsAwarded: NEVER included here
}

interface AttemptRow {
  assessment_id: string;
  student_id: string;
  status: string;
}

interface QuestionLinkRow {
  id: string;
  assessment_id: string;
}

@Injectable()
export class AnswerSubmissionService {
  constructor(private readonly db: DatabaseService) {}

  async submitAnswer(input: SubmitAnswerInput): Promise<SubmittedAnswerDto> {
    // 1. Load attempt — verify ownership and status.
    const attemptRes = await this.db.query<AttemptRow>(
      `SELECT assessment_id, student_id, status
       FROM assessment_attempts WHERE id = $1`,
      [input.attemptId],
    );
    if (!attemptRes.rows[0]) throw new NotFoundException(`Attempt ${input.attemptId} not found`);

    const attempt = attemptRes.rows[0];
    if (attempt.student_id !== input.studentId) {
      throw new ForbiddenException('Attempt does not belong to this student');
    }
    if (!['started', 'in_progress'].includes(attempt.status)) {
      throw new ConflictException('ATTEMPT_NOT_IN_PROGRESS');
    }

    // 2. Verify question belongs to this assessment.
    const qRes = await this.db.query<QuestionLinkRow>(
      `SELECT id, assessment_id FROM assessment_questions WHERE id = $1`,
      [input.assessmentQuestionLinkId],
    );
    if (!qRes.rows[0]) {
      throw new NotFoundException(`Question link ${input.assessmentQuestionLinkId} not found`);
    }
    if (qRes.rows[0].assessment_id !== attempt.assessment_id) {
      throw new BadRequestException('QUESTION_NOT_IN_ASSESSMENT');
    }

    // 3. Validate responseValue — non-empty, no correctness fields injected.
    if (!input.responseValue?.trim()) {
      throw new BadRequestException('responseValue must not be empty');
    }

    // 4. Upsert answer (ON CONFLICT updates responseValue).
    //    No isCorrect or score column — correctness is grading service's job.
    const ansRes = await this.db.query<{ id: string; submitted_at: Date }>(
      `INSERT INTO assessment_attempt_answers
         (attempt_id, assessment_question_link_id, response_value, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (attempt_id, assessment_question_link_id)
       DO UPDATE SET response_value = EXCLUDED.response_value,
                     updated_at = NOW()
       RETURNING id, submitted_at`,
      [input.attemptId, input.assessmentQuestionLinkId, input.responseValue],
    );

    // 5. Advance attempt status to in_progress if still 'started'.
    if (attempt.status === 'started') {
      await this.db.query(
        `UPDATE assessment_attempts SET status = 'in_progress', updated_at = NOW()
         WHERE id = $1 AND status = 'started'`,
        [input.attemptId],
      );
    }

    return {
      answerId: ansRes.rows[0].id,
      assessmentQuestionLinkId: input.assessmentQuestionLinkId,
      submittedAt: ansRes.rows[0].submitted_at,
    };
  }
}
