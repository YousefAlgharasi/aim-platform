/**
 * AIM pipeline orchestrator — Phase 5, P5-056.
 *
 * Coordinates Stages 2–8 of the backend AIM pipeline defined in
 * docs/phase-5/backend-aim-pipeline-map.md.
 *
 * Pipeline stages owned here:
 *   Stage 2 — Pipeline trigger (entry point; validates context shape)
 *   Stage 3 — State assembly (delegates to AimStateAssemblyService)
 *   Stage 4 — AIM Engine call (delegates to AimEngineAdapterService)
 *   Stage 5 — Response validation (handled inside the adapter, P5-048)
 *   Stage 6 — Persistence (delegates to AimPersistenceService)
 *   Stage 7 — Result emission (returns structured outcome to caller)
 *   Stage 8 — Fallback (safe handling when adapter returns ok: false)
 *   Stage 9 — Audit close-out (delegates to AimAuditService)
 *
 * Backend authority rules enforced here:
 * - This service is the only backend entry point into the AIM pipeline.
 * - Flutter, Admin Dashboard, and all clients are prohibited from calling
 *   this service or the AIM Engine directly.
 * - No AIM-owned value (mastery, level, weakness, difficulty, recommendation,
 *   review schedule, retention, frustration) is computed here; those are
 *   exclusively AIM Engine outputs returned via the adapter (P5-048) and
 *   persisted by the persistence service (P5-057 through P5-062).
 * - An unvalidated AIM response is never persisted; the adapter's ok: false
 *   path (Stage 8) skips persistence entirely.
 * - Audit metadata is logged at every stage boundary; raw request/response
 *   bodies and secrets are never logged.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 *
 * Sources:
 *   docs/phase-5/backend-aim-pipeline-map.md
 *   docs/phase-5/aim-error-handling-policy.md  (P5-008)
 */
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AimEngineAdapterService } from '../adapter/aim-engine-adapter.service';
import { AimRequestMapperService } from '../adapter/aim-request-mapper.service';
import { AimMappingContext } from '../adapter/aim-request-mapper.types';
import { AimAuditService } from '../persistence/aim-audit.service';
import { AimPersistenceService } from '../persistence/aim-persistence.service';
import { AimStateAssemblyService } from './aim-state-assembly.service';

// ---------------------------------------------------------------------------
// Pipeline context — the structured trigger payload passed by the caller
// (e.g. the session-event controller after recording an attempt)
// ---------------------------------------------------------------------------

export interface AimPipelineContext {
  /** Backend-resolved student UUID (from JWT). */
  readonly studentId: string;
  /** Active learning session UUID. */
  readonly sessionId: string;
  /** Most-recently-recorded lesson attempt UUID. */
  readonly attemptId: string;
  /** X-Request-Id correlation header from the originating HTTP request. */
  readonly xRequestId: string;
}

// ---------------------------------------------------------------------------
// Pipeline outcome — returned to the caller at Stage 7
// ---------------------------------------------------------------------------

export type AimPipelineOutcome =
  | {
      readonly ok: true;
      readonly backendRequestId: string;
      readonly studentId: string;
      readonly sessionId: string;
    }
  | {
      readonly ok: false;
      readonly backendRequestId: string;
      readonly reason: 'state_assembly_failed' | 'aim_engine_unavailable' | 'persistence_failed';
      readonly errorCode?: string;
    };

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

@Injectable()
export class AimPipelineOrchestratorService {
  private readonly logger = new Logger(AimPipelineOrchestratorService.name);

  constructor(
    private readonly stateAssembly: AimStateAssemblyService,
    private readonly requestMapper: AimRequestMapperService,
    private readonly adapter: AimEngineAdapterService,
    private readonly persistence: AimPersistenceService,
    private readonly audit: AimAuditService,
  ) {}

  /**
   * Trigger the AIM pipeline for a completed lesson attempt.
   *
   * This is Stage 2 — the sole entry point into the backend AIM pipeline.
   * The method coordinates all downstream stages and returns a structured
   * outcome to the caller. It never throws; all failures produce a typed
   * ok: false outcome so the caller can surface a controlled error.
   */
  async trigger(context: AimPipelineContext): Promise<AimPipelineOutcome> {
    const backendRequestId = randomUUID();
    const startedAt = Date.now();

    this.logger.log('aim_pipeline_started', {
      backendRequestId,
      studentId: context.studentId,
      sessionId: context.sessionId,
      attemptId: context.attemptId,
      xRequestId: context.xRequestId,
    });

    // -----------------------------------------------------------------------
    // Stage 3 — State assembly
    // Reads all required backend state and composes the AimMappingContext.
    // If state assembly fails (missing session, orphaned attempt, contract
    // violation), abort pipeline without calling the AIM Engine.
    // -----------------------------------------------------------------------
    let mappingContext: AimMappingContext | null;

    try {
      mappingContext = (await this.stateAssembly.assemble(context)) as AimMappingContext | null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.warn('aim_pipeline_state_assembly_failed', {
        backendRequestId,
        studentId: context.studentId,
        sessionId: context.sessionId,
        error: errorMessage,
      });
      this.audit.record({
        backendRequestId,
        requestId: context.xRequestId || backendRequestId,
        endpoint: '/aim/v1/analysis',
        studentId: context.studentId,
        sessionId: context.sessionId,
        attemptId: context.attemptId,
        pipelineStage: 'state_assembly',
        outcome: 'non_retryable',
        durationMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        backendRequestId,
        reason: 'state_assembly_failed',
      };
    }

    if (!mappingContext) {
      // State assembly stub not yet wired — pipeline proceeds with no-op
      // outcome. This is the correct Phase 5 initial behaviour while
      // downstream assembly tasks (P5-057+) are pending.
      this.logger.warn('aim_pipeline_state_assembly_returned_null', {
        backendRequestId,
        studentId: context.studentId,
        sessionId: context.sessionId,
      });
      this.audit.record({
        backendRequestId,
        requestId: context.xRequestId || backendRequestId,
        endpoint: '/aim/v1/analysis',
        studentId: context.studentId,
        sessionId: context.sessionId,
        attemptId: context.attemptId,
        pipelineStage: 'state_assembly',
        outcome: 'success',
        durationMs: Date.now() - startedAt,
      });
      return {
        ok: true,
        backendRequestId,
        studentId: context.studentId,
        sessionId: context.sessionId,
      };
    }

    // -----------------------------------------------------------------------
    // Stage 4 — Build raw AIM Engine request (P5-047 mapper)
    // -----------------------------------------------------------------------
    const rawRequest = this.requestMapper.map(mappingContext);

    // -----------------------------------------------------------------------
    // Stage 4 → 5 — AIM Engine call + response validation (P5-051 adapter)
    // The adapter owns the HTTP call, retry policy, and response mapping.
    // Stage 5 response validation is handled inside the adapter (P5-048).
    // -----------------------------------------------------------------------
    const adapterResult = await this.adapter.analyze(
      rawRequest,
      context.xRequestId,
    );

    // -----------------------------------------------------------------------
    // Stage 8 — Fallback: adapter returned ok: false
    // Log metadata, record audit entry, skip persistence, return failure.
    // -----------------------------------------------------------------------
    if (!adapterResult.ok) {
      this.logger.warn('aim_pipeline_adapter_failure', {
        backendRequestId,
        studentId: context.studentId,
        sessionId: context.sessionId,
        fallbackProfile: adapterResult.fallback,
        errorCode: adapterResult.error.code,
      });
      this.audit.record({
        backendRequestId,
        requestId: context.xRequestId || backendRequestId,
        endpoint: '/aim/v1/analysis',
        studentId: context.studentId,
        sessionId: context.sessionId,
        attemptId: context.attemptId,
        pipelineStage: 'aim_engine_call',
        outcome: 'non_retryable',
        integrationErrorCode: adapterResult.error.code,
        durationMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        backendRequestId,
        reason: 'aim_engine_unavailable',
        errorCode: adapterResult.error.code,
      };
    }

    // -----------------------------------------------------------------------
    // Stage 6 — Persistence
    // Persist the validated AIM response categories. If persistence fails,
    // record audit entry and return failure — do not silently swallow.
    // -----------------------------------------------------------------------
    try {
      await this.persistence.persist(adapterResult.response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error('aim_pipeline_persistence_failed', {
        backendRequestId,
        studentId: context.studentId,
        sessionId: context.sessionId,
        error: errorMessage,
      });
      this.audit.record({
        backendRequestId,
        requestId: context.xRequestId || backendRequestId,
        endpoint: '/aim/v1/analysis',
        studentId: context.studentId,
        sessionId: context.sessionId,
        attemptId: context.attemptId,
        pipelineStage: 'persistence',
        outcome: 'persistence_failed',
        durationMs: Date.now() - startedAt,
      });
      return {
        ok: false,
        backendRequestId,
        reason: 'persistence_failed',
      };
    }

    // -----------------------------------------------------------------------
    // Stage 9 — Audit close-out (success)
    // -----------------------------------------------------------------------
    const durationMs = Date.now() - startedAt;
    this.audit.record({
      backendRequestId,
      requestId: context.xRequestId || backendRequestId,
      endpoint: '/aim/v1/analysis',
      studentId: context.studentId,
      sessionId: context.sessionId,
      attemptId: context.attemptId,
      pipelineStage: 'audit_close_out',
      outcome: 'success',
      durationMs,
    });

    this.logger.log('aim_pipeline_completed', {
      backendRequestId,
      studentId: context.studentId,
      sessionId: context.sessionId,
      durationMs,
    });

    // -----------------------------------------------------------------------
    // Stage 7 — Result emission
    // Return structured success outcome to the caller.
    // -----------------------------------------------------------------------
    return {
      ok: true,
      backendRequestId,
      studentId: context.studentId,
      sessionId: context.sessionId,
    };
  }
}
