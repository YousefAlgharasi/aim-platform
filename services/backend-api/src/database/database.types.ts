export type DatabaseHealthStatus = 'ok' | 'unavailable';

export interface DatabaseHealthCheckResult {
  readonly status: DatabaseHealthStatus;
  readonly checkedAt: string;
  readonly latencyMs?: number;
  readonly errorCode?: string;
}

export interface DatabaseQueryOptions {
  readonly timeoutMs?: number;
}
