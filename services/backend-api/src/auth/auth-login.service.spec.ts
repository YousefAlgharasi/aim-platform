import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { BackendConfigService } from '../config/backend-config.service';
import { AuthLoginService } from './auth-login.service';

const originalFetch = global.fetch;

describe('AuthLoginService', () => {
  let service: AuthLoginService;

  beforeEach(() => {
    service = new AuthLoginService(createConfig());
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('login', () => {
    it('maps invalid credentials to a clear message', async () => {
      mockFetch(400, { error_code: 'invalid_credentials', msg: 'Invalid login credentials' });

      await expect(service.login({ email: 'a@b.com', password: 'wrong' })).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect email or password.',
      });
    });

    it('maps unconfirmed email to a forbidden error', async () => {
      mockFetch(400, { error_code: 'email_not_confirmed', msg: 'Email not confirmed' });

      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toMatchObject({
        code: ApiErrorCode.FORBIDDEN,
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Please confirm your email address before signing in.',
      });
    });

    it('maps rate limiting to too many requests', async () => {
      mockFetch(429, { error_code: 'over_request_rate_limit', msg: 'rate limit exceeded' });

      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toMatchObject({
        code: ApiErrorCode.TOO_MANY_REQUESTS,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many attempts. Please wait a moment and try again.',
      });
    });

    it('maps unreachable Supabase to a service unavailable error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toMatchObject({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    });

    it('maps unexpected errors to a safe generic message', async () => {
      mockFetch(500, { msg: 'something internal' });

      await expect(service.login({ email: 'a@b.com', password: 'pw' })).rejects.toMatchObject({
        code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'The authentication service returned an unexpected error.',
      });
    });
  });

  describe('refresh', () => {
    it('maps invalid/expired refresh tokens to a session-expired message', async () => {
      mockFetch(401, { error_code: 'invalid_grant', msg: 'Invalid Refresh Token' });

      await expect(service.refresh({ refreshToken: 'stale' })).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Your session has expired. Please sign in again.',
      });
    });
  });

  describe('register', () => {
    it('maps duplicate email registration to a conflict error', async () => {
      mockFetch(422, { error_code: 'user_already_exists', msg: 'User already registered' });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).rejects.toMatchObject({
        code: ApiErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
        message: 'An account with this email already exists. Try signing in instead.',
      });
    });

    it('maps weak passwords to a bad request error', async () => {
      mockFetch(400, { error_code: 'weak_password', msg: 'Password is too short' });

      await expect(service.register({ email: 'a@b.com', password: '123' })).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please choose a stronger password (at least 6 characters).',
      });
    });

    it('maps invalid email format to a bad request error', async () => {
      mockFetch(400, { error_code: 'validation_failed', msg: 'Unable to validate email address: invalid format' });

      await expect(service.register({ email: 'not-an-email', password: 'password123' })).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please enter a valid email address.',
      });
    });

    it('maps rate limiting to too many requests', async () => {
      mockFetch(429, { error_code: 'over_email_send_rate_limit', msg: 'rate limit exceeded' });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).rejects.toMatchObject({
        code: ApiErrorCode.TOO_MANY_REQUESTS,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many attempts. Please wait a moment and try again.',
      });
    });

    it('maps unexpected errors to a safe generic message', async () => {
      mockFetch(500, { msg: 'something internal' });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).rejects.toMatchObject({
        code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
        statusCode: HttpStatus.BAD_GATEWAY,
        message: 'The authentication service returned an unexpected error.',
      });
    });
  });
});

function mockFetch(status: number, body: Record<string, unknown>): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

function createConfig(): BackendConfigService {
  return {
    supabase: {
      url: 'https://test-project.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-role-key',
      jwtSecret: 'test-jwt-secret',
      jwtIssuer: 'https://test-project.supabase.co',
      jwtAudience: 'authenticated',
    },
  } as BackendConfigService;
}
