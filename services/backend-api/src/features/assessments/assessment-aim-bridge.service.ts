// AssessmentAimBridgeService.
//
// Scope: Feed each already-graded assessment question into the AIM pipeline
//        via AimAttemptBridgeService, so assessment performance contributes
//        to mastery/weakness/difficulty/recommendations the same way
//        lesson-practice session attempts already do.
//
// Why this exists:
//   AssessmentGradingService computes correctness per question
//   (GradingOutcome[]) but that result only ever fed assessment_results —
//   it never reached the AIM pipeline. This service resolves the remaining
//   fields AIM needs (skillIds, answerFormat, presentedDifficulty,
//   optionsPresentedCount, the raw questionId) from the same question_bank/
//   question_skills tables lesson content uses (assessment questions are
//   question_bank rows too, linked via assessment_questions), then calls
//   the bridge once per graded outcome.
//
// Security rules:
//   - studentId is always the value AssessmentGradingResult already carries
//     (itself JWT-resolved upstream) — never re-derived from a client field.
//   - isCorrect is never recomputed here — it's taken as-is from the
//     grading result that already computed it correctly.
//   - Skipped entirely (logged, not thrown) when the student has no
//     completed placement result yet, since the bridged learning_sessions
//     row needs a baseline level — matches SessionsService's own
//     requirement that a session cannot start without one.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AimAttemptBridgeService } from '../sessions/aim-attempt-bridge.service';
import { AttemptAnswerFormat, AttemptDifficultyLevel } from '../sessions/lesson-attempt.types';
import { AssessmentGradingResult } from './assessment-grading.types';

interface QuestionContextRow {
  readonly assessment_question_link_id: string;
  readonly question_id: string;
  readonly response_value: string;
  readonly type: string;
  readonly difficulty: string;
  readonly options_count: number;
  readonly skill_keys: string[] | null;
}

interface LatestPlacementRow {
  readonly id: string;
  readonly estimated_level: string;
  readonly completed_at: string;
}

const ANSWER_FORMAT_BY_QUESTION_TYPE: Record<string, AttemptAnswerFormat> = {
  multiple_choice: 'multiple_choice',
  true_false: 'true_false',
  listening_choice: 'listening_choice',
  fill_in_the_blank: 'fill_blank',
  fill_in_blank: 'fill_blank',
  fill_blank: 'fill_blank',
};

const OPTION_BASED_QUESTION_TYPES = new Set(['multiple_choice', 'true_false', 'listening_choice']);

const DIFFICULTY_BY_LABEL: Record<string, AttemptDifficultyLevel> = {
  beginner: 1,
  elementary: 2,
  intermediate: 3,
  advanced: 4,
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

const DEFAULT_PRESENTED_DIFFICULTY: AttemptDifficultyLevel = 2;

@Injectable()
export class AssessmentAimBridgeService {
  private readonly logger = new Logger(AssessmentAimBridgeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly aimAttemptBridge: AimAttemptBridgeService,
  ) {}

  /**
   * Bridge every graded question in this attempt into the AIM pipeline.
   * Never throws — a bridging problem must never affect assessment
   * grading, which has already completed and persisted by the time this
   * runs (see AssessmentSubmissionFlowService).
   */
  async bridgeGradedAttempt(gradingResult: AssessmentGradingResult, xRequestId: string): Promise<void> {
    try {
      const placement = await this.resolveLatestPlacementResult(gradingResult.studentId);
      if (!placement) {
        this.logger.warn(
          `AssessmentAimBridgeService: skipping bridge for attempt=${gradingResult.attemptId} — ` +
            'student has no completed placement result yet.',
        );
        return;
      }

      const questionContexts = await this.fetchQuestionContexts(gradingResult.attemptId);
      const contextByLinkId = new Map(
        questionContexts.map((row) => [row.assessment_question_link_id, row]),
      );

      for (const outcome of gradingResult.outcomes) {
        const context = contextByLinkId.get(outcome.assessmentQuestionLinkId);
        if (!context) {
          continue;
        }

        const answerFormat = ANSWER_FORMAT_BY_QUESTION_TYPE[context.type] ?? 'free_text';
        const presentedDifficulty =
          DIFFICULTY_BY_LABEL[context.difficulty] ?? DEFAULT_PRESENTED_DIFFICULTY;
        const isOptionBased = OPTION_BASED_QUESTION_TYPES.has(context.type);

        await this.aimAttemptBridge.recordAndTrigger({
          bridgeSessionId: gradingResult.attemptId,
          studentId: gradingResult.studentId,
          levelContext: {
            currentLevel: placement.estimated_level,
            placementResultId: placement.id,
            placementCompletedAt: placement.completed_at,
            levelSetAt: placement.completed_at,
          },
          itemId: context.question_id,
          itemType: 'practice_question',
          skillIds: context.skill_keys ?? [],
          presentedDifficulty,
          answerFormat,
          answerValue: context.response_value,
          optionsPresentedCount: isOptionBased ? context.options_count : null,
          isCorrect: outcome.isCorrect,
          startedAt: gradingResult.gradedAt.toISOString(),
          submittedAt: gradingResult.gradedAt.toISOString(),
          xRequestId,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `AssessmentAimBridgeService: failed to bridge attempt=${gradingResult.attemptId}: ${message}`,
      );
    }
  }

  private async fetchQuestionContexts(attemptId: string): Promise<QuestionContextRow[]> {
    const result = await this.db.query<QuestionContextRow>(
      `SELECT
         aaa.assessment_question_link_id,
         aq.question_id,
         aaa.response_value,
         qb.type,
         qb.difficulty,
         (SELECT COUNT(*)::int FROM question_choices qc WHERE qc.question_id = qb.id) AS options_count,
         COALESCE(
           (SELECT array_agg(DISTINCT s.key)
              FROM question_skills qs
              JOIN skills s ON s.id = qs.skill_id
             WHERE qs.question_id = qb.id),
           '{}'
         ) AS skill_keys
       FROM assessment_attempt_answers aaa
       JOIN assessment_questions aq ON aq.id = aaa.assessment_question_link_id
       JOIN question_bank qb ON qb.id = aq.question_id
       WHERE aaa.attempt_id = $1`,
      [attemptId],
    );
    return result.rows;
  }

  private async resolveLatestPlacementResult(studentId: string): Promise<LatestPlacementRow | null> {
    const result = await this.db.query<LatestPlacementRow>(
      `SELECT pr.id, pr.estimated_level, pa.completed_at
       FROM placement_results pr
       JOIN placement_attempts pa ON pa.id = pr.placement_attempt_id
       WHERE pa.student_id = $1
         AND pa.completed_at IS NOT NULL
       ORDER BY pa.completed_at DESC
       LIMIT 1`,
      [studentId],
    );
    return result.rows[0] ?? null;
  }
}
