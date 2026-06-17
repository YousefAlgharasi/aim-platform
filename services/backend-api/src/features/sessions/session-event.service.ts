// Phase 5 — P5-053
// SessionEventService.
//
// Scope: Raw behavioral event recording for AIM Engine Integration only.
//
// Responsibility:
//   Record a raw behavioral signal (item_presented, item_submitted,
//   hesitation, retry, idle_gap) into session_events, scoped to an active,
//   owned learning session. This service never aggregates events into
//   AimSessionBehavioralContext (P5-009) — that aggregation happens inside
//   features/aim at AIM call time — and never calls the AIM Engine.
//
// Security rules:
//   - student_id is always sourced from the verified JWT by the caller —
//     never accepted as a raw client payload field by this service.
//   - Every event write is scoped to a session that belongs to the calling
//     student and is currently active. A session that does not exist, does
//     not belong to the student, or is not active is treated identically
//     (NOT_FOUND) to avoid leaking session existence to a non-owner.
//   - event_type is validated against the locked five-value enum as defense
//     in depth, even though callers are expected to already constrain it.
//   - response_time_ms and all other fields here are raw behavioral signals.
//     This service never computes or stores mastery, level, weakness,
//     difficulty, recommendation, review schedule, retention, or frustration.
//   - No AIM Engine call is made here. features/sessions never talks to the
//     AIM Engine; only features/aim does.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  ActiveSessionOwnershipRow,
  RecordSessionEventInput,
  RecordSessionEventResponse,
  SessionEventRow,
} from './sessions.types';

const VALID_EVENT_TYPES = new Set([
  'item_presented',
  'item_submitted',
  'hesitation',
  'retry',
  'idle_gap',
]);

@Injectable()
export class SessionEventService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Record a raw behavioral event for an active, owned learning session.
   *
   * Steps:
   *   1. Validate eventType against the locked five-value enum.
   *   2. Validate payload is a plain object (or default to {}).
   *   3. Verify the session exists, belongs to studentId, and is active.
   *   4. Insert the event row.
   *   5. Bump the owning session's last_activity_at.
   *   6. Return the safe response shape.
   */
  async recordEvent(
    input: RecordSessionEventInput,
  ): Promise<RecordSessionEventResponse> {
    if (!VALID_EVENT_TYPES.has(input.eventType)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Invalid eventType: ${input.eventType}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const payload = input.payload ?? {};
    if (typeof payload !== 'object' || Array.isArray(payload)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'payload must be a plain object.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      input.responseTimeMs !== undefined &&
      input.responseTimeMs < 0
    ) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'responseTimeMs must be non-negative.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    await this.verifyActiveSessionOwnership(
      input.learningSessionId,
      input.studentId,
    );

    const occurredAt = input.occurredAt ?? new Date().toISOString();

    const insertResult = await this.db.query<SessionEventRow>(
      `INSERT INTO session_events (
         learning_session_id, student_id,
         event_type, item_id,
         response_time_ms, payload,
         occurred_at, recorded_at
       )
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, now())
       RETURNING id, learning_session_id, student_id, event_type,
                 item_id, response_time_ms, payload,
                 occurred_at, recorded_at`,
      [
        input.learningSessionId,
        input.studentId,
        input.eventType,
        input.itemId ?? null,
        input.responseTimeMs ?? null,
        JSON.stringify(payload),
        occurredAt,
      ],
    );

    const event = insertResult.rows[0];

    await this.db.query(
      `UPDATE learning_sessions
       SET last_activity_at = $1, updated_at = now()
       WHERE id = $2`,
      [occurredAt, input.learningSessionId],
    );

    return {
      id: event.id,
      eventType: event.event_type,
      occurredAt: event.occurred_at,
    };
  }

  /**
   * Verify the session exists, belongs to studentId, and is active.
   * A missing, foreign, or inactive session all surface as NOT_FOUND so a
   * non-owner cannot distinguish "doesn't exist" from "not yours" or
   * "already closed".
   */
  private async verifyActiveSessionOwnership(
    learningSessionId: string,
    studentId: string,
  ): Promise<void> {
    const result = await this.db.query<ActiveSessionOwnershipRow>(
      `SELECT id FROM learning_sessions
       WHERE id = $1 AND student_id = $2 AND status = 'active'`,
      [learningSessionId, studentId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'No active learning session found for this student.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
