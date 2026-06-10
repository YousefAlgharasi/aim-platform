import { AUTHORIZATION_HEADER, BEARER_SCHEME } from './auth.constants';

export interface AuthorizationHeaderCarrier {
  readonly headers?: Record<string, string | string[] | undefined>;
}

export function extractBearerToken(
  request: AuthorizationHeaderCarrier,
): string | undefined {
  const authorization = readSingleHeader(request.headers?.[AUTHORIZATION_HEADER]);

  if (!authorization) {
    return undefined;
  }

  const parts = authorization.trim().split(/\s+/);

  if (parts.length !== 2) {
    return undefined;
  }

  const [scheme, token] = parts;

  if (scheme.toLowerCase() !== BEARER_SCHEME || !token) {
    return undefined;
  }

  return token;
}

function readSingleHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
