/**
 * AIM Engine health check service — Phase 5 (P5-046).
 *
 * Wraps AimEngineClientService.checkHealth() with Phase 5 semantics:
 *   - Returns a structured AimAvailabilityResult.
 *   - Provides requireAvailable() for use before pipeline calls.
 *   - Logs metadata only; never logs the service token or AIM internals.
 *
 * This service is the backend's single point for checking AIM Engine
 * availability. The pipeline orchestrator (P5-056) calls requireAvailable()
 * before dispatching Stage 4 (AIM Engine call).
 *
 * Scope rules:
 * - Read-only check against GET /health (P5-019 endpoint).
 * - Never exposes raw AIM Engine health payloads to clients.
 * - Never calls POST /aim/v1/analysis (that is AimEngineClientService's role).
 * - No secrets, service-role keys, database credentials, or AI provider keys
 *   are stored or logged here.
 */
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AimEngineClientService } from './aim-engine-client.service';

export interface AimAvailabilityResult {
  /** Whether the AIM Engine is reachable and reports a healthy status. */
  readonly available: boolean;
  /** ISO-8601 UTC timestamp of when the check was performed. */
  readonly checkedAt: string;
  /**
   * AIM Engine phase identifier, if reachable.
   * Useful for verifying the engine is on the expected phase.
   */
  readonly enginePhase?: string;
  /**
   * AIM Engine environment name, if reachable.
   * Included for operational awareness; never contains secrets.
   */
  readonly engineEnvironment?: string;
}

@Injectable()
export class AimHealthCheckService {
  private readonly logger = new Logger(AimHealthCheckService.name);

  constructor(private readonly aimEngineClient: AimEngineClientService) {}

  /**
   * Check AIM Engine availability.
   *
   * Returns a safe AimAvailabilityResult. Never throws; callers that need
   * a hard failure on unavailability should use requireAvailable().
   */
  async checkAvailability(): Promise<AimAvailabilityResult> {
    let result;
    try {
      result = await this.aimEngineClient.checkHealth();
    } catch {
      const checkedAt = new Date().toISOString();
      this.logger.warn('AIM Engine health check threw unexpectedly', { checkedAt });
      return { available: false, checkedAt };
    }

    if (!result.reachable || !result.health) {
      this.logger.warn('AIM Engine is not available', {
        checkedAt: result.checkedAt,
      });

      return {
        available: false,
        checkedAt: result.checkedAt,
      };
    }

    this.logger.debug('AIM Engine is available', {
      phase: result.health.phase,
      environment: result.health.environment,
      checkedAt: result.checkedAt,
    });

    return {
      available: true,
      checkedAt: result.checkedAt,
      enginePhase: result.health.phase,
      engineEnvironment: result.health.environment,
    };
  }

  /**
   * Assert AIM Engine availability, throwing if unavailable.
   *
   * Used by the pipeline orchestrator (P5-056) before Stage 4 to gate
   * the AIM Engine call. On failure, logs metadata only and throws
   * ServiceUnavailableException with a safe message — no engine internals
   * or token values are included in the exception.
   */
  async requireAvailable(): Promise<AimAvailabilityResult> {
    const result = await this.checkAvailability();

    if (!result.available) {
      this.logger.warn('AIM Engine availability check failed; aborting pipeline', {
        checkedAt: result.checkedAt,
      });

      throw new ServiceUnavailableException(
        'AIM Engine is not available. Please try again later.',
      );
    }

    return result;
  }
}
