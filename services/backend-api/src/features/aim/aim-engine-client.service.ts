import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { BackendConfigService } from '../../config/backend-config.service';
import { AimAnalysisCallResult, AimAnalysisRawRequest, AimEngineClientHealthResult, AimEngineHealth } from './aim-engine-client.types';

const AIM_ENGINE_HEALTH_PATH = '/health';
const AIM_ENGINE_ANALYSIS_PATH = '/aim/v1/analysis';
const AIM_ENGINE_REQUEST_TIMEOUT_MS = 3000; // health default; analysis uses config

@Injectable()
export class AimEngineClientService {
  private readonly logger = new Logger(AimEngineClientService.name);

  constructor(private readonly config: BackendConfigService) {}

  async checkHealth(): Promise<AimEngineClientHealthResult> {
    const checkedAt = new Date().toISOString();
    const healthUrl = this.buildAimEngineUrl(AIM_ENGINE_HEALTH_PATH);

    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
        signal: AbortSignal.timeout(AIM_ENGINE_REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `AIM Engine health check failed with status ${response.status}`,
        );

        return {
          reachable: false,
          checkedAt,
        };
      }

      const payload = (await response.json()) as AimEngineHealth;

      return {
        reachable: payload.status === 'ok',
        health: payload,
        checkedAt,
      };
    } catch (error) {
      this.logger.warn(
        `AIM Engine health check could not reach service: ${this.toSafeErrorMessage(error)}`,
      );

      return {
        reachable: false,
        checkedAt,
      };
    }
  }

  async requireHealthy(): Promise<AimEngineHealth> {
    const result = await this.checkHealth();

    if (!result.reachable || result.health === undefined) {
      throw new ServiceUnavailableException('AIM Engine is not reachable');
    }

    return result.health;
  }

  /**
   * Send a structured analysis request to POST /aim/v1/analysis.
   *
   * P5-045: sole HTTP caller of the analysis endpoint.
   * - Uses service token from config; token is never logged.
   * - Applies analysis timeout from config (default 5 000 ms per P5-008).
   * - Raw request body is never logged (audit log covers metadata only).
   * - Returns AimAnalysisCallResult; caller (P5-048) validates the body.
   */
  async postAnalysis(
    request: AimAnalysisRawRequest,
    xRequestId: string,
  ): Promise<AimAnalysisCallResult> {
    const analysisUrl = this.buildAimEngineUrl(AIM_ENGINE_ANALYSIS_PATH);
    const timeoutMs = this.config.aimEngine.analysisTimeoutMs;

    try {
      const response = await fetch(analysisUrl, {
        method: 'POST',
        headers: this.buildAuthHeaders(xRequestId),
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.status === 200) {
        const body = (await response.json()) as Record<string, unknown>;
        return {
          ok: true,
          statusCode: 200,
          body: body as unknown as import('./aim-engine-client.types').AimAnalysisRawResponse,
        };
      }

      // Non-200: attempt to parse a safe failure envelope
      let errorCode = 'AIM_ENGINE_ERROR';
      let message = `AIM Engine returned status ${response.status}`;
      try {
        const errBody = (await response.json()) as Record<string, unknown>;
        if (typeof errBody['code'] === 'string') errorCode = errBody['code'];
        if (typeof errBody['message'] === 'string') message = errBody['message'];
      } catch {
        // Ignore parse failures — safe message already set above
      }

      this.logger.warn(
        `AIM Engine analysis returned non-200 status ${response.status} [${errorCode}]`,
      );

      return { ok: false, statusCode: response.status, errorCode, message };
    } catch (error) {
      const isTimeout =
        error instanceof DOMException && error.name === 'TimeoutError';

      this.logger.warn(
        `AIM Engine analysis call failed: ${this.toSafeErrorMessage(error)}`,
      );

      return {
        ok: false,
        statusCode: isTimeout ? 504 : 503,
        errorCode: isTimeout ? 'TRANSPORT_TIMEOUT' : 'TRANSPORT_CONNECTION_ERROR',
        message: isTimeout
          ? 'The analysis request timed out.'
          : 'The AIM Engine is unavailable.',
      };
    }
  }

  /**
   * Build the required HTTP headers for protected AIM Engine endpoints.
   * The service token is included in the Authorization header and must
   * never appear in logs.
   */
  private buildAuthHeaders(xRequestId: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.aimEngine.serviceToken}`,
      'X-Request-Id': xRequestId,
      'X-Backend-Version': '5.0',
      'X-Contract-Version': '1.0',
    };
  }

  private buildAimEngineUrl(path: string): string {
    const baseUrl = this.config.aimEngine.url.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }

  private toSafeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }

    return 'UnknownError';
  }
}
