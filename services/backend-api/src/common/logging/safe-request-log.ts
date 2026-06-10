import { getRequestId, RequestIdCarrier } from './request-id';

export type RequestLogOutcome = 'completed' | 'failed';

export interface RequestForLogging extends RequestIdCarrier {
  method?: string;
  path?: string;
  url?: string;
  originalUrl?: string;
}

export interface SafeRequestLogFields {
  readonly outcome: RequestLogOutcome;
  readonly requestId?: string;
  readonly method: string;
  readonly path: string;
  readonly statusCode: number;
  readonly durationMs: number;
}

export function buildSafeRequestLogFields(
  outcome: RequestLogOutcome,
  request: RequestForLogging,
  statusCode: number,
  durationMs: number,
): SafeRequestLogFields {
  const requestId = getRequestId(request);

  return {
    outcome,
    ...(requestId ? { requestId } : {}),
    method: request.method ?? 'UNKNOWN',
    path: safePath(request),
    statusCode,
    durationMs,
  };
}

export function formatSafeRequestLog(fields: SafeRequestLogFields): string {
  return JSON.stringify(fields);
}

function safePath(request: RequestForLogging): string {
  const rawPath = request.path ?? request.url ?? request.originalUrl ?? '/';
  const [pathWithoutQuery] = rawPath.split('?');

  return pathWithoutQuery || '/';
}
