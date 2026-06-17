/**
 * AIM state assembly service — Phase 5 skeleton (P5-043).
 *
 * Owns Stage 3 of the backend AIM pipeline: reads all required backend state
 * and composes the structured AIM Engine request payload (P5-009, P5-010,
 * P5-021).
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-047 — Implement AIM Request Mapper
 *   P5-052 — Implement Session Start Service
 *   P5-053 — Implement Session Event Service
 *   P5-054 — Implement Lesson Attempt Service
 *   P5-055 — Implement Attempt Skill Context Service
 *
 * Scope rules:
 * - This service reads backend state; it never computes mastery, level,
 *   weakness, difficulty, recommendations, review schedules, retention,
 *   or frustration. Those are exclusively AIM Engine outputs.
 * - Speed and response-time signals are passed through as raw behavioral
 *   context only.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimStateAssemblyService {
  private readonly logger = new Logger(AimStateAssemblyService.name);

  /**
   * Assemble the AIM Engine request payload from backend-persisted state.
   *
   * Implemented by P5-047 and P5-052 through P5-055.
   */
  async assemble(_pipelineContext: unknown): Promise<unknown> {
    // Stub — implementation owned by P5-047 through P5-055.
    this.logger.warn(
      'AimStateAssemblyService.assemble: not yet implemented (P5-047)',
    );
    return null;
  }
}
