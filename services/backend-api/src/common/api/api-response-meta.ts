import { ApiResponseMeta } from './api-response.types';

const REQUEST_ID_HEADER = 'x-request-id';

export interface RequestLike {
  readonly method?: string;
  readonly url?: string;
  readonly path?: string;
  readonly originalUrl?: string;
  readonly headers?: Record<string, string | string[] | undefined>;
}

export function createApiResponseMeta(request: RequestLike): ApiResponseMeta {
  const requestId = readSingleHeader(request.headers?.[REQUEST_ID_HEADER]);

  return {
    timestamp: new Date().toISOString(),
    path: request.originalUrl ?? request.url ?? request.path ?? '/',
    method: request.method ?? 'UNKNOWN',
    ...(requestId ? { requestId } : {}),
  };
}

function readSingleHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
