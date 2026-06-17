/**
 * AIM persistence service — Phase 5 skeleton (P5-043).
 *
 * Owns Stage 6 of the backend AIM pipeline: persists validated AIM Engine
 * response categories to the Phase 5 tables.
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-057 — Implement Student Skill State Update Service
 *   P5-058 — Implement Weakness Update Service
 *   P5-059 — Implement Difficulty Decision Service
 *   P5-060 — Implement AIM Recommendations Service
 *   P5-061 — Implement Review Schedule Service
 *   P5-062 — Implement Session Summary Service
 *
 * Scope rules:
 * - This service accepts input ONLY from the pipeline orchestrator.
 * - It never accepts client-submitted values for any AIM-owned field.
 * - It never persists an unvalidated AIM response.
 * - Persistence is transactional per AIM response — partial writes roll back.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimPersistenceService {
  private readonly logger = new Logger(AimPersistenceService.name);

  /**
   * Persist a fully validated AIM Engine response to the Phase 5 tables.
   *
   * Implemented by P5-057 through P5-062.
   */
  async persist(_validatedResponse: unknown): Promise<void> {
    // Stub — implementation owned by P5-057 through P5-062.
    this.logger.warn(
      'AimPersistenceService.persist: not yet implemented (P5-057)',
    );
  }
}
