import { createHmac, createPrivateKey, generateKeyPairSync, sign as cryptoSign } from 'crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { BackendConfigService } from '../config/backend-config.service';
import { SupabaseJwtPayload } from './supabase-jwt-payload';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

const jwtSecret = 'test-jwt-secret';
const jwtIssuer = 'https://test-project.supabase.co';
const jwtAudience = 'authenticated';

const ecKeyPair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const ecKid = 'test-ec-key-1';

const originalFetch = global.fetch;

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

  describe('ES256 (asymmetric signing keys)', () => {
    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('verifies a Supabase access token signed with an ES256 key from the JWKS endpoint', async () => {
      global.fetch = jest.fn().mockResolvedValue(jwksResponse()) as unknown as typeof fetch;

      const es256Service = new SupabaseJwtVerifierService(createConfig());
      const token = signEs256Jwt({
        aud: jwtAudience,
        exp: futureTimestamp(),
        iat: pastTimestamp(),
        iss: jwtIssuer,
        sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
        email: 'student@example.com',
        role: 'authenticated',
      });

      await expect(es256Service.verify(token)).resolves.toMatchObject({
        id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
        email: 'student@example.com',
        role: 'authenticated',
      });
    });

    it('rejects an ES256 token signed with a key not present in the JWKS', async () => {
      global.fetch = jest.fn().mockResolvedValue(jwksResponse()) as unknown as typeof fetch;

      const es256Service = new SupabaseJwtVerifierService(createConfig());
      const otherKeyPair = generateKeyPairSync('ec', { namedCurve: 'P-256' });
      const token = signEs256Jwt(
        {
          aud: jwtAudience,
          exp: futureTimestamp(),
          iss: jwtIssuer,
          sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
        },
        { kid: 'unknown-kid', privateKey: otherKeyPair.privateKey },
      );

      await expect(es256Service.verify(token)).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Bearer token signing key is unknown',
      });
    });

    it('rejects unsupported algorithms', async () => {
      const es256Service = new SupabaseJwtVerifierService(createConfig());
      const encodedHeader = encodeJwtPart({ alg: 'none', typ: 'JWT' });
      const encodedPayload = encodeJwtPart({
        aud: jwtAudience,
        exp: futureTimestamp(),
        iss: jwtIssuer,
        sub: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
      });
      const token = `${encodedHeader}.${encodedPayload}.sig`;

      await expect(es256Service.verify(token)).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unsupported bearer token algorithm',
      });
    });
  });
});

function jwksResponse(): Response {
  const publicJwk = ecKeyPair.publicKey.export({ format: 'jwk' }) as {
    x: string;
    y: string;
    crv: string;
    kty: string;
  };

  return {
    ok: true,
    json: async () => ({
      keys: [{ ...publicJwk, kid: ecKid, use: 'sig', alg: 'ES256' }],
    }),
  } as unknown as Response;
}

function signEs256Jwt(
  payload: SupabaseJwtPayload,
  keyOverride?: { readonly kid: string; readonly privateKey: ReturnType<typeof createPrivateKey> },
): string {
  const encodedHeader = encodeJwtPart({
    alg: 'ES256',
    typ: 'JWT',
    kid: keyOverride?.kid ?? ecKid,
  });
  const encodedPayload = encodeJwtPart(payload);
  const signedPart = `${encodedHeader}.${encodedPayload}`;
  const signature = cryptoSign(
    'sha256',
    Buffer.from(signedPart),
    { key: keyOverride?.privateKey ?? ecKeyPair.privateKey, dsaEncoding: 'ieee-p1363' },
  ).toString('base64url');

  return `${signedPart}.${signature}`;
}

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
