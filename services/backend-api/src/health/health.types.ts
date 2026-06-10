import { BackendNodeEnv } from '../config/backend-config.types';

export interface HealthResponse {
  readonly status: 'ok';
  readonly service: 'backend-api';
  readonly timestamp: string;
  readonly uptimeSeconds: number;
  readonly environment: BackendNodeEnv;
}

export interface VersionResponse {
  readonly service: 'backend-api';
  readonly version: string;
  readonly phase: 'phase-1-system-foundation';
  readonly environment: BackendNodeEnv;
}
