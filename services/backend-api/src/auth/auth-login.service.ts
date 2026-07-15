// Sole caller of the Supabase Auth REST API.
//
// Security rules:
//   - SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL never leave the backend process.
//   - Clients only ever see { accessToken, refreshToken, expiresAt, user }.
//   - Supabase error payloads are mapped to safe AppError codes; raw Supabase
//     error bodies are never forwarded to clients.

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { BackendConfigService } from '../config/backend-config.service';
import { AppError } from '../common/errors/app-error';
import { ApiErrorCode } from '../common/errors/api-error-code';
import {
  AuthForgotPasswordInput,
  AuthForgotPasswordResult,
  AuthLoginInput,
  AuthLoginResult,
  AuthRefreshInput,
  AuthRegisterInput,
  AuthRegisterResult,
  AuthTokenResult,
  SupabaseAuthErrorResponse,
  SupabaseAuthTokenResponse,
  SupabaseSignUpResponse,
} from './auth-login.types';

type AuthOperation = 'login' | 'refresh' | 'register';

const SUPABASE_TOKEN_PATH = '/auth/v1/token';
const SUPABASE_SIGNUP_PATH = '/auth/v1/signup';
const SUPABASE_RECOVER_PATH = '/auth/v1/recover';
const SUPABASE_LOGOUT_PATH = '/auth/v1/logout';
const SUPABASE_ADMIN_USERS_PATH = '/auth/v1/admin/users';
const SUPABASE_REQUEST_TIMEOUT_MS = 8000;
const MOBILE_EMAIL_CONFIRMATION_REDIRECT_URL = 'aimapp://login-callback';
const DEFAULT_USER_ROLE = 'student';

@Injectable()
export class AuthLoginService {
  private readonly logger = new Logger(AuthLoginService.name);

  constructor(private readonly config: BackendConfigService) {}

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

    const tokens = this.toTokenResult(response);

    return {
      ...tokens,
      user: {
        id: response.user?.id ?? '',
        email: response.user?.email ?? input.email,
      },
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

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ email: input.email, password: input.password }),
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
    const newUserId = body.user?.id ?? body.id;

    if (newUserId) {
      await this.assignDefaultRole(newUserId);
    }

    if (!body.access_token || !body.refresh_token) {
      return { requiresEmailConfirmation: true };
    }

    // The tokens above were minted before the role assignment, so re-mint
    // them to get a JWT whose app_metadata reflects the assigned role.
    const freshTokens = await this.callSupabase(
      `${SUPABASE_TOKEN_PATH}?grant_type=password`,
      { email: input.email, password: input.password },
      'register',
    );

    return {
      requiresEmailConfirmation: false,
      accessToken: freshTokens.access_token,
      refreshToken: freshTokens.refresh_token,
      expiresAt: this.resolveExpiresAt(freshTokens.expires_at, freshTokens.expires_in),
      user: {
        id: freshTokens.user?.id ?? newUserId ?? '',
        email: freshTokens.user?.email ?? body.email ?? input.email,
      },
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
        throw new AppError({
          code: ApiErrorCode.TOO_MANY_REQUESTS,
          message: 'Too many attempts. Please wait a moment and try again.',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
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
          message: 'Please choose a stronger password (at least 6 characters).',
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

    if (operation === 'login' || operation === 'refresh') {
      if (response.status === 400 || response.status === 401) {
        throw new AppError({
          code: ApiErrorCode.UNAUTHORIZED,
          message:
            operation === 'refresh'
              ? 'Your session has expired. Please sign in again.'
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
