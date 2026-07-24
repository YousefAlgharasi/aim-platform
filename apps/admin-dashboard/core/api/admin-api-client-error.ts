import type { ApiErrorEnvelope } from './api-error-envelope';

export class AdminApiClientError extends Error {
  constructor({
    status,
    error,
  }: Readonly<{
    status?: number;
    error: ApiErrorEnvelope;
  }>) {
    super(error.message);
    this.name = 'AdminApiClientError';
    this.status = status;
    this.code = error.code;
    this.details = error.details;
  }

  readonly status?: number;
  readonly code: string;
  readonly details?: unknown;
}
