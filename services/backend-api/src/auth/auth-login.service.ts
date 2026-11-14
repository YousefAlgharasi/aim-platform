// Sole caller of the Supabase Auth REST API.
//
// Security rules:
//   - SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL never leave the backend process.
//   - Clients only ever see { accessToken, refreshToken, expiresAt, user }.
//   - Supabase error payloads are mapped to safe AppError codes; raw Supabase
//     error bodies are never forwarded to clients.

import { HttpStatus, Injectable, Logger, Optional } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { AppError } from '../common/errors/app-error';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { GoogleUserProfile } from './google.strategy';
import {
  AuthForgotPasswordInput,
  AuthForgotPasswordResult,
  AuthGoogleLoginInput,
  AuthGoogleLoginResult,
  AuthLoginInput,
  AuthLoginResult,
  AuthProfileInfo,
  AuthRefreshInput,
  AuthRegisterInput,
  AuthRegisterResult,
  AuthResetPasswordInput,
  AuthTokenResult,
  AuthUserInfo,
  SupabaseAuthErrorResponse,
  SupabaseAuthTokenResponse,
  SupabaseSignUpResponse,
} from './auth-login.types';
import { BootstrapProfileResult } from './auth-profile-bootstrap.types';

type AuthOperation = 'login' | 'refresh' | 'register' | 'google' | 'resetPassword';

interface AuthUserLookupRow {
  readonly id: string;
}

interface SupabaseAdminUserResponse {
  readonly id?: string;
  readonly email?: string | null;
  readonly user?: {
    readonly id?: string;
    readonly email?: string | null;
  };
}

interface SupabaseAdminUsersListResponse {
  readonly users?: ReadonlyArray<{
    readonly id?: string;
    readonly email?: string | null;
  }>;
}

const SUPABASE_TOKEN_PATH = '/auth/v1/token';
const SUPABASE_SIGNUP_PATH = '/auth/v1/signup';
const SUPABASE_RECOVER_PATH = '/auth/v1/recover';
const SUPABASE_LOGOUT_PATH = '/auth/v1/logout';
const SUPABASE_USER_PATH = '/auth/v1/user';
const SUPABASE_ADMIN_USERS_PATH = '/auth/v1/admin/users';
const SUPABASE_REQUEST_TIMEOUT_MS = 8000;
const MOBILE_EMAIL_CONFIRMATION_REDIRECT_URL = 'aimapp://login-callback';
const DEFAULT_USER_ROLE = 'student';

@Injectable()
export class AuthLoginService {
  private readonly logger = new Logger(AuthLoginService.name);

  constructor(
    private readonly config: BackendConfigService,
    private readonly jwtService: JwtService,
    private readonly profileBootstrap: AuthProfileBootstrapService,
    @Optional() private readonly db?: DatabaseService,
  ) {}

  async login(input: AuthLoginInput): Promise<AuthLoginResult> {
    let response = await this.callSupabase(
      `${SUPABASE_TOKEN_PATH}?grant_type=password`,
      { email: input.email, password: input.password },
      'login',
    );

    // Self-heal accounts created before role auto-assignment existed (e.g.
    // accounts provisioned directly via the Supabase Admin API). The JWT
    // already issued above predates the metadata update, so we re-mint it.
    if (response.user?.id && !response.user.app_metadata?.role) {
      await this.assignDefaultRole(response.user.id);
      response = await this.callSupabase(
        `${SUPABASE_TOKEN_PATH}?grant_type=password`,
        { email: input.email, password: input.password },
        'login',
      );
    }

    const supabaseAuthUid = response.user?.id ?? '';
    const email = response.user?.email ?? input.email;
    const meta = this.extractUserMetadata(response.user?.user_metadata);

    let bootstrapResult: BootstrapProfileResult | undefined;
    if (supabaseAuthUid) {
      bootstrapResult = await this.profileBootstrap.bootstrap({
        supabaseAuthUid,
        email,
        phone: response.user?.phone ?? null,
        ...(meta.displayName ? { displayName: meta.displayName } : {}),
        ...(meta.avatarUrl ? { avatarUrl: meta.avatarUrl } : {}),
      });
    }

    const tokens = this.toTokenResult(response);
    const enriched = this.buildAuthUserAndProfile(supabaseAuthUid, email, bootstrapResult, meta);

    return {
      ...tokens,
      user: enriched.user,
      ...(enriched.profile ? { profile: enriched.profile } : {}),
    };
  }

  async googleLogin(input: AuthGoogleLoginInput): Promise<AuthGoogleLoginResult> {
    const payload: Record<string, string> = {
      provider: 'google',
      id_token: input.idToken,
    };
    if (input.nonce) {
      payload.nonce = input.nonce;
    }

    try {
      let response = await this.callSupabase(
        `${SUPABASE_TOKEN_PATH}?grant_type=id_token`,
        payload,
        'google',
      );

      if (response.user?.id && !response.user.app_metadata?.role) {
        await this.assignDefaultRole(response.user.id);
        response = await this.callSupabase(
          `${SUPABASE_TOKEN_PATH}?grant_type=id_token`,
          payload,
          'google',
        );
      }

      const supabaseAuthUid = response.user?.id ?? '';
      const email = response.user?.email ?? null;
      const meta = this.extractUserMetadata(response.user?.user_metadata);

      let bootstrapResult: BootstrapProfileResult | undefined;
      if (supabaseAuthUid) {
        bootstrapResult = await this.profileBootstrap.bootstrap({
          supabaseAuthUid,
          email,
          ...(meta.displayName ? { displayName: meta.displayName } : {}),
          ...(meta.avatarUrl ? { avatarUrl: meta.avatarUrl } : {}),
        });
      }

      const tokens = this.toTokenResult(response);
      const enriched = this.buildAuthUserAndProfile(supabaseAuthUid, email, bootstrapResult, meta);

      return {
        ...tokens,
        user: enriched.user,
        ...(enriched.profile ? { profile: enriched.profile } : {}),
      };
    } catch (supabaseError) {
      this.logger.warn(
        `Supabase native id_token exchange failed, attempting direct Google token verification fallback: ${this.toSafeErrorMessage(supabaseError)}`,
      );
      return this.verifyGoogleIdTokenAndProcess(input.idToken);
    }
  }

  private async verifyGoogleIdTokenAndProcess(idToken: string): Promise<AuthGoogleLoginResult> {
    let tokenInfoRes: Response;
    try {
      tokenInfoRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
        { signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS) },
      );
    } catch (err) {
      this.logger.warn(`Google tokeninfo endpoint failed: ${this.toSafeErrorMessage(err)}`);
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!tokenInfoRes.ok) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = (await tokenInfoRes.json()) as Record<string, unknown>;
    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    const emailVerified = payload.email_verified === 'true' || payload.email_verified === true;
    const googleSub = typeof payload.sub === 'string' ? payload.sub.trim() : '';

    if (!email || !emailVerified || !googleSub) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (
      typeof payload.iss === 'string' &&
      payload.iss !== 'https://accounts.google.com' &&
      payload.iss !== 'accounts.google.com'
    ) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const configuredClientId = this.config.google?.clientId;
    if (
      configuredClientId &&
      typeof payload.aud === 'string' &&
      payload.aud !== configuredClientId &&
      payload.azp !== configuredClientId
    ) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid Google authentication token.',
        statusCode: HttpStatus.UNAUTHORIZED,
       });
    }

    if (payload.exp !== undefined && payload.exp !== null) {
      const expSeconds = Number(payload.exp);
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (!Number.isFinite(expSeconds) || expSeconds <= nowSeconds) {
        throw new AppError({
          code: ApiErrorCode.UNAUTHORIZED,
          message: 'Invalid Google authentication token.',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }
    }

    const googleUser: GoogleUserProfile = {
      googleId: googleSub,
      email,
      firstName:
        typeof payload.given_name === 'string'
          ? payload.given_name
          : typeof payload.name === 'string'
          ? payload.name
          : undefined,
      lastName: typeof payload.family_name === 'string' ? payload.family_name : undefined,
      avatarUrl: typeof payload.picture === 'string' ? payload.picture : undefined,
    };

    return this.processGoogleUser(googleUser);
  }

  async processGoogleUser(googleUser: GoogleUserProfile): Promise<AuthLoginResult> {
    const normalizedEmail = googleUser.email?.trim() ?? '';
    if (!normalizedEmail) {
      throw new AppError({
        code: ApiErrorCode.BAD_REQUEST,
        message: 'Google authentication did not return a valid email address.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const googleDisplayName =
      [googleUser.firstName, googleUser.lastName].filter(Boolean).join(' ').trim() || null;
    const googleAvatarUrl = googleUser.avatarUrl?.trim() || null;

    const supabaseAuthUid = await this.resolveOrProvisionSupabaseAuthUser({
      ...googleUser,
      email: normalizedEmail,
    });

    const bootstrapResult = await this.profileBootstrap.bootstrap({
      supabaseAuthUid,
      email: normalizedEmail,
      ...(googleDisplayName ? { displayName: googleDisplayName } : {}),
      ...(googleAvatarUrl ? { avatarUrl: googleAvatarUrl } : {}),
    });

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiresAt = nowSeconds + 3600;

    const accessToken = this.jwtService.sign(
      {
        sub: supabaseAuthUid,
        email: normalizedEmail,
        role: 'authenticated',
        app_metadata: { role: DEFAULT_USER_ROLE, roles: [DEFAULT_USER_ROLE] },
        user_metadata: {
          name: googleDisplayName ?? '',
          full_name: googleDisplayName ?? undefined,
          avatar_url: googleUser.avatarUrl,
        },
      },
      {
        issuer: this.config.supabase.jwtIssuer,
        audience: this.config.supabase.jwtAudience,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: supabaseAuthUid,
        type: 'refresh',
       },
      {
        expiresIn: '7d',
      },
    );

    const enriched = this.buildAuthUserAndProfile(supabaseAuthUid, normalizedEmail, bootstrapResult, {
      displayName: googleDisplayName,
      avatarUrl: googleAvatarUrl,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt,
      user: enriched.user,
      ...(enriched.profile ? { profile: enriched.profile } : {}),
    };
  }

  async refresh(input: AuthRefreshInput): Promise<AuthTokenResult> {
    const response = await this.callSupabase(
      `${SUPABASE_TOKEN_PATH}?grant_type=refresh_token`,
      { refresh_token: input.refreshToken },
      'refresh',
    );

    return this.toTokenResult(response);
  }

  async register(input: AuthRegisterInput): Promise<AuthRegisterResult> {
    const redirectTo = this.resolveEmailConfirmationRedirect(input.redirectUrl);
    const url = `${this.buildSupabaseUrl(SUPABASE_SIGNUP_PATH)}?redirect_to=${encodeURIComponent(
      redirectTo,
    )}`;

    const requestedDisplayName =
      (input.displayName ?? input.fullName ?? input.name)?.trim() || undefined;
    const requestedAvatarUrl = input.avatarUrl?.trim() || undefined;
    const signUpMetadata: Record<string, string> = {};
    if (requestedDisplayName) {
      signUpMetadata.name = requestedDisplayName;
      signUpMetadata.full_name = requestedDisplayName;
    }
    if (requestedAvatarUrl) {
      signUpMetadata.avatar_url = requestedAvatarUrl;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          ...(Object.keys(signUpMetadata).length > 0 ? { data: signUpMetadata } : {}),
        }),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Supabase signUp call failed: ${this.toSafeErrorMessage(error)}`);
      throw new AppError({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the authentication service.',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (!response.ok) {
      await this.throwMappedError(response, 'register');
    }

    const body = (await response.json()) as SupabaseSignUpResponse;

    const identities = body.user?.identities ?? body.identities;
    if (Array.isArray(identities) && identities.length === 0) {
      // Obfuscated "success" for an existing account: no confirmation email is
      // sent, so report the duplicate and never assign a role to the fake user.
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: 'An account with this email already exists. Try signing in instead.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const newUserId = body.user?.id ?? body.id;
    const resolvedEmail = body.user?.email ?? body.email ?? input.email;

    if (newUserId) {
      await this.assignDefaultRole(newUserId);
    }

    if (!body.access_token || !body.refresh_token) {
      if (newUserId && (requestedDisplayName || requestedAvatarUrl || input.preferredLanguage || input.timezone)) {
        await this.profileBootstrap.bootstrap({
          supabaseAuthUid: newUserId,
          email: resolvedEmail,
          ...(requestedDisplayName ? { displayName: requestedDisplayName } : {}),
          ...(requestedAvatarUrl ? { avatarUrl: requestedAvatarUrl } : {}),
          ...(input.preferredLanguage ? { preferredLanguage: input.preferredLanguage } : {}),
          ...(input.timezone ? { timezone: input.timezone } : {}),
        });
      }
      return { requiresEmailConfirmation: true };
    }

    // The tokens above were minted before the role assignment, so re-mint
    // them to get a JWT whose app_metadata reflects the assigned role.
    const freshTokens = await this.callSupabase(
      `${SUPABASE_TOKEN_PATH}?grant_type=password`,
      { email: input.email, password: input.password },
      'register',
    );

    const finalUserId = freshTokens.user?.id ?? newUserId ?? '';
    const finalEmail = freshTokens.user?.email ?? resolvedEmail;
    const meta = this.extractUserMetadata(freshTokens.user?.user_metadata ?? body.user?.user_metadata ?? body.user_metadata);
    const effectiveDisplayName = requestedDisplayName ?? meta.displayName ?? undefined;
    const effectiveAvatarUrl = requestedAvatarUrl ?? meta.avatarUrl ?? undefined;

    let bootstrapResult: BootstrapProfileResult | undefined;
    if (finalUserId) {
      bootstrapResult = await this.profileBootstrap.bootstrap({
        supabaseAuthUid: finalUserId,
        email: finalEmail,
        ...(effectiveDisplayName ? { displayName: effectiveDisplayName } : {}),
        ...(effectiveAvatarUrl ? { avatarUrl: effectiveAvatarUrl } : {}),
        ...(input.preferredLanguage ? { preferredLanguage: input.preferredLanguage } : {}),
        ...(input.timezone ? { timezone: input.timezone } : {}),
      });
    }

    const enriched = this.buildAuthUserAndProfile(finalUserId, finalEmail, bootstrapResult, {
      displayName: effectiveDisplayName ?? null,
      avatarUrl: effectiveAvatarUrl ?? null,
    });

    return {
      requiresEmailConfirmation: false,
      accessToken: freshTokens.access_token,
      refreshToken: freshTokens.refresh_token,
      expiresAt: this.resolveExpiresAt(freshTokens.expires_at, freshTokens.expires_in),
      user: enriched.user,
      ...(enriched.profile ? { profile: enriched.profile } : {}),
    };
  }

  // Always reports success regardless of whether the email matches an
  // account, so the response never reveals account existence to a caller.
  async forgotPassword(input: AuthForgotPasswordInput): Promise<AuthForgotPasswordResult> {
    const redirectTo = this.resolveEmailConfirmationRedirect(input.redirectUrl);
    const url = `${this.buildSupabaseUrl(SUPABASE_RECOVER_PATH)}?redirect_to=${encodeURIComponent(
      redirectTo,
    )}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ email: input.email }),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Supabase recover call failed: ${this.toSafeErrorMessage(error)}`);
      throw new AppError({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the authentication service.',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers?.get?.('retry-after') ?? '', 10);
        throw new AppError({
          code: ApiErrorCode.TOO_MANY_REQUESTS,
          message: 'Too many attempts. Please wait a moment and try again.',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          details: { retryAfterSeconds: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60 },
        });
      }

      // Any other failure (including "no user found") is intentionally
      // swallowed here rather than surfaced to the caller.
      this.logger.warn(`Supabase recover call returned status ${response.status}`);
    }

    return { sent: true };
  }

  async logout(accessToken: string): Promise<void> {
    const url = this.buildSupabaseUrl(SUPABASE_LOGOUT_PATH);

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          ...this.buildHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      // Logout is best-effort server-side; the client discards its tokens regardless.
      this.logger.warn(`Supabase logout call failed: ${this.toSafeErrorMessage(error)}`);
    }
  }

  async resetPassword(accessToken: string, input: AuthResetPasswordInput): Promise<void> {
    const url = this.buildSupabaseUrl(SUPABASE_USER_PATH);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...this.buildHeaders(),
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: input.password }),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Supabase resetPassword call failed: ${this.toSafeErrorMessage(error)}`);
      throw new AppError({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the authentication service.',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (!response.ok) {
      await this.throwMappedError(response, 'resetPassword');
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  // Web clients pass their own origin so the confirmation email lands back on
  // the site the user registered from, instead of always opening the mobile
  // app's deep link. Only origins in the CORS allow-list are trusted.
  private resolveEmailConfirmationRedirect(redirectUrl: string | undefined): string {
    if (!redirectUrl) {
      return MOBILE_EMAIL_CONFIRMATION_REDIRECT_URL;
    }

    const requestedOrigin = new URL(redirectUrl).origin;
    const isAllowedOrigin = this.config.corsOrigins.some((origin) => origin === requestedOrigin);

    return isAllowedOrigin ? redirectUrl : MOBILE_EMAIL_CONFIRMATION_REDIRECT_URL;
  }

  // Grants the default application role via Supabase's Admin API so the
  // role is embedded in app_metadata before any JWT is issued to the
  // client. Best-effort: a failure here must not block registration/login,
  // since the account is still usable — just without the default role yet.
  private async assignDefaultRole(userId: string): Promise<void> {
    const url = `${this.buildSupabaseUrl(SUPABASE_ADMIN_USERS_PATH)}/${userId}`;

    try {
      await fetch(url, {
        method: 'PUT',
        headers: this.buildHeaders(),
        body: JSON.stringify({ app_metadata: { role: DEFAULT_USER_ROLE } }),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Failed to assign default role: ${this.toSafeErrorMessage(error)}`);
    }
  }

  private async resolveOrProvisionSupabaseAuthUser(googleUser: GoogleUserProfile): Promise<string> {
    const normalizedEmail = googleUser.email.trim().toLowerCase();

    // 1. Check auth.users directly when DatabaseService is available so an existing
    //    email/password account always resolves to its actual Supabase Auth UUID.
    const existingUidInDb = await this.findAuthUserIdByEmail(normalizedEmail);
    if (existingUidInDb) {
      await this.linkGoogleIdentityInDb(existingUidInDb, googleUser);
      return existingUidInDb;
    }

    // 2. Otherwise create or look up the user via Supabase Admin API.
    const url = this.buildSupabaseUrl(SUPABASE_ADMIN_USERS_PATH);
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: {
            name: `${googleUser.firstName ?? ''} ${googleUser.lastName ?? ''}`.trim() || undefined,
            avatar_url: googleUser.avatarUrl,
          },
          app_metadata: {
            provider: 'google',
            providers: ['google'],
            role: DEFAULT_USER_ROLE,
          },
        }),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Failed to provision user in Supabase auth.users: ${this.toSafeErrorMessage(error)}`);
      throw new AppError({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the authentication service.',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (response.ok) {
      let body: SupabaseAdminUserResponse = {};
      try {
        body = (await response.json()) as SupabaseAdminUserResponse;
      } catch {
        // Handled below if no ID was extracted.
      }
      const createdUid = (body.user?.id ?? body.id)?.trim();
      if (createdUid) {
        await this.linkGoogleIdentityInDb(createdUid, googleUser);
        return createdUid;
      }
    } else {
      let errorBody: SupabaseAuthErrorResponse = {};
      try {
        errorBody = (await response.json()) as SupabaseAuthErrorResponse;
      } catch {
        // Ignore parse failures.
      }

      const reason = [
        errorBody.error_code,
        errorBody.msg,
        errorBody.error_description,
        errorBody.message,
      ]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase()
        .replace(/_/g, ' ');

      // Never silently ignore email_exists: resolve the existing auth.users UUID.
      if (
        response.status === 422 ||
        reason.includes('email exists') ||
        reason.includes('already registered') ||
        reason.includes('already exists')
      ) {
        const resolvedUid =
          (await this.findAuthUserIdByEmail(normalizedEmail)) ??
          (await this.findAuthUserIdViaAdminApi(normalizedEmail));

        if (resolvedUid) {
          await this.linkGoogleIdentityInDb(resolvedUid, googleUser);
          return resolvedUid;
        }
      }
    }

    throw new AppError({
      code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      message: 'Unable to resolve authenticated user identity.',
      statusCode: HttpStatus.BAD_GATEWAY,
    });
  }

  private async findAuthUserIdByEmail(email: string): Promise<string | null> {
    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db.query<AuthUserLookupRow>(
        `SELECT id::text AS id
         FROM auth.users
         WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [email.trim()],
      );
      return result.rows[0]?.id?.trim() || null;
    } catch (error) {
      this.logger.warn(`Failed to query auth.users by email: ${this.toSafeErrorMessage(error)}`);
      return null;
    }
  }

  private async findAuthUserIdViaAdminApi(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const url = `${this.buildSupabaseUrl(SUPABASE_ADMIN_USERS_PATH)}?per_page=1000`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        return null;
      }
      const body = (await response.json()) as SupabaseAdminUsersListResponse;
      const match = (body.users ?? []).find(
        (u) => typeof u.email === 'string' && u.email.trim().toLowerCase() === normalizedEmail,
      );
      return match?.id?.trim() || null;
    } catch (error) {
      this.logger.warn(`Failed to list Supabase admin users: ${this.toSafeErrorMessage(error)}`);
      return null;
    }
  }

  private async linkGoogleIdentityInDb(
    supabaseAuthUid: string,
    googleUser: GoogleUserProfile,
  ): Promise<void> {
    if (!this.db) {
      return;
    }

    const googleId = googleUser.googleId?.trim();
    const normalizedEmail = googleUser.email.trim().toLowerCase();

    try {
      if (googleId) {
        const identityData = JSON.stringify({
          sub: googleId,
          email: normalizedEmail,
          email_verified: true,
          phone_verified: false,
          ...(googleUser.firstName || googleUser.lastName
            ? { full_name: [googleUser.firstName, googleUser.lastName].filter(Boolean).join(' ') }
            : {}),
          ...(googleUser.avatarUrl ? { avatar_url: googleUser.avatarUrl } : {}),
        });

        await this.db.query(
          `INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
           VALUES ($1, $2::uuid, $3::jsonb, 'google', now(), now(), now())
           ON CONFLICT (provider_id, provider) DO UPDATE
           SET last_sign_in_at = now(), updated_at = now()
           WHERE auth.identities.user_id = EXCLUDED.user_id`,
          [googleId, supabaseAuthUid, identityData],
        );
      }

      const fullName = [googleUser.firstName, googleUser.lastName].filter(Boolean).join(' ').trim() || null;
      const avatarUrl = googleUser.avatarUrl?.trim() || null;

      await this.db.query(
        `UPDATE auth.users
         SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
           || jsonb_build_object(
                'role', COALESCE(raw_app_meta_data->>'role', $2),
                'providers', (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM jsonb_array_elements_text(
                    COALESCE(raw_app_meta_data->'providers', '[]'::jsonb) || '["google"]'::jsonb
                  ) AS elem
                )
              ),
             raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
               || CASE WHEN $3::text IS NOT NULL THEN jsonb_build_object('name', $3, 'full_name', $3) ELSE '{}'::jsonb END
               || CASE WHEN $4::text IS NOT NULL THEN jsonb_build_object('avatar_url', $4, 'picture', $4) ELSE '{}'::jsonb END,
             updated_at = now()
         WHERE id = $1::uuid`,
        [supabaseAuthUid, DEFAULT_USER_ROLE, fullName, avatarUrl],
      );
    } catch (error) {
      this.logger.warn(`Failed to link Google identity in auth tables: ${this.toSafeErrorMessage(error)}`);
    }
  }

  private async callSupabase(
    path: string,
    body: Record<string, string>,
    operation: AuthOperation,
  ): Promise<SupabaseAuthTokenResponse> {
    const url = this.buildSupabaseUrl(path);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`Supabase auth call failed: ${this.toSafeErrorMessage(error)}`);
      throw new AppError({
        code: ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Unable to reach the authentication service.',
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      });
    }

    if (!response.ok) {
      await this.throwMappedError(response, operation);
    }

    return (await response.json()) as SupabaseAuthTokenResponse;
  }

  private extractUserMetadata(meta?: Record<string, unknown> | null): {
    displayName: string | null;
    avatarUrl: string | null;
  } {
    if (!meta || typeof meta !== 'object') {
      return { displayName: null, avatarUrl: null };
    }

    const fullName =
      typeof meta.full_name === 'string' && meta.full_name.trim()
        ? meta.full_name.trim()
        : typeof meta.name === 'string' && meta.name.trim()
        ? meta.name.trim()
        : [
            typeof meta.given_name === 'string' ? meta.given_name.trim() : '',
            typeof meta.family_name === 'string' ? meta.family_name.trim() : '',
          ]
            .filter(Boolean)
            .join(' ')
            .trim() || null;

    const avatarUrl =
      typeof meta.avatar_url === 'string' && meta.avatar_url.trim()
        ? meta.avatar_url.trim()
        : typeof meta.picture === 'string' && meta.picture.trim()
        ? meta.picture.trim()
        : null;

    return { displayName: fullName, avatarUrl };
  }

  private buildAuthUserAndProfile(
    supabaseAuthUid: string,
    email: string | null,
    bootstrapResult?: BootstrapProfileResult,
    fallbackMeta?: { displayName: string | null; avatarUrl: string | null },
  ): { user: AuthUserInfo; profile?: AuthProfileInfo } {
    const displayName = bootstrapResult?.displayName ?? fallbackMeta?.displayName ?? undefined;
    const avatarUrl = bootstrapResult?.avatarUrl ?? fallbackMeta?.avatarUrl ?? undefined;
    const preferredLanguage = bootstrapResult?.preferredLanguage ?? undefined;
    const timezone = bootstrapResult?.timezone ?? undefined;
    const profileId = bootstrapResult?.profileId ?? undefined;
    const hasProfileDetails =
      displayName !== undefined ||
      avatarUrl !== undefined ||
      preferredLanguage !== undefined ||
      timezone !== undefined ||
      profileId !== undefined;

    const user: AuthUserInfo = {
      id: supabaseAuthUid,
      email,
      ...(hasProfileDetails && bootstrapResult?.internalUserId
        ? { internalUserId: bootstrapResult.internalUserId }
        : {}),
      ...(profileId !== undefined ? { profileId } : {}),
      ...(displayName !== undefined ? { displayName } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(preferredLanguage !== undefined ? { preferredLanguage } : {}),
      ...(timezone !== undefined ? { timezone } : {}),
      ...(bootstrapResult?.userType ? { userType: bootstrapResult.userType } : {}),
      ...(bootstrapResult?.status ? { status: bootstrapResult.status } : {}),
    };

    const profile: AuthProfileInfo | undefined = hasProfileDetails
      ? {
          id: profileId ?? null,
          profileType: bootstrapResult?.profileType ?? 'student_profile',
          displayName: displayName ?? null,
          avatarUrl: avatarUrl ?? null,
          preferredLanguage: preferredLanguage ?? null,
          timezone: timezone ?? null,
        }
      : undefined;

    return { user, profile };
  }

  private toTokenResult(response: SupabaseAuthTokenResponse): AuthTokenResult {
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: this.resolveExpiresAt(response.expires_at, response.expires_in),
    };
  }

  private resolveExpiresAt(expiresAt: number | undefined, expiresIn: number | undefined): number {
    if (typeof expiresAt === 'number') {
      return expiresAt;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    return nowSeconds + (expiresIn ?? 3600);
  }

  private async throwMappedError(response: Response, operation: AuthOperation): Promise<never> {
    let errorBody: SupabaseAuthErrorResponse = {};
    try {
      errorBody = (await response.json()) as SupabaseAuthErrorResponse;
    } catch {
      // Ignore parse failures — fall back to status-based mapping below.
    }

    const reason = [
      errorBody.error_code,
      errorBody.msg,
      errorBody.error_description,
      errorBody.message,
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase()
      .replace(/_/g, ' ');

    if (operation === 'register') {
      if (response.status === 422 || reason.includes('already registered') || reason.includes('already exists')) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: 'An account with this email already exists. Try signing in instead.',
          statusCode: HttpStatus.CONFLICT,
        });
      }

      if (reason.includes('password') && (reason.includes('weak') || reason.includes('short') || reason.includes('characters'))) {
        throw new AppError({
          code: ApiErrorCode.BAD_REQUEST,
          message: 'Please choose a stronger password.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }

      if (reason.includes('email') && (reason.includes('invalid') || reason.includes('format'))) {
        throw new AppError({
          code: ApiErrorCode.BAD_REQUEST,
          message: 'Please enter a valid email address.',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    if (operation === 'login' && reason.includes('email') && reason.includes('not confirmed')) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Please confirm your email address before signing in.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (response.status === 429 || reason.includes('rate limit')) {
      throw new AppError({
        code: ApiErrorCode.TOO_MANY_REQUESTS,
        message: 'Too many attempts. Please wait a moment and try again.',
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
      });
    }

    if (operation === 'login' || operation === 'refresh' || operation === 'google') {
      if (response.status === 400 || response.status === 401) {
        throw new AppError({
          code: ApiErrorCode.UNAUTHORIZED,
          message:
            operation === 'refresh'
              ? 'Your session has expired. Please sign in again.'
              : operation === 'google'
              ? 'Invalid Google authentication token.'
              : 'Incorrect email or password.',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      }
    }

    this.logger.warn(
      `Supabase auth call returned status ${response.status} [${errorBody.error_code ?? 'unknown'}]`,
    );

    throw new AppError({
      code: ApiErrorCode.EXTERNAL_SERVICE_ERROR,
      message: 'The authentication service returned an unexpected error.',
      statusCode: HttpStatus.BAD_GATEWAY,
    });
  }

  private buildHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      apikey: this.config.supabase.serviceRoleKey,
      Authorization: `Bearer ${this.config.supabase.serviceRoleKey}`,
    };
  }

  private buildSupabaseUrl(path: string): string {
    const baseUrl = this.config.supabase.url.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
  }

  private toSafeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }

    return 'UnknownError';
  }
}
