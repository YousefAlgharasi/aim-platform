// PlacementAimBridgeService.
//
// Scope: Feed each already-scored placement-test question into the AIM
//        pipeline via AimAttemptBridgeService, so placement performance
//        contributes to mastery/weakness/difficulty/recommendations the
//        same way lesson-practice session attempts already do.
//
// Why this exists:
//   PlacementScoringService computes a per-skill correctness signal but
//   that result only ever fed placement_results (estimated_level,
//   skill_mastery_map, weakness_map) — it never reached the AIM pipeline.
//   Placement is also a chicken-and-egg case: a bridged learning_sessions
//   row needs a baseline level, but a student's very first placement test
//   is exactly the thing establishing that baseline — there is no earlier
//   placement_results row to look up yet. PlacementResultService already
//   computes that level (scoringResult.estimatedLevel) before this runs,
//   so the caller passes it in directly instead of this service querying
//   for a prior result.
//
// Security rules:
//   - studentId is always the value PlacementResultService already
//     resolved from the attempt row (itself JWT-derived upstream) — never
//     re-derived from a client field.
//   - is_correct is never recomputed here — it's read as-is from
//     placement_answers, already set by PlacementAnswerValidationService
//     before scoring ever ran.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AimAttemptBridgeService } from '../sessions/aim-attempt-bridge.service';
import { AttemptAnswerFormat } from '../sessions/lesson-attempt.types';

interface PlacementAnswerContextRow {
  readonly id: string;
  readonly placement_question_id: string;
  readonly answer_value: string | null;
  readonly is_correct: boolean | null;
  readonly question_type: string;
  readonly skill_keys: string[] | null;
}

const ANSWER_FORMAT_BY_QUESTION_TYPE: Record<string, AttemptAnswerFormat> = {
  multiple_choice: 'multiple_choice',
  true_false: 'true_false',
  listening_choice: 'listening_choice',
  fill_blank: 'fill_blank',
};

// Placement questions carry no per-question difficulty label (unlike
// question_bank) — a fixed mid-scale value is used for every bridged
// placement attempt. presentedDifficulty is context for AIM, never an
// input to mastery/level/weakness computation itself.
const PLACEMENT_PRESENTED_DIFFICULTY = 2 as const;

@Injectable()
export class PlacementAimBridgeService {
  private readonly logger = new Logger(PlacementAimBridgeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly aimAttemptBridge: AimAttemptBridgeService,
  ) {}

  /**
   * Bridge every scored placement answer for this attempt into the AIM
   * pipeline. Never throws — a bridging problem must never affect
   * placement result creation, which has already completed by the time
   * this runs (see PlacementResultService.createResult).
   */
  async bridgeScoredAttempt(input: {
    placementAttemptId: string;
    studentId: string;
    estimatedLevel: string;
    placementResultId: string;
    resultCreatedAt: string;
    xRequestId: string;
  }): Promise<void> {
    try {
      const answers = await this.fetchAnswerContexts(input.placementAttemptId);

      for (const answer of answers) {
        if (answer.is_correct === null) {
          // Unanswered — nothing to bridge.
          continue;
        }

        const answerFormat = ANSWER_FORMAT_BY_QUESTION_TYPE[answer.question_type] ?? 'free_text';

        await this.aimAttemptBridge.recordAndTrigger({
          bridgeSessionId: input.placementAttemptId,
          studentId: input.studentId,
          levelContext: {
            currentLevel: input.estimatedLevel,
            placementResultId: input.placementResultId,
            placementCompletedAt: input.resultCreatedAt,
            levelSetAt: input.resultCreatedAt,
          },
          itemId: answer.placement_question_id,
          itemType: 'drill_question',
          skillIds: answer.skill_keys ?? [],
          presentedDifficulty: PLACEMENT_PRESENTED_DIFFICULTY,
          answerFormat,
          answerValue: answer.answer_value ?? '',
          optionsPresentedCount: null,
          isCorrect: answer.is_correct,
          startedAt: input.resultCreatedAt,
          submittedAt: input.resultCreatedAt,
          xRequestId: input.xRequestId,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `PlacementAimBridgeService: failed to bridge attempt=${input.placementAttemptId}: ${message}`,
      );
    }
  }

  private async fetchAnswerContexts(placementAttemptId: string): Promise<PlacementAnswerContextRow[]> {
    const result = await this.db.query<PlacementAnswerContextRow>(
      `SELECT
         pa.id,
         pa.placement_question_id,
         pa.answer_value,
         pa.is_correct,
         pq.question_type,
         COALESCE(
           (SELECT array_agg(DISTINCT s.key)
              FROM placement_question_skills pqs
              JOIN skills s ON s.id = pqs.skill_id
             WHERE pqs.placement_question_id = pa.placement_question_id),
           '{}'
         ) AS skill_keys
       FROM placement_answers pa
       JOIN placement_questions pq ON pq.id = pa.placement_question_id
       WHERE pa.placement_attempt_id = $1`,
      [placementAttemptId],
    );
    return result.rows;
  }
}
