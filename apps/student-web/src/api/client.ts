import { config } from '../config';
import type { ApiError } from '../types';
import { getLocale, t } from '../i18n';

// Backend envelope: { success: true, data, meta } | { success: false, error: { code, message, statusCode, details } }
// See services/backend-api/src/common/api/api-response.types.ts.

const ACCESS_TOKEN_KEY = 'aim_access_token';
const REFRESH_TOKEN_KEY = 'aim_refresh_token';
const EXPIRES_AT_KEY = 'aim_expires_at';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RequestOptions {
  /** Attach the bearer token (default true). */
  auth?: boolean;
  /** Explicit bearer token, e.g. a password-recovery token from an email link. */
  token?: string;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode) — session lasts for this tab only.
  }
}

function toApiError(body: unknown, status: number, fallback: string): ApiError {
  const err = (body as { error?: Partial<ApiError> } | null)?.error;
  return {
    code: err?.code ?? `HTTP_${status}`,
    statusCode: err?.statusCode ?? status,
    message: err?.message || fallback,
    details: err?.details,
  };
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null;
  private refreshInFlight: Promise<boolean> | null = null;
  private sessionExpiredListeners = new Set<() => void>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.accessToken = readStorage(ACCESS_TOKEN_KEY);
  }

  hasSession(): boolean {
    return !!(this.accessToken || readStorage(REFRESH_TOKEN_KEY));
  }

  setSession(tokens: SessionTokens | null) {
    this.accessToken = tokens?.accessToken ?? null;
    writeStorage(ACCESS_TOKEN_KEY, tokens?.accessToken ?? null);
    writeStorage(REFRESH_TOKEN_KEY, tokens?.refreshToken ?? null);
    writeStorage(EXPIRES_AT_KEY, tokens ? String(tokens.expiresAt) : null);
  }

  /** Kept for existing callers; prefer setSession. */
  setAccessToken(token: string | null) {
    if (token === null) {
      this.setSession(null);
      return;
    }
    this.accessToken = token;
    writeStorage(ACCESS_TOKEN_KEY, token);
  }

  /** Called when the refresh token is rejected; returns an unsubscribe function. */
  onSessionExpired(listener: () => void): () => void {
    this.sessionExpiredListeners.add(listener);
    return () => this.sessionExpiredListeners.delete(listener);
  }

  private async refresh(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;
    const refreshToken = readStorage(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    this.refreshInFlight = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return false;
        const body = await response.json();
        const tokens = body?.data as SessionTokens | undefined;
        if (!tokens?.accessToken) return false;
        this.setSession(tokens);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();
    return this.refreshInFlight;
  }

  private expireSession() {
    this.setSession(null);
    this.sessionExpiredListeners.forEach((listener) => listener());
  }

  private async send(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions,
    isRetry = false,
  ): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    let payload: BodyInit | undefined;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const useAuth = options.auth !== false;
    const token = options.token ?? (useAuth ? this.accessToken : null);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { method, headers, body: payload });
    } catch {
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        statusCode: 0,
        message: t("Can't reach the server. Check your connection and try again."),
      };
      throw networkError;
    }

    if (response.status === 401 && useAuth && !options.token && !isRetry) {
      if (await this.refresh()) {
        return this.send(method, path, body, options, true);
      }
      if (this.hasSession()) this.expireSession();
    }
    return response;
  }

  private async request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await this.send(method, path, body, options);

    if (response.status === 204) {
      return undefined as T;
    }

    const responseBody = await response.json().catch(() => null);

    if (!response.ok || responseBody?.success === false) {
      throw toApiError(responseBody, response.status, response.statusText || 'Request failed');
    }

    return (responseBody?.data ?? null) as T;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  /** Multipart upload (e.g. recorded audio). Do not set Content-Type; the browser adds the boundary. */
  postForm<T>(path: string, form: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, form, options);
  }

  /** Authenticated binary download (e.g. TTS audio), returned as a Blob for an object URL. */
  async getBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
    const response = await this.send('GET', path, undefined, options);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw toApiError(body, response.status, 'Failed to load audio');
    }
    return response.blob();
  }
}

export const apiClient = new ApiClient(config.apiBaseUrl);

/** Message for any caught error, preferring the backend's envelope message. */
const ARABIC_RE = /[\u0600-\u06FF]/;

export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const message = (err as { message?: unknown } | null)?.message;
  const localizedFallback = t(fallback);
  if (typeof message !== 'string' || !message) return localizedFallback;
  const translated = t(message);
  // Backend messages are English. In Arabic, show only ones with a translation;
  // otherwise use the (already localized) caller fallback.
  if (getLocale() === 'ar' && translated === message && !ARABIC_RE.test(message)) return localizedFallback;
  return translated;
}
