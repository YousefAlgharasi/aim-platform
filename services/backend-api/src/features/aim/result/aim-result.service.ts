/**
 * AIM result service — Phase 5 skeleton (P5-043).
 *
 * Owns Stage 7 of the backend AIM pipeline: read-only APIs that expose
 * persisted, backend-validated AIM results to authorized consumers.
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-064 — Implement AIM Result Read API
 *
 * Scope rules:
 * - Read-only. No write paths for any AIM-owned value.
 * - Every response is guarded by Phase 2 permission guards.
 * - This service never forwards raw AIM Engine response bodies to clients.
 * - This service never proxies a live AIM Engine call to populate a missing
 *   result; it returns last-validated-persisted values only.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimResultService {
  private readonly logger = new Logger(AimResultService.name);

  /**
   * Return the latest persisted AIM results for a student.
   *
   * Implemented by P5-064.
   */
  async getForStudent(_studentId: string): Promise<unknown> {
    // Stub — implementation owned by P5-064.
    this.logger.warn(
      'AimResultService.getForStudent: not yet implemented (P5-064)',
    );
    return null;
  }
}
