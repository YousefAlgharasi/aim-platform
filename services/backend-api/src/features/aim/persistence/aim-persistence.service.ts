/**
 * AIM persistence service — Phase 5 skeleton (P5-043).
 *
 * Owns Stage 6 of the backend AIM pipeline: persists validated AIM Engine
 * response categories to the Phase 5 tables.
 *
 * Responsibilities:
 *   P5-057 — Implement Student Skill State Update Service (not yet wired here)
 *   P5-058 — Implement Weakness Update Service (wired — this task)
 *   P5-059 — Implement Difficulty Decision Service (not yet wired here)
 *   P5-060 — Implement AIM Recommendations Service (not yet wired here)
 *   P5-061 — Implement Review Schedule Service (not yet wired here)
 *   P5-062 — Implement Session Summary Service (not yet wired here)
 *
 * Scope rules:
 * - This service accepts input ONLY from the pipeline orchestrator.
 * - It never accepts client-submitted values for any AIM-owned field.
 * - It never persists an unvalidated AIM response.
 * - Persistence is transactional per AIM response — partial writes roll back
 *   (full transaction wrapping owned by P5-065; not yet applied here).
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';
import { AimValidatedResponse } from '../adapter/aim-response-mapper.types';
import { WeaknessUpdateService } from './weakness-update.service';

@Injectable()
export class AimPersistenceService {
  private readonly logger = new Logger(AimPersistenceService.name);

  constructor(private readonly weaknessUpdate: WeaknessUpdateService) {}

  /**
   * Persist a fully validated AIM Engine response to the Phase 5 tables.
   *
   * P5-058: weakness records are persisted here. Other categories
   * (skill state, difficulty decision, recommendations, review schedule,
   * session summary) remain stubbed pending P5-057/P5-059/P5-060/P5-061/
   * P5-062 wiring.
   */
  async persist(validatedResponse: AimValidatedResponse): Promise<void> {
    const { studentId, categories } = validatedResponse;

    if (categories.weaknessRecords.length > 0) {
      await this.weaknessUpdate.upsertMany(studentId, categories.weaknessRecords);
    }

    this.logger.warn(
      'AimPersistenceService.persist: skill_state/difficulty_decision/recommendations/' +
        'review_schedule/session_summary not yet wired (P5-057/P5-059/P5-060/P5-061/P5-062)',
    );
  }
}
