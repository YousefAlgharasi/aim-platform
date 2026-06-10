import { randomUUID } from 'crypto';

export const REQUEST_ID_HEADER = 'x-request-id';
const MAX_REQUEST_ID_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]+$/;

export interface RequestIdCarrier {
  requestId?: string;
  headers?: Record<string, string | string[] | undefined>;
}

export function createRequestId(): string {
  return randomUUID();
}

export function getRequestId(request: RequestIdCarrier): string | undefined {
  return request.requestId ?? readRequestIdHeader(request.headers);
}

export function readRequestIdHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
): string | undefined {
  return normalizeRequestId(readSingleHeader(headers?.[REQUEST_ID_HEADER]));
}

export function normalizeRequestId(value: string | undefined): string | undefined {
  const requestId = value?.trim();

  if (!requestId) {
    return undefined;
  }

  if (requestId.length > MAX_REQUEST_ID_LENGTH) {
    return undefined;
  }

  if (!REQUEST_ID_PATTERN.test(requestId)) {
    return undefined;
  }

  return requestId;
}

function readSingleHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
