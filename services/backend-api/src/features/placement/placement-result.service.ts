// Phase 4 — P4-046
// PlacementResultService.
//
// Scope: Placement Test result creation only.
//
// Responsibility:
//   Orchestrate the full post-submission pipeline for a placed attempt:
//
//   1. Validate all submitted answers (set is_correct via P4-044).
//   2. Score the attempt (compute section scores, skill signals, overall level via P4-045).
//   3. Write a placement_results row with estimated_level, skill_mastery_map, weakness_map.
//   4. Transition the attempt status from 'submitted' → 'completed'.
//
//   This service is the single entry point for result creation. It is called by
//   the backend after the attempt is submitted (P4-043) — never by Flutter.
//
//   initial_path_id is set to NULL here and populated by P4-047
//   (PlacementInitialLearningPathService) after result creation.
//
// Security rules:
//   - Backend-only — never called directly by Flutter or any client.
//   - student_id is taken from the attempt row — never from client input.
//   - overallScore and raw scoring data are NEVER stored in placement_results
//     or returned to clients. Only estimated_level, skill_mastery_map, and
//     weakness_map are persisted.
//   - Flutter receives the result via P4-048 (GET /placement/attempts/:id/result)
//     only after attempt.status = 'completed'.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import { PlacementAnswerValidationService } from './placement-answer-validation.service';
import { PlacementScoringService } from './placement-scoring.service';
import { PlacementAttemptRow } from './placement.types';
import { PlacementAnalyticsService } from './placement-analytics.service';

/** Student-safe result row shape returned by createResult. */
export interface PlacementResultRow {
  readonly id: string;
  readonly placement_attempt_id: string;
  readonly student_id: string;
  readonly estimated_level: string;
  readonly skill_mastery_map: unknown;
  readonly weakness_map: unknown;
  readonly initial_path_id: string | null;
  readonly created_at: string;
}

/** Summary returned to the calling service after result creation. */
export interface PlacementResultCreationSummary {
  readonly resultId: string;
  readonly estimatedLevel: string;
  readonly attemptId: string;
}

@Injectable()
export class PlacementResultService {
  private readonly logger = new Logger(PlacementResultService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly answerValidation: PlacementAnswerValidationService,
    private readonly scoring: PlacementScoringService,
    private readonly analytics: PlacementAnalyticsService,
  ) {}

  /**
   * Create a placement result for a submitted attempt.
   *
   * Steps:
   *   1. Verify the attempt exists and is in 'submitted' status.
   *   2. Run answer validation (P4-044) — writes is_correct on placement_answers.
   *   3. Run scoring (P4-045) — produces estimated_level, skill_mastery_map, weakness_map.
   *   4. Insert placement_results row.
   *   5. Transition attempt status: submitted → completed.
   *
   * This method is idempotent: if a result already exists for the attempt,
   * it returns the existing result ID without re-running scoring.
   *
   * @param attemptId  UUID of the submitted placement_attempt.
   * @returns          PlacementResultCreationSummary for the calling service.
   */
  async createResult(attemptId: string): Promise<PlacementResultCreationSummary> {
    // -----------------------------------------------------------------------
    // 1. Verify the attempt is in 'submitted' status.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<PlacementAttemptRow>(
      `SELECT id, student_id, placement_test_id, status, started_at
       FROM placement_attempts
       WHERE id = $1
       LIMIT 1`,
      [attemptId],
    );

    if ((attemptResult.rowCount ?? 0) === 0) {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
        message: `Placement attempt not found: ${attemptId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const attempt = attemptResult.rows[0];

    if (attempt.status === 'completed') {
      // Idempotency: result already exists — return existing result id.
      const existing = await this.db.query<{ id: string; estimated_level: string }>(
        `SELECT id, estimated_level FROM placement_results
         WHERE placement_attempt_id = $1 LIMIT 1`,
        [attemptId],
      );
      if ((existing.rowCount ?? 0) > 0) {
        this.logger.log(`PlacementResultService: attempt ${attemptId} already completed — returning existing result`);
        return {
          resultId: existing.rows[0].id,
          estimatedLevel: existing.rows[0].estimated_level,
          attemptId,
        };
      }
    }

    if (attempt.status !== 'submitted') {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_SUBMITTED,
        message: `Placement attempt must be in 'submitted' status to generate a result (current: ${attempt.status}).`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    // -----------------------------------------------------------------------
    // 2. Validate answers — write is_correct on all placement_answers.
    //    (P4-044 PlacementAnswerValidationService)
    // -----------------------------------------------------------------------
    const validationSummary = await this.answerValidation.validateAnswersForAttempt(attemptId);
    this.logger.log(
      `PlacementResultService: validation for ${attemptId} — ` +
        `${validationSummary.totalCorrect}/${validationSummary.totalEvaluated} correct`,
    );

    // -----------------------------------------------------------------------
    // 3. Score the attempt — compute level, skill map, weakness map.
    //    (P4-045 PlacementScoringService)
    //    overallScore is NEVER persisted — backend-internal only.
    // -----------------------------------------------------------------------
    const scoringResult = await this.scoring.scoreAttempt(attemptId);
    this.logger.log(
      `PlacementResultService: scoring for ${attemptId} — ` +
        `level=${scoringResult.estimatedLevel}, weaknesses=${scoringResult.weaknessMap.length}`,
    );

    // -----------------------------------------------------------------------
    // 4. Build JSONB payloads for placement_results.
    //
    //    skill_mastery_map — per P4-014 §3:
    //      { [skill_code]: { total_questions, correct_answers, mastery_score } }
    //    Internal fields (correctnessRatio, correctCount, etc.) are stored
    //    inside the JSONB for admin use but are stripped at the API layer (P4-048).
    //
    //    weakness_map — per P4-014 §4:
    //      { weaknesses: [{ skill_code, mastery_score, priority }] }
    // -----------------------------------------------------------------------
    const skillMasteryMapJson = this.buildSkillMasteryMapJson(scoringResult);
    const weaknessMapJson = this.buildWeaknessMapJson(scoringResult);

    // -----------------------------------------------------------------------
    // 5. Insert placement_results row.
    //    initial_path_id is NULL — set by P4-047 (PlacementInitialLearningPathService).
    //    student_id is taken from the attempt row — never from client input.
    // -----------------------------------------------------------------------
    const insertResult = await this.db.query<PlacementResultRow>(
      `INSERT INTO placement_results
         (placement_attempt_id, student_id, estimated_level, skill_mastery_map, weakness_map, initial_path_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, NULL)
       RETURNING id, placement_attempt_id, student_id, estimated_level,
                 skill_mastery_map, weakness_map, initial_path_id, created_at`,
      [
        attemptId,
        attempt.student_id,
        scoringResult.estimatedLevel,
        JSON.stringify(skillMasteryMapJson),
        JSON.stringify(weaknessMapJson),
      ],
    );

    const result = insertResult.rows[0];

    // -----------------------------------------------------------------------
    // 6. Transition attempt: submitted → completed.
    //    completed_at is set by backend — never writable by Flutter.
    // -----------------------------------------------------------------------
    await this.db.query(
      `UPDATE placement_attempts
       SET status = 'completed',
           completed_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [attemptId],
    );

    this.logger.log(
      `PlacementResultService: result ${result.id} created for attempt ${attemptId} — ` +
        `level=${scoringResult.estimatedLevel}, attempt now completed`,
    );

    const totalTimeSeconds = attempt.started_at
      ? Math.max(0, Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000))
      : 0;

    void this.analytics.recordAttemptCompleted(
      attempt.student_id,
      attemptId,
      attempt.placement_test_id,
      scoringResult.estimatedLevel,
      totalTimeSeconds,
    );

    return {
      resultId: result.id,
      estimatedLevel: scoringResult.estimatedLevel,
      attemptId,
    };
  }

  // -------------------------------------------------------------------------
  // Private: build JSONB payloads
  // -------------------------------------------------------------------------

  /**
   * Build skill_mastery_map JSONB per P4-014 §3.
   *
   * Shape: { [skill_code]: { total_questions, correct_answers, mastery_score } }
   *
   * Note: section-level data (by skill_code) is stored using sectionScores.
   * Skill-level detail is stored nested under each section for admin use.
   * Flutter receives this map via the result API (P4-048) — raw scoring fields
   * (correctnessRatio, correctCount, lowCoverage) are stripped at the API layer.
   */
  private buildSkillMasteryMapJson(
    scoringResult: Awaited<ReturnType<PlacementScoringService['scoreAttempt']>>,
  ): Record<string, unknown> {
    const map: Record<string, unknown> = {};

    for (const section of scoringResult.sectionScores) {
      map[section.skillCode] = {
        total_questions: section.totalQuestions,
        correct_answers: section.correctAnswers,
        mastery_score: parseFloat(section.masteryScore.toFixed(4)),
      };
    }

    return map;
  }

  /**
   * Build weakness_map JSONB per P4-014 §4.
   *
   * Shape: { weaknesses: [{ skill_code, mastery_score, priority }] }
   */
  private buildWeaknessMapJson(
    scoringResult: Awaited<ReturnType<PlacementScoringService['scoreAttempt']>>,
  ): { weaknesses: Array<{ skill_code: string; mastery_score: number; priority: number; signal: string }> } {
    return {
      weaknesses: scoringResult.weaknessMap.map((w) => ({
        skill_code: w.skillCode,
        mastery_score: parseFloat(w.masteryScore.toFixed(4)),
        priority: w.priority,
        signal: w.signal,
      })),
    };
  }
}
