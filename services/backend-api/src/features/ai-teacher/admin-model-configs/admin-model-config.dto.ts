// P18-049: Create Admin AI Model Config API
// Request body validation for status changes and limits/parameters updates.
// Never accepts a provider secret/API key — only the non-secret
// provider_key_ref already stored on the row is read back, never written
// here.

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

const STATUSES = ['draft', 'active', 'retired'] as const;
type ModelConfigStatus = (typeof STATUSES)[number];

export class UpdateModelConfigStatusDto {
  private constructor(readonly status: ModelConfigStatus) {}

  static fromBody(body: unknown): UpdateModelConfigStatusDto {
    if (!body || typeof body !== 'object') {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Body is required.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const { status } = body as Record<string, unknown>;

    if (typeof status !== 'string' || !STATUSES.includes(status as ModelConfigStatus)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `status must be one of: ${STATUSES.join(', ')}`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return new UpdateModelConfigStatusDto(status as ModelConfigStatus);
  }
}

export class UpdateModelConfigLimitsDto {
  private constructor(
    readonly limits: Record<string, unknown>,
    readonly parameters: Record<string, unknown>,
  ) {}

  static fromBody(body: unknown): UpdateModelConfigLimitsDto {
    if (!body || typeof body !== 'object') {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Body is required.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const { limits, parameters } = body as Record<string, unknown>;

    if (!limits || typeof limits !== 'object' || Array.isArray(limits)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'limits must be an object.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'parameters must be an object.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return new UpdateModelConfigLimitsDto(
      limits as Record<string, unknown>,
      parameters as Record<string, unknown>,
    );
  }
}
