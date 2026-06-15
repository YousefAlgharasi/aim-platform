import {
  parseApiResponseEnvelope,
  type ApiJsonDecoder,
  type ApiSuccessEnvelope,
} from './api-response-envelope';
import { getAdminApiConfig, type AdminApiConfig } from './admin-api-config';
import { AdminApiClientError } from './admin-api-client-error';

type Fetcher = typeof fetch;

type AdminApiRequestOptions = {
  readonly headers?: HeadersInit;
  readonly query?: Record<string, string | number | boolean | undefined>;
};

type AdminApiBodyRequestOptions = AdminApiRequestOptions & {
  readonly body?: unknown;
};

export class AdminApiClient {
  constructor(
    private readonly config: AdminApiConfig = getAdminApiConfig(),
    private readonly fetcher: Fetcher = fetch,
  ) {}

  buildUrl(path: string, query?: AdminApiRequestOptions['query']): string {
    const baseUrl = new URL(this.config.backendApiBaseUrl);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const basePath = baseUrl.pathname.endsWith('/')
      ? baseUrl.pathname.slice(0, -1)
      : baseUrl.pathname;

    baseUrl.pathname = `${basePath}${normalizedPath}`;

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          baseUrl.searchParams.set(key, String(value));
        }
      }
    }

    return baseUrl.toString();
  }

  async get<T>(
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiRequestOptions = {},
  ): Promise<ApiSuccessEnvelope<T>> {
    return this.request<T>('GET', path, decodeData, options);
  }

  async post<T>(
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiBodyRequestOptions = {},
  ): Promise<ApiSuccessEnvelope<T>> {
    return this.request<T>('POST', path, decodeData, options);
  }

  async put<T>(
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiBodyRequestOptions = {},
  ): Promise<ApiSuccessEnvelope<T>> {
    return this.request<T>('PUT', path, decodeData, options);
  }

  async patch<T>(
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiBodyRequestOptions = {},
  ): Promise<ApiSuccessEnvelope<T>> {
    return this.request<T>('PATCH', path, decodeData, options);
  }

  async delete<T>(
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiRequestOptions = {},
  ): Promise<ApiSuccessEnvelope<T>> {
    return this.request<T>('DELETE', path, decodeData, options);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    decodeData: ApiJsonDecoder<T>,
    options: AdminApiBodyRequestOptions,
  ): Promise<ApiSuccessEnvelope<T>> {
    const response = await this.fetcher(this.buildUrl(path, options.query), {
      method,
      headers: this.buildHeaders(options.headers),
      body:
        (method === 'POST' || method === 'PUT' || method === 'PATCH') && options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
      cache: 'no-store',
    });

    const body = await this.parseJson(response);
    const envelope = parseApiResponseEnvelope<T>(body, decodeData);

    if (!envelope.success) {
      throw new AdminApiClientError({
        status: response.status,
        error: envelope.error,
      });
    }

    return envelope;
  }

  private buildHeaders(headers?: HeadersInit): Headers {
    const nextHeaders = new Headers(headers);

    if (!nextHeaders.has('accept')) {
      nextHeaders.set('accept', 'application/json');
    }

    if (!nextHeaders.has('content-type')) {
      nextHeaders.set('content-type', 'application/json');
    }

    return nextHeaders;
  }

  private async parseJson(response: Response): Promise<unknown> {
    const text = await response.text();

    if (text.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'EMPTY_RESPONSE',
          message: 'Backend API returned an empty response.',
        },
        meta: {},
      };
    }

    try {
      return JSON.parse(text) as unknown;
    } catch {
      return {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Backend API returned invalid JSON.',
        },
        meta: {},
      };
    }
  }
}

export const adminApiClient = new AdminApiClient();
