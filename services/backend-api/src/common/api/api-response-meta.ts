import { getRequestId, RequestIdCarrier } from '../logging/request-id';
import { ApiResponseMeta } from './api-response.types';

export interface RequestLike extends RequestIdCarrier {
  readonly method?: string;
  readonly url?: string;
  readonly path?: string;
  readonly originalUrl?: string;
}

export function createApiResponseMeta(request: RequestLike): ApiResponseMeta {
  const requestId = getRequestId(request);

  return {
    timestamp: new Date().toISOString(),
    path: request.originalUrl ?? request.url ?? request.path ?? '/',
    method: request.method ?? 'UNKNOWN',
    ...(requestId ? { requestId } : {}),
  };
}
