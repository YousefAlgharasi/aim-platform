import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { BackendConfigService } from '../config/backend-config.service';
import { AuthLoginService } from './auth-login.service';

import { JwtService } from '@nestjs/jwt';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';

const originalFetch = global.fetch;

const makeJwtMock = () =>
  ({
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  }) as unknown as jest.Mocked<JwtService>;

const makeBootstrapMock = () =>
  ({
    bootstrap: jest.fn().mockResolvedValue({ internalUserId: 'usr_bootstrap_123' }),
  }) as unknown as jest.Mocked<AuthProfileBootstrapService>;

describe('AuthLoginService', () => {
  let service: AuthLoginService;

  beforeEach(() => {
    service = new AuthLoginService(createConfig(), makeJwtMock(), makeBootstrapMock());
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

    it('self-heals accounts missing a role by assigning one and re-minting the token', async () => {
      const tokenWithoutRole = {
        access_token: 'stale-token',
        refresh_token: 'stale-refresh',
        expires_in: 3600,
        user: { id: 'user-1', email: 'a@b.com', app_metadata: {} },
      };
      const tokenWithRole = {
        access_token: 'fresh-token',
        refresh_token: 'fresh-refresh',
        expires_in: 3600,
        user: { id: 'user-1', email: 'a@b.com', app_metadata: { role: 'student' } },
      };

      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, tokenWithoutRole))
        .mockResolvedValueOnce(jsonResponse(200, {}))
        .mockResolvedValueOnce(jsonResponse(200, tokenWithRole));
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await service.login({ email: 'a@b.com', password: 'pw' });

      expect(result.accessToken).toBe('fresh-token');
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[1][0]).toContain('/auth/v1/admin/users/user-1');
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: 'PUT',
        body: JSON.stringify({ app_metadata: { role: 'student' } }),
      });
    });

    it('does not re-mint the token when the role is already present', async () => {
      const tokenWithRole = {
        access_token: 'token-1',
        refresh_token: 'refresh-1',
        expires_in: 3600,
        user: { id: 'user-1', email: 'a@b.com', app_metadata: { role: 'student' } },
      };

      const fetchMock = jest.fn().mockResolvedValueOnce(jsonResponse(200, tokenWithRole));
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await service.login({ email: 'a@b.com', password: 'pw' });

      expect(result.accessToken).toBe('token-1');
      expect(fetchMock).toHaveBeenCalledTimes(1);
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

  describe('forgotPassword', () => {
    it('reports success when Supabase accepts the recover request', async () => {
      mockFetch(200, {});

      await expect(service.forgotPassword({ email: 'a@b.com' })).resolves.toEqual({ sent: true });
    });

    it('reports success even when the email does not match an account', async () => {
      mockFetch(400, { error_code: 'user_not_found', msg: 'User not found' });

      await expect(service.forgotPassword({ email: 'nobody@b.com' })).resolves.toEqual({ sent: true });
    });

    it('maps rate limiting to too many requests', async () => {
      mockFetch(429, { error_code: 'over_email_send_rate_limit', msg: 'rate limit exceeded' });

      await expect(service.forgotPassword({ email: 'a@b.com' })).rejects.toMatchObject({
        code: ApiErrorCode.TOO_MANY_REQUESTS,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      });
    });

    it('maps unreachable Supabase to a service unavailable error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

      await expect(service.forgotPassword({ email: 'a@b.com' })).rejects.toMatchObject({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
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

    it('reports a duplicate when Supabase returns an obfuscated user with no identities', async () => {
      mockFetch(200, { id: 'fake-id', email: 'a@b.com', identities: [] });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).rejects.toMatchObject({
        code: ApiErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
        message: 'An account with this email already exists. Try signing in instead.',
      });
    });

    it('still reports email confirmation required for a genuinely new user', async () => {
      mockFetch(200, { id: 'new-id', email: 'a@b.com', identities: [{ provider: 'email' }] });

      await expect(service.register({ email: 'a@b.com', password: 'password123' })).resolves.toEqual({
        requiresEmailConfirmation: true,
      });
    });

    it('maps weak passwords to a bad request error', async () => {
      mockFetch(400, { error_code: 'weak_password', msg: 'Password is too short' });

      await expect(service.register({ email: 'a@b.com', password: '123' })).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please choose a stronger password.',
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

    it('assigns the default role and re-mints the token when no email confirmation is required', async () => {
      const signUpBody = {
        access_token: 'signup-token',
        refresh_token: 'signup-refresh',
        expires_in: 3600,
        user: { id: 'new-user-1', email: 'a@b.com' },
      };
      const freshToken = {
        access_token: 'fresh-token',
        refresh_token: 'fresh-refresh',
        expires_in: 3600,
        user: { id: 'new-user-1', email: 'a@b.com', app_metadata: { role: 'student' } },
      };

      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, signUpBody))
        .mockResolvedValueOnce(jsonResponse(200, {}))
        .mockResolvedValueOnce(jsonResponse(200, freshToken));
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await service.register({ email: 'a@b.com', password: 'password123' });

      expect(result).toMatchObject({ requiresEmailConfirmation: false, accessToken: 'fresh-token' });
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(fetchMock.mock.calls[1][0]).toContain('/auth/v1/admin/users/new-user-1');
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: 'PUT',
        body: JSON.stringify({ app_metadata: { role: 'student' } }),
      });
    });

    it('assigns the default role even when email confirmation is required', async () => {
      const signUpBody = { id: 'new-user-2', email: 'a@b.com' };

      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, signUpBody))
        .mockResolvedValueOnce(jsonResponse(200, {}));
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await service.register({ email: 'a@b.com', password: 'password123' });

      expect(result).toEqual({ requiresEmailConfirmation: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toContain('/auth/v1/admin/users/new-user-2');
    });
  });

  describe('googleLogin', () => {
    it('exchanges ID token with Supabase and returns tokens with actual Auth UUID', async () => {
      const mockTokens = {
        access_token: 'acc_g123',
        refresh_token: 'ref_g123',
        expires_at: 1900000000,
        user: {
          id: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
          email: 'ahmedalalawi2022@gmail.com',
          app_metadata: { role: 'student' },
        },
      };
      mockFetch(200, mockTokens);

      const result = await service.googleLogin({ idToken: 'valid_id_token' });
      expect(result).toEqual({
        accessToken: 'acc_g123',
        refreshToken: 'ref_g123',
        expiresAt: 1900000000,
        user: {
          id: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
          email: 'ahmedalalawi2022@gmail.com',
        },
      });
    });

    it('maps invalid Google token error to clear unauthorized message', async () => {
      mockFetch(400, { error_code: 'invalid_grant', msg: 'Invalid ID token' });

      await expect(service.googleLogin({ idToken: 'bad_token' })).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
      });
    });

    it('rejects unverified Google email during fallback verification', async () => {
      const fetchMock = jest
        .fn()
        // 1. Supabase id_token fails
        .mockResolvedValueOnce(
          jsonResponse(400, { error_code: 'provider_disabled', msg: 'Provider is not enabled' }),
        )
        // 2. Google tokeninfo returns email_verified: false
        .mockResolvedValueOnce(
          jsonResponse(200, {
            sub: 'google-sub-123',
            email: 'unverified@example.com',
            email_verified: 'false',
            iss: 'https://accounts.google.com',
          }),
        );
      global.fetch = fetchMock as unknown as typeof fetch;

      await expect(service.googleLogin({ idToken: 'unverified_id_token' })).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
      });
    });

    it('resolves existing email user to their existing Supabase Auth UUID on fallback and preserves JWT subject', async () => {
      const existingSupabaseUid = 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790';
      const existingInternalId = 'dcc1fb98-357a-4480-85c8-481bb14e0aa4';
      const jwtMock = makeJwtMock();
      const bootstrapMock = {
        bootstrap: jest.fn().mockResolvedValue({
          internalUserId: existingInternalId,
          userType: 'student',
          status: 'active',
          userCreated: false,
          profileCreated: false,
          profileType: 'student_profile',
        }),
      } as unknown as jest.Mocked<AuthProfileBootstrapService>;
      const dbMock = {
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [{ id: existingSupabaseUid }], rowCount: 1 })
          .mockResolvedValue({ rows: [], rowCount: 0 }),
      };

      const svc = new AuthLoginService(createConfig(), jwtMock, bootstrapMock, dbMock as never);

      const fetchMock = jest
        .fn()
        // 1. Supabase id_token fails (e.g. fallback path)
        .mockResolvedValueOnce(
          jsonResponse(400, { error_code: 'provider_disabled', msg: 'Provider is not enabled' }),
        )
        // 2. Google tokeninfo succeeds with verified email
        .mockResolvedValueOnce(
          jsonResponse(200, {
            sub: '109876543210',
            email: 'ahmedalalawi2022@gmail.com',
            email_verified: 'true',
            iss: 'https://accounts.google.com',
            given_name: 'Ahmed',
            family_name: 'Alalawi',
          }),
        );
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await svc.googleLogin({ idToken: 'valid_google_token' });

      expect(bootstrapMock.bootstrap).toHaveBeenCalledWith({
        supabaseAuthUid: existingSupabaseUid,
        email: 'ahmedalalawi2022@gmail.com',
        displayName: 'Ahmed Alalawi',
      });
      // JWT subject must be the actual Supabase Auth UUID, never internalUserId
      expect(jwtMock.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          sub: existingSupabaseUid,
          email: 'ahmedalalawi2022@gmail.com',
        }),
        expect.anything(),
      );
      expect(result.user).toEqual({
        id: existingSupabaseUid,
        email: 'ahmedalalawi2022@gmail.com',
        internalUserId: existingInternalId,
        displayName: 'Ahmed Alalawi',
        userType: 'student',
        status: 'active',
      });
      expect(result.user.id).not.toBe(existingInternalId);
    });

    it('handles 422 email_exists from Supabase Admin API by resolving existing user and never ignoring it', async () => {
      const existingSupabaseUid = 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790';
      const jwtMock = makeJwtMock();
      const bootstrapMock = makeBootstrapMock();
      const svc = new AuthLoginService(createConfig(), jwtMock, bootstrapMock);

      const fetchMock = jest
        .fn()
        // 1. POST /auth/v1/admin/users returns 422 email_exists
        .mockResolvedValueOnce(
          jsonResponse(422, {
            error_code: 'email_exists',
            msg: 'A user with this email address has already been registered',
          }),
        )
        // 2. GET /auth/v1/admin/users returns the existing user
        .mockResolvedValueOnce(
          jsonResponse(200, {
            users: [{ id: existingSupabaseUid, email: 'ahmedalalawi2022@gmail.com' }],
          }),
        );
      global.fetch = fetchMock as unknown as typeof fetch;

      const result = await svc.processGoogleUser({
        googleId: 'g_existing_123',
        email: 'ahmedalalawi2022@gmail.com',
        firstName: 'Ahmed',
      });

      expect(bootstrapMock.bootstrap).toHaveBeenCalledWith({
        supabaseAuthUid: existingSupabaseUid,
        email: 'ahmedalalawi2022@gmail.com',
        displayName: 'Ahmed',
      });
      expect(jwtMock.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ sub: existingSupabaseUid }),
        expect.anything(),
      );
      expect(result.user.id).toBe(existingSupabaseUid);
    });

    it('returns the exact same account across repeated Google logins', async () => {
      const existingSupabaseUid = 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790';
      const jwtMock = makeJwtMock();
      const bootstrapMock = makeBootstrapMock();
      const dbMock = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: existingSupabaseUid }], rowCount: 1 }),
      };
      const svc = new AuthLoginService(createConfig(), jwtMock, bootstrapMock, dbMock as never);

      const first = await svc.processGoogleUser({
        googleId: 'g_repeat_1',
        email: 'ahmedalalawi2022@gmail.com',
      });
      const second = await svc.processGoogleUser({
        googleId: 'g_repeat_1',
        email: 'ahmedalalawi2022@gmail.com',
      });

      expect(first.user.id).toBe(existingSupabaseUid);
      expect(second.user.id).toBe(existingSupabaseUid);
      expect(bootstrapMock.bootstrap).toHaveBeenNthCalledWith(1, {
        supabaseAuthUid: existingSupabaseUid,
        email: 'ahmedalalawi2022@gmail.com',
      });
      expect(bootstrapMock.bootstrap).toHaveBeenNthCalledWith(2, {
        supabaseAuthUid: existingSupabaseUid,
        email: 'ahmedalalawi2022@gmail.com',
      });
    });
  });

  describe('processGoogleUser', () => {
    it('provisions a new Google user and issues signed JWT tokens with the Supabase Auth UUID as sub', async () => {
      const jwtMock = makeJwtMock();
      const bootstrapMock = makeBootstrapMock();
      const svc = new AuthLoginService(createConfig(), jwtMock, bootstrapMock);
      mockFetch(200, { id: 'supa_g_123' });
      const googleProfile = {
        googleId: 'g_uid_999',
        email: 'googleuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await svc.processGoogleUser(googleProfile);

      expect(result.accessToken).toBe('mock_jwt_token');
      expect(result.refreshToken).toBe('mock_jwt_token');
      expect(bootstrapMock.bootstrap).toHaveBeenCalledWith({
        supabaseAuthUid: 'supa_g_123',
        email: 'googleuser@example.com',
        displayName: 'John Doe',
      });
      expect(jwtMock.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ sub: 'supa_g_123', email: 'googleuser@example.com' }),
        expect.anything(),
      );
      expect(result.user).toEqual({
        id: 'supa_g_123',
        email: 'googleuser@example.com',
        internalUserId: 'usr_bootstrap_123',
        displayName: 'John Doe',
      });
    });

    it('persists and returns displayName, avatarUrl, preferredLanguage, and profile on sign up and sign in', async () => {
      const jwtMock = makeJwtMock();
      const bootstrapMock = {
        bootstrap: jest.fn().mockResolvedValue({
          internalUserId: '1a2b02a1-cb8a-4fe8-b23a-13019cd61938',
          userType: 'student',
          status: 'active',
          userCreated: true,
          profileCreated: true,
          profileType: 'student_profile',
          profileId: '533d9ecd-b7eb-4113-9b53-3da9125381d2',
          displayName: 'احمد علاو',
          avatarUrl: 'https://example.com/avatar.png',
          preferredLanguage: 'ar',
          timezone: 'Asia/Riyadh',
        }),
      } as unknown as jest.Mocked<AuthProfileBootstrapService>;
      const svc = new AuthLoginService(createConfig(), jwtMock, bootstrapMock);

      const signUpBody = {
        access_token: 'signup-token',
        refresh_token: 'signup-refresh',
        expires_in: 3600,
        user: { id: 'fea999be-db75-4690-844c-4bc054f7fe3c', email: 'ahmedalalawi2022@gmail.com' },
      };
      const freshToken = {
        access_token: 'fresh-token',
        refresh_token: 'fresh-refresh',
        expires_in: 3600,
        user: {
          id: 'fea999be-db75-4690-844c-4bc054f7fe3c',
          email: 'ahmedalalawi2022@gmail.com',
          app_metadata: { role: 'student' },
          user_metadata: { full_name: 'احمد علاو', avatar_url: 'https://example.com/avatar.png' },
        },
      };

      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, signUpBody))
        .mockResolvedValueOnce(jsonResponse(200, {}))
        .mockResolvedValueOnce(jsonResponse(200, freshToken));
      global.fetch = fetchMock as unknown as typeof fetch;

      const regResult = await svc.register({
        email: 'ahmedalalawi2022@gmail.com',
        password: 'Password123!',
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/avatar.png',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
      });

      expect(bootstrapMock.bootstrap).toHaveBeenCalledWith({
        supabaseAuthUid: 'fea999be-db75-4690-844c-4bc054f7fe3c',
        email: 'ahmedalalawi2022@gmail.com',
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/avatar.png',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
      });
      expect(regResult.user).toEqual({
        id: 'fea999be-db75-4690-844c-4bc054f7fe3c',
        email: 'ahmedalalawi2022@gmail.com',
        internalUserId: '1a2b02a1-cb8a-4fe8-b23a-13019cd61938',
        profileId: '533d9ecd-b7eb-4113-9b53-3da9125381d2',
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/avatar.png',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
        userType: 'student',
        status: 'active',
      });
      expect(regResult.profile).toEqual({
        id: '533d9ecd-b7eb-4113-9b53-3da9125381d2',
        profileType: 'student_profile',
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/avatar.png',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
      });
    });

    it('rejects profile with missing email', async () => {
      await expect(
        service.processGoogleUser({ googleId: 'g_123', email: '' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });
});

function mockFetch(status: number, body: Record<string, unknown>): void {
  global.fetch = jest.fn().mockResolvedValue(jsonResponse(status, body)) as unknown as typeof fetch;
}

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
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
