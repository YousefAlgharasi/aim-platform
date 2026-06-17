/**
 * AIM pipeline orchestrator — Phase 5 skeleton (P5-043).
 *
 * Owns Stage 2 (trigger) and coordinates Stages 3–8 of the backend AIM
 * pipeline defined in docs/phase-5/backend-aim-pipeline-map.md.
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-056 — Implement AIM Analysis Orchestrator
 *
 * Scope rules:
 * - This service is the only entry point into the backend AIM pipeline.
 * - It never exposes AIM Engine internals to client-facing controllers.
 * - It never persists an unvalidated AIM response.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimPipelineOrchestratorService {
  private readonly logger = new Logger(AimPipelineOrchestratorService.name);

  /**
   * Trigger the AIM pipeline for a completed attempt or session event.
   *
   * Implemented by P5-056. This stub marks the Stage 2 boundary.
   */
  async trigger(_context: unknown): Promise<void> {
    // Stub — implementation owned by P5-056.
    this.logger.warn(
      'AimPipelineOrchestratorService.trigger: not yet implemented (P5-056)',
    );
  }
}
