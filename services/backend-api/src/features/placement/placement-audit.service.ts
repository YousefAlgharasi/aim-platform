// Phase 4 — P4-050
// Placement audit logging service.
//
// Scope: Placement Test system only.
//
// Security rules:
// - student_id is always sourced from the verified JWT or from the placement attempt row.
//   It is NEVER taken from client request body.
// - event_data payloads must never include correct_answer, skill_mastery internals,
//   weakness map internals, scoring weights, or signal threshold values.
// - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys here.
// - Do not log AIM Engine runtime data, lesson delivery, practice attempt data,
//   session state, progress dashboard data, AI Teacher data, or Student Web App data.
// - Audit log rows are append-only — they must never be updated or deleted by this service.
// - Backend is the final authority for placement scoring and result generation.
//   This service only records lifecycle events; it does not compute scores or results.

import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../database/database.service';

// ---------------------------------------------------------------------------
// Allowed event types — must match the CHECK constraint in P4-025 migration
// ---------------------------------------------------------------------------

export type PlacementAuditEventType =
  | 'attempt_started'
  | 'answer_submitted'
  | 'attempt_submitted'
  | 'attempt_completed'
  | 'attempt_abandoned'
  | 'result_generated'
  | 'path_assigned';

// ---------------------------------------------------------------------------
// Event data payloads (internal — never sent to clients)
//
// SECURITY: Do NOT include correct_answer, is_correct, scoring weights,
// signal thresholds, or any AIM Engine runtime data in event_data.
// ---------------------------------------------------------------------------

/** Payload for attempt_started */
export interface AttemptStartedEventData {
  readonly placementTestId: string;
}

/** Payload for answer_submitted */
export interface AnswerSubmittedEventData {
  readonly placementQuestionId: string;
  readonly questionType: string;
  // answerValue is included for audit trail — never returned to students.
  // is_correct is NOT included here — it is set after attempt completion by P4-044.
  readonly answerValue: string;
}

/** Payload for attempt_submitted */
export interface AttemptSubmittedEventData {
  readonly totalQuestions: number;
  readonly totalAnswered: number;
}

/** Payload for attempt_completed */
export interface AttemptCompletedEventData {
  readonly placementResultId: string;
  // Estimated level is included for audit trail — backend-computed only.
  // Raw scores and thresholds are NOT included.
  readonly estimatedLevel: string;
}

/** Payload for attempt_abandoned */
export interface AttemptAbandonedEventData {
  readonly reason?: string;
}

/** Payload for result_generated */
export interface ResultGeneratedEventData {
  readonly placementResultId: string;
  readonly estimatedLevel: string;
  // Skill signals summary (signal only — no ratios, counts, or thresholds)
  readonly skillSignals: Record<string, string>;
}

/** Payload for path_assigned */
export interface PathAssignedEventData {
  readonly initialLearningPathId: string;
  readonly entryCount: number;
}

export type PlacementAuditEventData =
  | AttemptStartedEventData
  | AnswerSubmittedEventData
  | AttemptSubmittedEventData
  | AttemptCompletedEventData
  | AttemptAbandonedEventData
  | ResultGeneratedEventData
  | PathAssignedEventData;

// ---------------------------------------------------------------------------
// Audit log row type (internal — never sent to clients)
// ---------------------------------------------------------------------------

interface PlacementAuditLogRow {
  readonly id: string;
  readonly placement_attempt_id: string | null;
  readonly student_id: string;
  readonly event_type: PlacementAuditEventType;
  readonly event_data: PlacementAuditEventData;
  readonly created_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class PlacementAuditService {
  private readonly logger = new Logger(PlacementAuditService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Log a placement lifecycle event.
   *
   * Fire-and-forget by design: audit logging failures must never block the
   * primary placement flow. Callers should NOT await this method when used
   * in a non-critical path. The service logs errors internally.
   *
   * @param eventType - One of the allowed placement audit event types (P4-025)
   * @param studentId - Resolved from JWT or attempt row — never from client input
   * @param eventData - Event-specific payload (must not include correct_answer or scoring internals)
   * @param attemptId - Optional: the placement attempt this event belongs to
   */
  async log(
    eventType: PlacementAuditEventType,
    studentId: string,
    eventData: PlacementAuditEventData,
    attemptId?: string | null,
  ): Promise<void> {
    try {
      await this.db.query<PlacementAuditLogRow>(
        `
        INSERT INTO placement_audit_log
          (placement_attempt_id, student_id, event_type, event_data)
        VALUES
          ($1, $2, $3, $4)
        `,
        [attemptId ?? null, studentId, eventType, JSON.stringify(eventData)],
      );
    } catch (err) {
      // Audit failures must never propagate to the caller.
      // Log and continue — do not rethrow.
      this.logger.error(
        `PlacementAuditService: failed to log event "${eventType}" for student ${studentId} attempt ${attemptId ?? 'n/a'}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Convenience methods — one per event type for strongly-typed call sites
  // ---------------------------------------------------------------------------

  /** Log attempt_started — called by PlacementAttemptService after INSERT. */
  logAttemptStarted(
    studentId: string,
    attemptId: string,
    placementTestId: string,
  ): Promise<void> {
    return this.log(
      'attempt_started',
      studentId,
      { placementTestId } satisfies AttemptStartedEventData,
      attemptId,
    );
  }

  /** Log answer_submitted — called by PlacementAnswerSubmitService after INSERT. */
  logAnswerSubmitted(
    studentId: string,
    attemptId: string,
    placementQuestionId: string,
    questionType: string,
    answerValue: string,
  ): Promise<void> {
    return this.log(
      'answer_submitted',
      studentId,
      {
        placementQuestionId,
        questionType,
        answerValue,
      } satisfies AnswerSubmittedEventData,
      attemptId,
    );
  }

  /** Log attempt_submitted — called by PlacementAttemptCompleteService after status → submitted. */
  logAttemptSubmitted(
    studentId: string,
    attemptId: string,
    totalQuestions: number,
    totalAnswered: number,
  ): Promise<void> {
    return this.log(
      'attempt_submitted',
      studentId,
      { totalQuestions, totalAnswered } satisfies AttemptSubmittedEventData,
      attemptId,
    );
  }

  /** Log attempt_completed — called by PlacementResultService after status → completed. */
  logAttemptCompleted(
    studentId: string,
    attemptId: string,
    placementResultId: string,
    estimatedLevel: string,
  ): Promise<void> {
    return this.log(
      'attempt_completed',
      studentId,
      { placementResultId, estimatedLevel } satisfies AttemptCompletedEventData,
      attemptId,
    );
  }

  /** Log attempt_abandoned — called when an attempt is abandoned. */
  logAttemptAbandoned(
    studentId: string,
    attemptId: string,
    reason?: string,
  ): Promise<void> {
    return this.log(
      'attempt_abandoned',
      studentId,
      { reason } satisfies AttemptAbandonedEventData,
      attemptId,
    );
  }

  /**
   * Log result_generated — called by PlacementResultService after writing placement_results.
   *
   * SECURITY: skillSignals must contain only signal strings (strong/developing/emerging).
   * Never include correctness ratios, question counts, or threshold values.
   */
  logResultGenerated(
    studentId: string,
    attemptId: string,
    placementResultId: string,
    estimatedLevel: string,
    skillSignals: Record<string, string>,
  ): Promise<void> {
    return this.log(
      'result_generated',
      studentId,
      {
        placementResultId,
        estimatedLevel,
        skillSignals,
      } satisfies ResultGeneratedEventData,
      attemptId,
    );
  }

  /** Log path_assigned — called by PlacementInitialLearningPathService after path creation. */
  logPathAssigned(
    studentId: string,
    attemptId: string,
    initialLearningPathId: string,
    entryCount: number,
  ): Promise<void> {
    return this.log(
      'path_assigned',
      studentId,
      { initialLearningPathId, entryCount } satisfies PathAssignedEventData,
      attemptId,
    );
  }
}
