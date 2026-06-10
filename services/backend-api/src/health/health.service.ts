import { Injectable } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { HealthResponse, VersionResponse } from './health.types';

const SERVICE_NAME = 'backend-api' as const;
const PHASE_NAME = 'phase-1-system-foundation' as const;
const FALLBACK_VERSION = '0.1.0';

@Injectable()
export class HealthService {
  constructor(private readonly config: BackendConfigService) {}

  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: this.config.nodeEnv,
    };
  }

  getVersion(): VersionResponse {
    return {
      service: SERVICE_NAME,
      version: process.env.npm_package_version ?? FALLBACK_VERSION,
      phase: PHASE_NAME,
      environment: this.config.nodeEnv,
    };
  }
}
