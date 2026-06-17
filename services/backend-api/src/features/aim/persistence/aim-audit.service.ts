// Phase 5 — P5-064
// AimAuditService.
//
// Scope: Append-only metadata logging for every AIM Engine pipeline stage
//        boundary, consistent with docs/phase-5/aim-error-handling-policy.md
//        (P5-008) and the aim_audit_log migration (P5-041).
//
// Responsibility:
//   Receives a structured AimAuditEntry from the pipeline orchestrator
//   (P5-056) or any pipeline service and writes a single append-only row
//   to aim_audit_log.
//
// Critical safety rules enforced here:
//   - METADATA ONLY. Never log raw request bodies, raw response bodies,
//     the service token, AI provider keys, database credentials, or any
//     other secret. The metadata field accepts a safe JSONB object containing
//     only non-sensitive pipeline context (stage, duration, counts, etc.).
//   - APPEND-ONLY. No UPDATE or DELETE is ever issued against aim_audit_log.
//   - Audit failures are NEVER re-thrown. A failure to write an audit row
//     must not disrupt the pipeline. It is logged via the NestJS logger as
//     a warning and silently swallowed so that the caller's transaction
//     is not affected.
//   - studentId, sessionId, attemptId are stored as correlation IDs only,
//     never used to look up or modify AIM-owned records here.
//   - No AIM Engine call is made here.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Enums (mirror aim_audit_log CHECK constraints from P5-041)
// ---------------------------------------------------------------------------

export type AimAuditPipelineStage =
  | 'client_entry'
  | 'pipeline_trigger'
  | 'state_assembly'
  | 'aim_engine_call'
  | 'response_validation'
  | 'persistence'
  | 'result_emission'
  | 'fallback'
  | 'audit_close_out';

export type AimAuditOutcome =
  | 'success'
  | 'transient'
  | 'non_retryable'
  | 'validation_failed'
  | 'contract_violation'
  | 'breaker_open'
  | 'persistence_failed'
  | 'authorization_denied';

// ---------------------------------------------------------------------------
// Entry type
// ---------------------------------------------------------------------------

export interface AimAuditEntry {
  /** Caller-assigned request correlation ID (UUID). */
  readonly requestId: string;
  /** Backend-generated request ID from the orchestrator (UUID). */
  readonly backendRequestId: string;
  /** AIM Engine endpoint being called (e.g. '/aim/v1/analysis'). */
  readonly endpoint: string;
  /** Pipeline stage at which this entry is recorded. */
  readonly pipelineStage: AimAuditPipelineStage;
  /** Outcome classification per the P5-008 failure taxonomy. */
  readonly outcome: AimAuditOutcome;
  /** Optional P5-018 integration error code when outcome is not success. */
  readonly integrationErrorCode?: string | null;
  /** Backend-resolved student ID for correlation. Never client-supplied. */
  readonly studentId?: string | null;
  /** Session ID for correlation. */
  readonly sessionId?: string | null;
  /** Attempt ID for correlation (when entry relates to a single attempt). */
  readonly attemptId?: string | null;
  /** Retry attempt number (1-based). Null for first attempt. */
  readonly attemptNumber?: number | null;
  /** Call duration in milliseconds. */
  readonly durationMs?: number | null;
  /**
   * Safe, non-sensitive metadata object.
   *
   * Allowed fields: stage-specific counters, flags, enum values, timing
   * breakdowns. NEVER include: request/response bodies, service tokens,
   * AI provider keys, database credentials, PII beyond the IDs above,
   * or stack traces.
   */
  readonly metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AimAuditService {
  private readonly logger = new Logger(AimAuditService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Record an AIM pipeline audit entry (append-only).
   *
   * Audit failures are silently swallowed so that a failed audit write
   * never disrupts the pipeline. The failure is logged as a warning.
   *
   * The metadata field must contain only non-sensitive context.
   * Never pass request/response bodies, tokens, or secrets.
   */
  async record(entry: AimAuditEntry): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO aim_audit_log (
           request_id, backend_request_id,
           endpoint, pipeline_stage, outcome, integration_error_code,
           student_id, session_id, attempt_id,
           attempt_number, duration_ms,
           metadata,
           occurred_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, now())`,
        [
          entry.requestId,
          entry.backendRequestId,
          entry.endpoint,
          entry.pipelineStage,
          entry.outcome,
          entry.integrationErrorCode ?? null,
          entry.studentId ?? null,
          entry.sessionId ?? null,
          entry.attemptId ?? null,
          entry.attemptNumber ?? null,
          entry.durationMs ?? null,
          JSON.stringify(entry.metadata ?? {}),
        ],
      );
    } catch (err) {
      // Audit failures must never disrupt the pipeline.
      // Log the failure and return silently.
      this.logger.warn('aim_audit_write_failed', {
        requestId: entry.requestId,
        backendRequestId: entry.backendRequestId,
        pipelineStage: entry.pipelineStage,
        outcome: entry.outcome,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
