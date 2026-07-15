// P4-052: PlacementSpeakingAnswerSubmitService.
//
// Scope: Placement Test SPEAKING answer submission only.
//
// Responsibility:
//   Accept a student's recorded audio for a `speaking` placement question,
//   transcribe it using the SAME STT pipeline already used for voice
//   teacher (STT_GATEWAY / SttTranscriptionService — STT_PROVIDER_BASE_URL,
//   STT_PROVIDER_API_KEY, STT_PROVIDER_MODEL), persist the transcript as
//   the answer_value, then grade the transcript with the same AI grading
//   rubric used for writing answers.
//
// Security rules:
//   - student_id is always sourced from the verified JWT — never client input.
//   - Attempt ownership + active status + timer expiry enforced identically
//     to PlacementAnswerSubmitService.
//   - Raw audio bytes are forwarded only to the STT provider; never logged,
//     persisted verbatim, or echoed back in the response.
//   - correct_answer / is_correct / internal mastery fields never returned.
//   - No secrets, service-role keys, or privileged config here.

import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import { PlacementAttemptRow, SubmitPlacementSpeakingAnswerResponse } from './placement.types';
import { PlacementAuditService } from './placement-audit.service';
import { PlacementAttemptTimerService } from './placement-attempt-timer.service';
import { PlacementAiGradingService } from './placement-ai-grading.service';
import { STT_GATEWAY, SttGateway } from '../voice-teacher/stt-gateway/stt-gateway.interface';

export interface SubmitSpeakingAnswerInput {
  readonly placement_question_id: string;
  readonly audio: Buffer;
  readonly contentType: string;
}

@Injectable()
export class PlacementSpeakingAnswerSubmitService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: PlacementAuditService,
    private readonly timer: PlacementAttemptTimerService,
    private readonly grading: PlacementAiGradingService,
    @Inject(STT_GATEWAY) private readonly sttGateway: SttGateway,
  ) {}

  async submitSpeakingAnswer(
    attemptId: string,
    studentId: string,
    input: SubmitSpeakingAnswerInput,
  ): Promise<SubmitPlacementSpeakingAnswerResponse> {
    // 1. Resolve + validate the active attempt (ownership enforced via student_id).
    const attemptResult = await this.db.query<PlacementAttemptRow>(
      `SELECT id, student_id, placement_test_id, status, started_at, expires_at
       FROM placement_attempts
       WHERE id = $1 AND student_id = $2
       LIMIT 1`,
      [attemptId, studentId],
    );

    if ((attemptResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
        message: 'Placement attempt not found or does not belong to you.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempt = attemptResult.rows[0];

    if (attempt.status !== 'active') {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_ACTIVE,
        message: `Placement attempt is not active (status: ${attempt.status}).`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.timer.assertNotExpired(attemptId, attempt.expires_at);

    // 2. Verify the question belongs to this test and is a speaking question.
    const questionResult = await this.db.query<{
      id: string;
      question_type: string;
      prompt: string;
      skill_code: string | null;
    }>(
      `SELECT pq.id, pq.question_type, pq.prompt, ps.skill_code
       FROM placement_questions pq
       JOIN placement_sections ps ON ps.id = pq.placement_section_id
       WHERE pq.id = $1 AND ps.placement_test_id = $2
       LIMIT 1`,
      [input.placement_question_id, attempt.placement_test_id],
    );

    if ((questionResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: PlacementErrorCode.QUESTION_NOT_FOUND,
        message: 'Question not found in this placement test.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const question = questionResult.rows[0];

    if (question.question_type !== 'speaking') {
      throw new AppError({
        code: PlacementErrorCode.INVALID_ANSWER_VALUE,
        message: 'This question is not a speaking question.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // 3. Reject duplicate answers.
    const duplicateResult = await this.db.query<{ id: string }>(
      `SELECT id FROM placement_answers
       WHERE placement_attempt_id = $1 AND placement_question_id = $2
       LIMIT 1`,
      [attemptId, input.placement_question_id],
    );

    if ((duplicateResult.rowCount ?? 0) > 0) {
      throw new AppError({
        code: PlacementErrorCode.DUPLICATE_ANSWER,
        message: 'An answer for this question has already been submitted in this attempt.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // 4. Transcribe via the same STT pipeline used for voice teacher.
    const sttResult = await this.sttGateway.transcribe({
      audio: input.audio,
      contentType: input.contentType,
    });

    const transcript = sttResult.transcript ?? '';

    // 5. Grade the transcript with the same AI provider used by AI Teacher.
    const graded = await this.grading.gradeSpeaking(question.prompt, transcript);

    // 6. Persist: transcript becomes answer_value; is_correct stays NULL
    //    (speaking is AI-graded, not objectively scored).
    const skillCode = question.skill_code ?? 'speaking';
    const insertResult = await this.db.query<{
      id: string;
      placement_attempt_id: string;
      placement_question_id: string;
      transcript: string;
      created_at: string;
    }>(
      `INSERT INTO placement_answers
         (placement_attempt_id, placement_question_id, answer_value, is_correct,
          skill_code, transcript, ai_score, ai_feedback, graded_at)
       VALUES ($1, $2, $3, NULL, $4, $3, $5, $6, now())
       RETURNING id, placement_attempt_id, placement_question_id, transcript, created_at`,
      [attemptId, input.placement_question_id, transcript || '(no speech detected)', skillCode, graded.score, graded.feedback],
    );

    const answer = insertResult.rows[0];

    void this.audit.logAnswerSubmitted(
      studentId,
      attemptId,
      answer.placement_question_id,
      'speaking',
      '[audio]',
    );

    return {
      id: answer.id,
      placement_attempt_id: answer.placement_attempt_id,
      placement_question_id: answer.placement_question_id,
      transcript: answer.transcript,
      created_at: answer.created_at,
    };
  }
}
