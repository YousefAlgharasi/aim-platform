import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryResult } from 'pg';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { UsersService } from '../features/users';
import { UserRow } from '../features/users/users.types';
import { AuthController } from './auth.controller';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user';
import { IS_PUBLIC_ROUTE_KEY } from './auth.constants';
import { readCurrentUserFromContext } from './current-user.decorator';
import { SessionValidationService } from './session-validation.service';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

describe('backend auth foundation suite', () => {
  const verifiedUser: AuthenticatedUser = {
    id: 'auth-user-001',
    email: 'learner@example.com',
    role: 'authenticated',
    appMetadata: {
      roles: ['student'],
      unsafe_internal_note: 'must not be returned',
    },
    issuedAt: 1_800_000_000,
    expiresAt: 1_900_000_000,
  };

  it('verifies a protected bearer token and exposes the current request user', async () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: 'Bearer valid-token' },
    };
    const verifier = createVerifier(verifiedUser);
    const guard = new SupabaseJwtAuthGuard(createReflector(false), verifier);

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(true);

    expect(verifier.verify).toHaveBeenCalledWith('valid-token');
    expect(readCurrentUserFromContext(createHttpContext(request))).toEqual(verifiedUser);
  });

  it('rejects malformed authorization headers before token verification', async () => {
    const request: AuthenticatedRequest = {
      headers: { authorization: 'Basic not-a-bearer-token' },
    };
    const verifier = createVerifier(verifiedUser);
    const guard = new SupabaseJwtAuthGuard(createReflector(false), verifier);

    await expect(guard.canActivate(createHttpContext(request))).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: 401,
    });
    expect(verifier.verify).not.toHaveBeenCalled();
  });

  it('returns /auth/me without unsafe JWT metadata or internal auth fields', () => {
    const response = new AuthController().getMe(verifiedUser);

    expect(response).toEqual({
      user: {
        id: 'auth-user-001',
        email: 'learner@example.com',
      },
      session: {
        authenticated: true,
        sessionStatus: 'active',
        expiresAt: 1_900_000_000,
      },
      roles: ['student'],
      permissions: [],
    });
    expect(response).not.toHaveProperty('appMetadata');
    expect(response).not.toHaveProperty('issuedAt');
    expect(response.user).not.toHaveProperty('supabaseAuthUid');
  });

  it('bootstraps an internal user from verified Supabase identity only', async () => {
    const db = createDb([
      {
        rows: [
          {
            id: 'user-001',
            supabase_auth_uid: 'auth-user-001',
            email: 'learner@example.com',
            phone: '+10000000000',
            user_type: 'student',
            status: 'active',
            created_at: timestamp,
            updated_at: timestamp,
          },
        ],
      },
    ]);
    const service = new UsersService(db as never);

    const result = await service.upsertBySupabaseUid({
      supabaseAuthUid: verifiedUser.id,
      email: verifiedUser.email,
      phone: '+10000000000',
    });

    expect(result).toMatchObject({
      id: 'user-001',
      supabaseAuthUid: 'auth-user-001',
      email: 'learner@example.com',
      phone: '+10000000000',
      userType: 'student',
      status: 'active',
    });
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (supabase_auth_uid)'),
      ['auth-user-001', 'learner@example.com', '+10000000000'],
    );
    expect(db.query.mock.calls[0][0]).not.toContain('service_role');
    expect(db.query.mock.calls[0][0]).not.toContain('password');
  });

  it('fails session validation fast when the Supabase Auth UID is missing', async () => {
    const db = createDb([]);
    const service = new SessionValidationService(db as never);

    await expect(service.validate('   ')).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: 401,
    });
    expect(db.query).not.toHaveBeenCalled();
  });
});

const timestamp = '2026-06-12T00:00:00.000Z';

type QueryMockResult = Partial<QueryResult<UserRow>>;

function createDb(results: QueryMockResult[]) {
  return {
    query: jest.fn().mockImplementation(() => {
      const result = results.shift() ?? { rows: [] };

      return Promise.resolve({
        rowCount: result.rows?.length ?? 0,
        rows: result.rows ?? [],
      });
    }),
  };
}

function createVerifier(user: AuthenticatedUser): SupabaseJwtVerifierService {
  return {
    verify: jest.fn().mockResolvedValue(user),
  } as unknown as SupabaseJwtVerifierService;
}

function createReflector(isPublicRoute: boolean): Reflector {
  return {
    getAllAndOverride: jest.fn((metadataKey: string) => {
      if (metadataKey === IS_PUBLIC_ROUTE_KEY) {
        return isPublicRoute;
      }

      return undefined;
    }),
  } as unknown as Reflector;
}

function createHttpContext(request: AuthenticatedRequest): ExecutionContext {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => request),
    })),
  } as unknown as ExecutionContext;
}
