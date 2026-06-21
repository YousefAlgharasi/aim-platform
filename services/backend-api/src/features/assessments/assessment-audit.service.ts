// P10-031: AssessmentAuditService.
//
// Scope: Log safe assessment lifecycle metadata to assessment_audit_logs.
//        Tracks attempt_started, attempt_submitted, attempt_graded,
//        attempt_expired, deadline_extended, result_persisted events.
//
// Security rules (per P10-016 audit table design):
//   - Backend-write-only. Flutter never calls this service directly.
//   - metadata must be safe: no secrets, service-role keys, DB credentials,
//     AI provider keys, or full sensitive answer payloads.
//   - actor_id is always backend-resolved from the calling context; no
//     client-supplied actor identity is accepted.
//   - entity_id is the UUID of the domain entity (attempt, result, etc.);
//     stored without a foreign-key constraint so audit records survive
//     deletion of the referenced row.
//   - No correctness data, raw answer payloads, or grading internals in metadata.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, database credentials, or AI provider keys.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

// ---------------------------------------------------------------------------
// Event type catalogue (enforced by the audit table CHECK constraint on
// entity_type; event_type is a free-form TEXT with backend-controlled values).
// ---------------------------------------------------------------------------

export type AuditEntityType = 'assessment' | 'attempt' | 'deadline' | 'result';

export type AuditEventType =
  | 'attempt_started'
  | 'attempt_resumed'
  | 'attempt_submitted'
  | 'attempt_graded'
  | 'attempt_expired'
  | 'attempt_cancelled'
  | 'deadline_extended'
  | 'result_persisted';

// ---------------------------------------------------------------------------
// Safe metadata shapes — one per event type.
// These types enforce the "no sensitive data" rule at the TypeScript layer.
// None of these fields must contain secrets, raw answers, or grading logic.
// ---------------------------------------------------------------------------

export interface AttemptStartedMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly startedAt: string;        // ISO-8601
  readonly expiresAt: string | null; // ISO-8601 or null
}

export interface AttemptResumedMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly resumedAt: string;        // ISO-8601
}

export interface AttemptSubmittedMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly submittedAt: string;      // ISO-8601
}

export interface AttemptGradedMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly gradedAt: string;         // ISO-8601
}

export interface AttemptExpiredMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly expiredAt: string;        // ISO-8601
}

export interface AttemptCancelledMeta {
  readonly assessmentId: string;
  readonly attemptNumber: number;
  readonly cancelledAt: string;      // ISO-8601
  readonly reason: string;
}

export interface DeadlineExtendedMeta {
  readonly assessmentId: string;
  readonly studentId: string;
  readonly newDeadline: string;       // ISO-8601
  readonly previousDeadline: string;  // ISO-8601
  readonly extendedBy: string;        // actor role or system
}

export interface ResultPersistedMeta {
  readonly assessmentId: string;
  readonly attemptId: string;
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly latePenaltyApplied: boolean;
  readonly persistedAt: string;      // ISO-8601
}

export type AuditMetadata =
  | AttemptStartedMeta
  | AttemptResumedMeta
  | AttemptSubmittedMeta
  | AttemptGradedMeta
  | AttemptExpiredMeta
  | AttemptCancelledMeta
  | DeadlineExtendedMeta
  | ResultPersistedMeta;

// ---------------------------------------------------------------------------
// Audit record shape returned after persistence (read by backend callers only)
// ---------------------------------------------------------------------------

export interface AuditRecord {
  readonly id: string;
  readonly entityType: AuditEntityType;
  readonly entityId: string;
  readonly eventType: AuditEventType;
  readonly actorId: string | null;
  readonly occurredAt: Date;
  readonly metadata: AuditMetadata;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AssessmentAuditService {
  private readonly logger = new Logger(AssessmentAuditService.name);

  private readonly FORBIDDEN_KEYS = new Set([
    'password', 'secret', 'token', 'key', 'credential', 'apiKey',
    'api_key', 'serviceRole', 'service_role', 'anon', 'answers',
    'correct_answers', 'correctAnswers', 'rawAnswers', 'raw_answers',
  ]);

  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // logEvent — core write method.
  //
  // Validates metadata safety constraints (no secrets, no sensitive payloads)
  // before persisting. Errors are logged but never re-thrown so that an audit
  // failure never interrupts the primary assessment flow.
  // -------------------------------------------------------------------------

  async logEvent(params: {
    entityType: AuditEntityType;
    entityId: string;
    eventType: AuditEventType;
    actorId: string | null;
    occurredAt: Date;
    metadata: AuditMetadata;
  }): Promise<AuditRecord | null> {
    const { entityType, entityId, eventType, actorId, occurredAt, metadata } = params;

    // Safety guard: reject any metadata that contains forbidden keys.
    this.assertSafeMetadata(metadata, eventType);

    try {
      const res = await this.db.query<{
        id: string;
        entity_type: string;
        entity_id: string;
        event_type: string;
        actor_id: string | null;
        occurred_at: Date;
        metadata: AuditMetadata;
      }>(
        `INSERT INTO assessment_audit_logs
           (entity_type, entity_id, event_type, actor_id, occurred_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, entity_type, entity_id, event_type, actor_id, occurred_at, metadata`,
        [
          entityType,
          entityId,
          eventType,
          actorId ?? null,
          occurredAt.toISOString(),
          JSON.stringify(metadata),
        ],
      );

      if (res.rows.length === 0) {
        this.logger.error(`P10-031 audit insert returned no rows [${eventType}/${entityId}]`);
        return null;
      }

      const d = res.rows[0];
      return {
        id: d.id,
        entityType: d.entity_type as AuditEntityType,
        entityId: d.entity_id,
        eventType: d.event_type as AuditEventType,
        actorId: d.actor_id,
        occurredAt: d.occurred_at,
        metadata: d.metadata,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`P10-031 audit exception [${eventType}/${entityId}]: ${msg}`);
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Convenience helpers — one per event type, used by other backend services.
  // -------------------------------------------------------------------------

  async logAttemptStarted(params: {
    attemptId: string;
    actorId: string;
    meta: AttemptStartedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_started',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.startedAt),
      metadata: params.meta,
    });
  }

  async logAttemptResumed(params: {
    attemptId: string;
    actorId: string;
    meta: AttemptResumedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_resumed',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.resumedAt),
      metadata: params.meta,
    });
  }

  async logAttemptSubmitted(params: {
    attemptId: string;
    actorId: string;
    meta: AttemptSubmittedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_submitted',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.submittedAt),
      metadata: params.meta,
    });
  }

  async logAttemptGraded(params: {
    attemptId: string;
    actorId: string | null;
    meta: AttemptGradedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_graded',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.gradedAt),
      metadata: params.meta,
    });
  }

  async logAttemptExpired(params: {
    attemptId: string;
    meta: AttemptExpiredMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_expired',
      actorId: null, // system-triggered
      occurredAt: new Date(params.meta.expiredAt),
      metadata: params.meta,
    });
  }

  async logAttemptCancelled(params: {
    attemptId: string;
    actorId: string | null;
    meta: AttemptCancelledMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'attempt',
      entityId: params.attemptId,
      eventType: 'attempt_cancelled',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.cancelledAt),
      metadata: params.meta,
    });
  }

  async logDeadlineExtended(params: {
    deadlineId: string;
    actorId: string;
    meta: DeadlineExtendedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'deadline',
      entityId: params.deadlineId,
      eventType: 'deadline_extended',
      actorId: params.actorId,
      occurredAt: new Date(),
      metadata: params.meta,
    });
  }

  async logResultPersisted(params: {
    resultId: string;
    actorId: string | null;
    meta: ResultPersistedMeta;
  }): Promise<void> {
    await this.logEvent({
      entityType: 'result',
      entityId: params.resultId,
      eventType: 'result_persisted',
      actorId: params.actorId,
      occurredAt: new Date(params.meta.persistedAt),
      metadata: params.meta,
    });
  }

  // -------------------------------------------------------------------------
  // Private: safety check for metadata — no forbidden keys allowed.
  // -------------------------------------------------------------------------

  private assertSafeMetadata(metadata: AuditMetadata, eventType: string): void {
    const keys = Object.keys(metadata as unknown as Record<string, unknown>);
    for (const k of keys) {
      if (this.FORBIDDEN_KEYS.has(k)) {
        const msg =
          `P10-031 audit metadata for [${eventType}] contains forbidden key "${k}". ` +
          'Secrets and sensitive payloads must never be stored in audit logs.';
        this.logger.error(msg);
        throw new Error(msg);
      }
    }
  }
}
