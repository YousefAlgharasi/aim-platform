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
const SUPABASE_LOGOUT_PATH = '/auth/v1/logout';
const SUPABASE_REQUEST_TIMEOUT_MS = 8000;

@Injectable()
export class AuthLoginService {
  private readonly logger = new Logger(AuthLoginService.name);

  constructor(private readonly config: BackendConfigService) {}

  async login(input: AuthLoginInput): Promise<AuthLoginResult> {
    const response = await this.callSupabase(
      `${SUPABASE_TOKEN_PATH}?grant_type=password`,
      { email: input.email, password: input.password },
      'login',
    );

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
    const url = this.buildSupabaseUrl(SUPABASE_SIGNUP_PATH);

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

    if (!body.access_token || !body.refresh_token) {
      return { requiresEmailConfirmation: true };
    }

    return {
      requiresEmailConfirmation: false,
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      expiresAt: this.resolveExpiresAt(body.expires_at, body.expires_in),
      user: {
        id: body.user?.id ?? body.id ?? '',
        email: body.user?.email ?? body.email ?? input.email,
      },
    };
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
