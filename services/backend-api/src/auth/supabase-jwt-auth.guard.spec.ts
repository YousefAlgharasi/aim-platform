import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user';
import { IS_PUBLIC_ROUTE_KEY } from './auth.constants';
import { SupabaseJwtAuthGuard } from './supabase-jwt-auth.guard';
import { SupabaseJwtVerifierService } from './supabase-jwt-verifier.service';

describe('SupabaseJwtAuthGuard', () => {
  const verifiedUser: AuthenticatedUser = {
    id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
    email: 'student@example.com',
    expiresAt: 1_900_000_000,
  };

  it('attaches the verified user for requests with a bearer token', async () => {
    const request = createRequest({
      authorization: 'Bearer valid-token',
    });
    const verifier = createVerifier(verifiedUser);
    const guard = new SupabaseJwtAuthGuard(createReflector(false), verifier);

    await expect(guard.canActivate(createHttpContext(request))).resolves.toBe(true);

    expect(verifier.verify).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(verifiedUser);
  });

  it('rejects protected requests without a bearer token', async () => {
    const guard = new SupabaseJwtAuthGuard(createReflector(false), createVerifier(verifiedUser));

    await expect(guard.canActivate(createHttpContext(createRequest()))).rejects.toMatchObject({
      code: ApiErrorCode.UNAUTHORIZED,
      statusCode: 401,
      message: 'Missing bearer token',
    });
  });

  it('allows public routes without reading the authorization header', async () => {
    const verifier = createVerifier(verifiedUser);
    const guard = new SupabaseJwtAuthGuard(createReflector(true), verifier);

    await expect(guard.canActivate(createHttpContext(createRequest()))).resolves.toBe(true);

    expect(verifier.verify).not.toHaveBeenCalled();
  });
});

function createRequest(headers: AuthenticatedRequest['headers'] = {}): AuthenticatedRequest {
  return { headers };
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
