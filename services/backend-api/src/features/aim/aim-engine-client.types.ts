export interface AimEngineHealth {
  readonly service: string;
  readonly status: string;
  readonly timestamp: string;
  readonly uptime_seconds: number;
  readonly phase: string;
  readonly environment: string;
}

export interface AimEngineClientHealthResult {
  readonly reachable: boolean;
  readonly health?: AimEngineHealth;
  readonly checkedAt: string;
}
