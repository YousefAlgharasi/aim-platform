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

/**
 * Phase 5 — AIM Engine analysis call types (P5-045).
 *
 * The raw request body sent to POST /aim/v1/analysis.
 * Full field-level shape is defined by the P5-021 Python schema; this type
 * carries the envelope fields the HTTP client needs to build the request.
 * Downstream tasks (P5-047, P5-048) own the full DTO mapping.
 */
export interface AimAnalysisRawRequest {
  readonly backendRequestId: string;
  readonly [key: string]: unknown;
}

/**
 * Raw parsed JSON body returned by the AIM Engine on a successful 200.
 * P5-048 (response mapper) validates this against the full response contract.
 */
export interface AimAnalysisRawResponse {
  readonly backendRequestId: string;
  readonly contractVersion: string;
  readonly studentId: string;
  readonly sessionId: string;
  readonly generatedAt: string;
  readonly categories: Record<string, unknown>;
}

/**
 * Structured result from the AIM Engine analysis HTTP call.
 * Encapsulates success/failure without exposing raw HTTP internals.
 */
export type AimAnalysisCallResult =
  | { readonly ok: true; readonly body: AimAnalysisRawResponse; readonly statusCode: 200 }
  | { readonly ok: false; readonly statusCode: number; readonly errorCode: string; readonly message: string };
