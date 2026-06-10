import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { BackendConfigService } from '../../config/backend-config.service';
import { AimEngineClientHealthResult, AimEngineHealth } from './aim-engine-client.types';

const AIM_ENGINE_HEALTH_PATH = '/health';
const AIM_ENGINE_REQUEST_TIMEOUT_MS = 3000;

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
