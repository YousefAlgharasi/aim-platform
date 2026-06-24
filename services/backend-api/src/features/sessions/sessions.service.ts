// Phase 5 — P5-052
// SessionsService.
//
// Scope: Learning session lifecycle for AIM Engine Integration only (start only).
//
// Responsibility:
//   Create a new learning_sessions row that the AIM pipeline (features/aim)
//   later reads when assembling AimSessionInput (P5-009) at analysis time.
//   This service does not call the AIM Engine and does not compute mastery,
//   level, weakness, difficulty, recommendations, review schedules, retention,
//   or frustration. It only establishes backend-owned session lifecycle state.
//
// Security rules:
//   - student_id is always sourced from the verified JWT by the caller —
//     never accepted as a raw client payload field by this service.
//   - session_type is backend-classified before reaching this service; this
//     service still validates it against the locked enum as defense in depth.
//   - skill_focus_ids are resolved against the curriculum skills table; any
//     entry that does not match an existing skill key is dropped rather than
//     trusted verbatim.
//   - current_level, level_source, and level_set_at are derived from the
//     student's most recent completed Phase 4 placement result. This service
//     never accepts a client-supplied level.
//   - No AIM Engine call is made here. features/sessions never talks to the
//     AIM Engine; only features/aim does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AnalyticsEventIngestionService } from '../analytics/analytics-event-ingestion.service';
import {
  AIM_SESSION_INPUT_CONTRACT_VERSION,
  LatestPlacementResultRow,
  LearningSessionRow,
  StartSessionInput,
  StartSessionResponse,
} from './sessions.types';

const VALID_SESSION_TYPES = new Set([
  'lesson_practice',
  'review_practice',
  'placement_followup',
  'adaptive_drill',
]);

@Injectable()
export class SessionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly analyticsEventIngestionService: AnalyticsEventIngestionService,
  ) {}

  /**
   * Start a new learning session for the given student.
   *
   * Steps:
   *   1. Validate sessionType against the locked four-value enum.
   *   2. Resolve current_level/level_source/level_set_at from the student's
   *      most recent completed placement result (P4-046).
   *   3. Resolve skillFocusIds against the curriculum skills table, dropping
   *      any entry that does not match an existing skill key.
   *   4. Insert a new learning_sessions row with status = 'active'.
   *   5. Return the student-safe response shape.
   *
   * @param input.studentId  Internal AIM user ID — always from the verified JWT.
   */
  async startSession(
    input: StartSessionInput,
  ): Promise<StartSessionResponse> {
    if (!VALID_SESSION_TYPES.has(input.sessionType)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Invalid sessionType: ${input.sessionType}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // 1. Resolve level context from the latest completed placement result.
    const placement = await this.resolveLatestPlacementResult(
      input.studentId,
    );

    // 2. Resolve skillFocusIds against the curriculum skills table.
    const resolvedSkillFocusIds = await this.resolveSkillFocusIds(
      input.skillFocusIds ?? [],
    );

    // 3. Insert the new session — backend sets every field.
    const insertResult = await this.db.query<LearningSessionRow>(
      `INSERT INTO learning_sessions (
         student_id, session_type, status,
         started_at, last_activity_at,
         current_level, level_source, level_set_at,
         skill_focus_ids,
         placement_result_id, placement_completed_at,
         contract_version
       )
       VALUES (
         $1, $2, 'active',
         now(), now(),
         $3, 'placement', $4,
         $5::jsonb,
         $6, $4,
         $7
       )
       RETURNING id, student_id, session_type, status,
                 started_at, last_activity_at, closed_at,
                 current_level, level_source, level_set_at,
                 skill_focus_ids,
                 placement_result_id, placement_completed_at,
                 contract_version, created_at, updated_at`,
      [
        input.studentId,
        input.sessionType,
        placement.estimated_level,
        placement.completed_at,
        JSON.stringify(resolvedSkillFocusIds),
        placement.id,
        AIM_SESSION_INPUT_CONTRACT_VERSION,
      ],
    );

    const session = insertResult.rows[0];

    await this.analyticsEventIngestionService.ingest({
      eventType: 'session.started',
      actorRole: 'student',
      actorId: session.student_id,
      subjectType: 'learning_session',
      subjectId: session.id,
      occurredAt: new Date(session.started_at),
      metadata: { session_type: session.session_type },
    });

    return {
      id: session.id,
      sessionType: session.session_type,
      status: session.status,
      startedAt: session.started_at,
      currentLevel: session.current_level,
      skillFocusIds: session.skill_focus_ids,
    };
  }

  /**
   * Resolve the student's most recent completed placement result, used to
   * bootstrap session-entry level context. A session cannot start before
   * the student has at least one completed placement result.
   */
  private async resolveLatestPlacementResult(
    studentId: string,
  ): Promise<LatestPlacementResultRow> {
    const result = await this.db.query<LatestPlacementResultRow>(
      `SELECT pr.id, pr.estimated_level, pa.completed_at
       FROM placement_results pr
       JOIN placement_attempts pa ON pa.id = pr.placement_attempt_id
       WHERE pa.student_id = $1
         AND pa.completed_at IS NOT NULL
       ORDER BY pa.completed_at DESC
       LIMIT 1`,
      [studentId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message:
          'Student has no completed placement result; a learning session cannot start without a baseline level.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0] ?? null;
  }

  /**
   * Validate candidate skill keys against the curriculum skills table.
   * Entries that do not match an existing skill key are dropped rather
   * than trusted verbatim, per the Phase 5 no-client-side-AIM rule.
   */
  private async resolveSkillFocusIds(
    candidateSkillIds: readonly string[],
  ): Promise<readonly string[]> {
    if (candidateSkillIds.length === 0) {
      return [];
    }

    const result = await this.db.query<{ key: string }>(
      `SELECT key FROM skills WHERE key = ANY($1::text[])`,
      [candidateSkillIds],
    );

    return result.rows.map((row) => row.key);
  }
}
