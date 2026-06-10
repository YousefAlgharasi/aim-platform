import { createHmac, timingSafeEqual } from 'crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { AppError } from '../common/errors/app-error';
import { AuthenticatedUser } from './authenticated-user';
import { SupabaseJwtHeader, SupabaseJwtPayload } from './supabase-jwt-payload';

const SUPABASE_HS256_ALGORITHM = 'HS256';
const JWT_PART_COUNT = 3;

@Injectable()
export class SupabaseJwtVerifierService {
  constructor(private readonly config: BackendConfigService) {}

  async verify(token: string): Promise<AuthenticatedUser> {
    const jwt = parseJwt(token);

    if (!jwt) {
      throwUnauthorized('Invalid bearer token');
    }

    if (jwt.header.alg !== SUPABASE_HS256_ALGORITHM) {
      throwUnauthorized('Unsupported bearer token algorithm');
    }

    if (!isValidHs256Signature(jwt.signedPart, jwt.signature, this.config.supabase.jwtSecret)) {
      throwUnauthorized('Invalid bearer token signature');
    }

    const payload = jwt.payload;
    const userId = readRequiredSubject(payload);
    const expiresAt = readRequiredExpiry(payload);
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt <= now) {
      throwUnauthorized('Bearer token has expired');
    }

    return {
      id: userId,
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.role ? { role: payload.role } : {}),
      ...(payload.app_metadata ? { appMetadata: payload.app_metadata } : {}),
      ...(payload.user_metadata ? { userMetadata: payload.user_metadata } : {}),
      ...(payload.iat ? { issuedAt: payload.iat } : {}),
      expiresAt,
    };
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

function throwUnauthorized(message: string): never {
  throw new AppError({
    code: ApiErrorCode.UNAUTHORIZED,
    message,
    statusCode: HttpStatus.UNAUTHORIZED,
  });
}
