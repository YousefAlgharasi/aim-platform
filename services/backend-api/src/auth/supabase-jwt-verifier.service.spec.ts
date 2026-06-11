import { createHmac } from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { BackendConfigService } from '../config/backend-config.service';
import { SupabaseJwtPayload } from './supabase-jwt-payload';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

const jwtSecret = 'test-jwt-secret';
const jwtIssuer = 'https://test-project.supabase.co';
const jwtAudience = 'authenticated';

describe('SupabaseJwtVerifierService', () => {
  const service = new SupabaseJwtVerifierService(createConfig());

  it('verifies a Supabase access token with configured issuer and audience', async () => {
    const token = signJwt({
      aud: jwtAudience,
      exp: futureTimestamp(),
      iat: pastTimestamp(),
      iss: jwtIssuer,
      sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
      email: 'student@example.com',
      role: 'authenticated',
      app_metadata: {
        aim_roles: ['student'],
      },
      user_metadata: {
        display_name: 'Student',
      },
    });

    await expect(service.verify(token)).resolves.toEqual({
      id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
      email: 'student@example.com',
      role: 'authenticated',
      appMetadata: {
        aim_roles: ['student'],
      },
      userMetadata: {
        display_name: 'Student',
      },
      issuedAt: expect.any(Number),
      expiresAt: expect.any(Number),
    });
  });

  it('rejects tokens issued for another Supabase project', async () => {
    const token = signJwt({
      aud: jwtAudience,
      exp: futureTimestamp(),
      iss: 'https://other-project.supabase.co',
      sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
    });

    await expect(service.verify(token)).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Bearer token issuer is invalid',
    });
  });

  it('rejects tokens issued for a different audience', async () => {
    const token = signJwt({
      aud: 'anon',
      exp: futureTimestamp(),
      iss: jwtIssuer,
      sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
    });

    await expect(service.verify(token)).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Bearer token audience is invalid',
    });
  });
});

function createConfig(): BackendConfigService {
  return {
    supabase: {
      url: jwtIssuer,
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-role-key',
      jwtSecret,
      jwtIssuer,
      jwtAudience,
    },
  } as BackendConfigService;
}

function signJwt(payload: SupabaseJwtPayload): string {
  const encodedHeader = encodeJwtPart({
    alg: 'HS256',
    typ: 'JWT',
  });
  const encodedPayload = encodeJwtPart(payload);
  const signedPart = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', jwtSecret).update(signedPart).digest('base64url');

  return `${signedPart}.${signature}`;
}

function encodeJwtPart(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function futureTimestamp(): number {
  return Math.floor(Date.now() / 1000) + 60;
}

function pastTimestamp(): number {
  return Math.floor(Date.now() / 1000) - 60;
}
