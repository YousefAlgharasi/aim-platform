import { createHmac, createPublicKey, timingSafeEqual, verify as cryptoVerify, KeyObject } from 'crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { AppError } from '../common/errors/app-error';
import { AuthenticatedUser } from './authenticated-user';
import { SupabaseJwtHeader, SupabaseJwtPayload } from './supabase-jwt-payload';

const SUPPORTED_ALGORITHMS = new Set(['HS256', 'ES256']);
const JWT_PART_COUNT = 3;
const JWKS_PATH = '/auth/v1/.well-known/jwks.json';
const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;
const JWKS_FETCH_TIMEOUT_MS = 5000;

interface SupabaseJwk {
  readonly kid: string;
  readonly kty: string;
  readonly crv?: string;
  readonly x?: string;
  readonly y?: string;
}

interface JwksCache {
  readonly keys: ReadonlyMap<string, KeyObject>;
  readonly fetchedAt: number;
}

@Injectable()
export class SupabaseJwtVerifierService {
  private jwksCache: JwksCache | undefined;

  constructor(private readonly config: BackendConfigService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    const jwt = parseJwt(token);

    if (!jwt) {
      throwUnauthorized('Invalid bearer token');
    }

    const algorithm = jwt.header.alg;

    if (!algorithm || !SUPPORTED_ALGORITHMS.has(algorithm)) {
      throwUnauthorized('Unsupported bearer token algorithm');
    }

    if (algorithm === 'HS256') {
      if (!isValidHs256Signature(jwt.signedPart, jwt.signature, this.config.supabase.jwtSecret)) {
        throwUnauthorized('Invalid bearer token signature');
      }
    } else {
      await this.verifyEs256Signature(jwt);
    }

    const payload = jwt.payload;
    const userId = readRequiredSubject(payload);
    const expiresAt = readRequiredExpiry(payload);
    const issuer = readRequiredIssuer(payload);
    const audience = readRequiredAudience(payload);
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt <= now) {
      throwUnauthorized('Bearer token has expired');
    }

    if (issuer !== this.config.supabase.jwtIssuer) {
      throwUnauthorized('Bearer token issuer is invalid');
    }

    if (!audience.includes(this.config.supabase.jwtAudience)) {
      throwUnauthorized('Bearer token audience is invalid');
    }

    return {
      id: userId,
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.role ? { role: payload.role } : {}),
      ...(payload.app_metadata ? { appMetadata: payload.app_metadata } : {}),
      ...(payload.iat ? { issuedAt: payload.iat } : {}),
      expiresAt,
    };
  }

  // ---------------------------------------------------------------------------
  // ES256 (asymmetric signing keys) verification via Supabase's JWKS endpoint.
  // ---------------------------------------------------------------------------

  private async verifyEs256Signature(jwt: ParsedJwt): Promise<void> {
    const kid = jwt.header.kid;

    if (!kid) {
      throwUnauthorized('Bearer token is missing a key id');
    }

    let key = (await this.getJwks()).get(kid);

    if (!key) {
      // The signing key may have rotated since our last fetch — refresh once.
      key = (await this.getJwks({ forceRefresh: true })).get(kid);
    }

    if (!key) {
      throwUnauthorized('Bearer token signing key is unknown');
    }

    const isValid = cryptoVerify(
      'sha256',
      Buffer.from(jwt.signedPart),
      { key, dsaEncoding: 'ieee-p1363' },
      Buffer.from(jwt.signature, 'base64url'),
    );

    if (!isValid) {
      throwUnauthorized('Invalid bearer token signature');
    }
  }

  private async getJwks(options?: { readonly forceRefresh?: boolean }): Promise<ReadonlyMap<string, KeyObject>> {
    const isStale = !this.jwksCache || Date.now() - this.jwksCache.fetchedAt > JWKS_CACHE_TTL_MS;

    if (!options?.forceRefresh && !isStale) {
      return (this.jwksCache as JwksCache).keys;
    }

    const keys = await this.fetchJwks();
    this.jwksCache = { keys, fetchedAt: Date.now() };
    return keys;
  }

  private async fetchJwks(): Promise<ReadonlyMap<string, KeyObject>> {
    const baseUrl = this.config.supabase.url.replace(/\/$/, '');
    const url = `${baseUrl}${JWKS_PATH}`;

    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(JWKS_FETCH_TIMEOUT_MS) });
    } catch {
      throwUnauthorized('Unable to verify bearer token signature');
    }

    if (!response.ok) {
      throwUnauthorized('Unable to verify bearer token signature');
    }

    let body: { keys?: readonly SupabaseJwk[] };
    try {
      body = (await response.json()) as { keys?: readonly SupabaseJwk[] };
    } catch {
      throwUnauthorized('Unable to verify bearer token signature');
    }

    const keys = new Map<string, KeyObject>();

    for (const jwk of body.keys ?? []) {
      if (jwk.kty !== 'EC' || jwk.crv !== 'P-256' || !jwk.x || !jwk.y || !jwk.kid) {
        continue;
      }

      try {
        keys.set(
          jwk.kid,
          createPublicKey({
            key: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y },
            format: 'jwk',
          }),
        );
      } catch {
        // Skip malformed keys rather than failing the whole JWKS fetch.
      }
    }

    return keys;
  }
}

interface ParsedJwt {
  readonly header: SupabaseJwtHeader;
  readonly payload: SupabaseJwtPayload;
  readonly signedPart: string;
  readonly signature: string;
}

function parseJwt(token: string): ParsedJwt | undefined {
  const parts = token.split('.');

  if (parts.length !== JWT_PART_COUNT) {
    return undefined;
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  if (!encodedHeader || !encodedPayload || !signature) {
    return undefined;
  }

  const header = decodeJwtPart<SupabaseJwtHeader>(encodedHeader);
  const payload = decodeJwtPart<SupabaseJwtPayload>(encodedPayload);

  if (!header || !payload) {
    return undefined;
  }

  return {
    header,
    payload,
    signedPart: `${encodedHeader}.${encodedPayload}`,
    signature,
  };
}

function decodeJwtPart<TValue>(encodedPart: string): TValue | undefined {
  try {
    return JSON.parse(Buffer.from(encodedPart, 'base64url').toString('utf8')) as TValue;
  } catch {
    return undefined;
  }
}

function isValidHs256Signature(
  signedPart: string,
  signature: string,
  jwtSecret: string,
): boolean {
  const expectedSignature = createHmac('sha256', jwtSecret)
    .update(signedPart)
    .digest('base64url');

  return safeEquals(signature, expectedSignature);
}

function safeEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function readRequiredSubject(payload: SupabaseJwtPayload): string {
  if (typeof payload.sub !== 'string' || payload.sub.trim() === '') {
    throwUnauthorized('Bearer token subject is missing');
  }

  return payload.sub;
}

function readRequiredExpiry(payload: SupabaseJwtPayload): number {
  if (!Number.isInteger(payload.exp) || payload.exp === undefined) {
    throwUnauthorized('Bearer token expiry is missing');
  }

  return payload.exp;
}

function readRequiredIssuer(payload: SupabaseJwtPayload): string {
  if (typeof payload.iss !== 'string' || payload.iss.trim() === '') {
    throwUnauthorized('Bearer token issuer is missing');
  }

  return payload.iss;
}

function readRequiredAudience(payload: SupabaseJwtPayload): readonly string[] {
  if (typeof payload.aud === 'string' && payload.aud.trim() !== '') {
    return [payload.aud];
  }

  if (
    Array.isArray(payload.aud) &&
    payload.aud.length > 0 &&
    payload.aud.every((audience) => typeof audience === 'string' && audience.trim() !== '')
  ) {
    return payload.aud;
  }

  throwUnauthorized('Bearer token audience is missing');
}

function throwUnauthorized(message: string): never {
  throw new AppError({
    code: ApiErrorCode.UNAUTHORIZED,
    message,
    statusCode: HttpStatus.UNAUTHORIZED,
  });
}
