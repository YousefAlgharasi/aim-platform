import { ApiErrorCode } from './api-error-code';

export interface AppErrorOptions {
  readonly code: ApiErrorCode | string;
  readonly message: string;
  readonly statusCode: number;
  readonly details?: unknown;
}

export class AppError extends Error {
  readonly code: ApiErrorCode | string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;
  }
}
