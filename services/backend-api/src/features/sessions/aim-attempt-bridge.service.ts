// AimAttemptBridgeService.
//
// Scope: Let assessment and placement-test question answers feed the same
//        AIM pipeline (mastery/weakness/difficulty/recommendations/review
//        schedule) that lesson-practice session attempts already trigger.
//
// Why this exists:
//   The AIM pipeline (features/aim) is only ever invoked from
//   SessionsController.submitAttempt, which requires an active
//   learning_sessions row. Assessments and the placement test have their own
//   separate content/grading schemas (assessment_questions/question_bank,
//   placement_questions/placement_answers) and never created a
//   learning_sessions row, so a student's assessment and placement-test
//   answers never reached AIM at all — only lesson-practice sessions did.
//
//   This service lets a caller from either feature "bridge" one already-
//   graded question answer into the exact same pipeline: it ensures a
//   learning_sessions row exists for the given bridgeSessionId (a stable id
//   the caller controls — e.g. the assessment attempt id or the placement
//   attempt id, reused as the learning_sessions primary key so no separate
//   mapping table is needed), records a lesson_attempts row via the same
//   LessonAttemptService session attempts use, and triggers the AIM
//   orchestrator exactly as SessionsController.submitAttempt does.
//
//   session_type is always 'adaptive_drill' for bridged attempts — the four
//   locked session_type values (P5-009) have no dedicated "assessment" or
//   "placement" value, and the AIM Engine's own contract does not currently
//   branch on session_type, so this is a safe, contract-compatible label
//   rather than a real behavioral claim about session_type semantics.
//
// Security rules:
//   - studentId is always supplied by the caller from the verified JWT —
//     never accepted as a raw client payload field here.
//   - isCorrect, skillIds, presentedDifficulty, answerFormat are always
//     resolved by the caller from backend-owned content tables — this
//     service does not evaluate correctness itself.
//   - Never throws to the caller: a bridging failure (e.g. no placement
//     result yet to derive a level from) is logged and skipped, exactly
//     like AIM pipeline failures never block the primary session-attempt
//     response.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LessonAttemptService } from './lesson-attempt.service';
import { AttemptAnswerFormat, AttemptDifficultyLevel, AttemptItemType } from './lesson-attempt.types';
import { AimPipelineOrchestratorService } from '../aim/pipeline/aim-pipeline-orchestrator.service';
import { AIM_SESSION_INPUT_CONTRACT_VERSION } from './sessions.types';

export interface BridgedAttemptLevelContext {
  /** Backend-persisted level identifier (Phase 0/4 scale), e.g. 'intermediate'. */
  readonly currentLevel: string;
  /** UUID of the placement_results row this level came from, if any. */
  readonly placementResultId: string | null;
  /** ISO-8601 timestamp the referenced placement completed, if any. */
  readonly placementCompletedAt: string | null;
  /**
   * When this level was set — the placement's completion time when
   * currentLevel came from placementCompletedAt, or the current time when
   * it's a fresh in-progress placement result with no prior placement
   * (matches SessionsService.resolveLatestPlacementResult's convention).
   */
  readonly levelSetAt: string;
}

export interface BridgeAttemptInput {
  /**
   * Stable id the caller controls (the assessment attempt id or the
   * placement attempt id) — reused as the learning_sessions primary key.
   */
  readonly bridgeSessionId: string;
  /** Backend-resolved student id — same convention as learning_sessions.student_id. */
  readonly studentId: string;
  /** The student's level context at the time of this attempt. */
  readonly levelContext: BridgedAttemptLevelContext;
  readonly itemId: string;
  readonly itemType: AttemptItemType;
  readonly skillIds: readonly string[];
  readonly presentedDifficulty: AttemptDifficultyLevel;
  readonly answerFormat: AttemptAnswerFormat;
  readonly answerValue: string;
  readonly optionsPresentedCount: number | null;
  readonly isCorrect: boolean;
  readonly startedAt: string;
  readonly submittedAt: string;
  readonly xRequestId: string;
}

@Injectable()
export class AimAttemptBridgeService {
  private readonly logger = new Logger(AimAttemptBridgeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly lessonAttemptService: LessonAttemptService,
    private readonly aimOrchestrator: AimPipelineOrchestratorService,
  ) {}

  /**
   * Record one already-graded question answer as an AIM attempt and
   * trigger the pipeline. Never throws — logs and returns on failure so a
   * bridging problem never breaks assessment grading or placement scoring.
   */
  async recordAndTrigger(input: BridgeAttemptInput): Promise<void> {
    try {
      await this.ensureBridgeSession(input.bridgeSessionId, input.studentId, input.levelContext);

      const attemptResult = await this.lessonAttemptService.recordAttempt({
        studentId: input.studentId,
        learningSessionId: input.bridgeSessionId,
        itemId: input.itemId,
        itemType: input.itemType,
        skillIds: input.skillIds,
        presentedDifficulty: input.presentedDifficulty,
        answerFormat: input.answerFormat,
        answerValue: input.answerValue,
        optionsPresentedCount: input.optionsPresentedCount,
        isCorrect: input.isCorrect,
        startedAt: input.startedAt,
        submittedAt: input.submittedAt,
        answerChangeCount: 0,
      });

      await this.aimOrchestrator.trigger({
        studentId: input.studentId,
        sessionId: input.bridgeSessionId,
        attemptId: attemptResult.attemptId,
        xRequestId: input.xRequestId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `AimAttemptBridgeService: failed to bridge attempt for item=${input.itemId} ` +
          `bridgeSessionId=${input.bridgeSessionId}: ${message}`,
      );
    }
  }

  /**
   * Create the bridging learning_sessions row on first use for this
   * bridgeSessionId. A no-op if it already exists (the second, third, ...
   * question of the same assessment/placement attempt reuses the same row).
   */
  private async ensureBridgeSession(
    bridgeSessionId: string,
    studentId: string,
    levelContext: BridgedAttemptLevelContext,
  ): Promise<void> {
    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM learning_sessions WHERE id = $1`,
      [bridgeSessionId],
    );
    if ((existing.rowCount ?? 0) > 0) {
      return;
    }

    await this.db.query(
      `INSERT INTO learning_sessions (
         id, student_id, session_type, status,
         started_at, last_activity_at,
         current_level, level_source, level_set_at,
         skill_focus_ids,
         placement_result_id, placement_completed_at,
         contract_version
       )
       VALUES (
         $1, $2, 'adaptive_drill', 'active',
         now(), now(),
         $3, 'placement', $4,
         '[]'::jsonb,
         $5, $6,
         $7
       )
       ON CONFLICT (id) DO NOTHING`,
      [
        bridgeSessionId,
        studentId,
        levelContext.currentLevel,
        levelContext.levelSetAt,
        levelContext.placementResultId,
        levelContext.placementCompletedAt,
        AIM_SESSION_INPUT_CONTRACT_VERSION,
      ],
    );
  }
}
