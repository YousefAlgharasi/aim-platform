/**
 * AIM Engine adapter service — Phase 5 skeleton (P5-043).
 *
 * This service is the sole backend caller of the AIM Engine.
 * No other module may call the AIM Engine directly.
 *
 * Responsibilities (to be implemented in downstream tasks):
 *   P5-045 — Implement AIM Engine HTTP Client
 *   P5-049 — Add AIM Adapter Timeout Policy
 *   P5-050 — Add AIM Adapter Error Handling
 *
 * Scope rules:
 * - Only this service sends requests to POST /aim/v1/analysis.
 * - Flutter, Admin Dashboard, and all clients are prohibited from calling
 *   the AIM Engine directly.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 * - Speed and response-time fields are forwarded as raw behavioral context
 *   only — they must never be used to compute mastery, level, difficulty,
 *   weakness, recommendations, review schedules, retention, or frustration.
 */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AimEngineAdapterService {
  private readonly logger = new Logger(AimEngineAdapterService.name);

  /**
   * Send a structured AIM analysis request to the AIM Engine and return
   * the validated response.
   *
   * Implemented by P5-045 (HTTP client), P5-049 (timeout policy),
   * P5-050 (error handling). This stub documents the contract boundary.
   */
  async analyze(_request: unknown): Promise<unknown> {
    // Stub — implementation owned by P5-045 through P5-050.
    this.logger.warn('AimEngineAdapterService.analyze: not yet implemented (P5-045)');
    return null;
  }
}
