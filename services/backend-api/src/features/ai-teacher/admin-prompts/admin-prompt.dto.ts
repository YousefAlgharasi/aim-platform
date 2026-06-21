// P18-048: Create Admin AI Prompt Management API — request DTO.
//
// Admins draft a new template body/name/locale/audience; version is always
// server-computed (never client-supplied) and a draft never becomes active
// until an explicit publish call.

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

export class CreatePromptTemplateDraftDto {
  readonly name!: string;
  readonly locale!: string;
  readonly audience!: string;
  readonly body!: string;
  readonly safetyTags?: Record<string, unknown>;

  static fromBody(body: unknown): CreatePromptTemplateDraftDto {
    const input = body as Record<string, unknown> | null;
    const name = input?.name;
    const locale = input?.locale;
    const audience = input?.audience;
    const templateBody = input?.body;

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'name is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (typeof locale !== 'string' || locale.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'locale is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (typeof audience !== 'string' || audience.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'audience is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (typeof templateBody !== 'string' || templateBody.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'body is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const safetyTags = input?.safetyTags;

    return {
      name: name.trim(),
      locale: locale.trim(),
      audience: audience.trim(),
      body: templateBody,
      safetyTags:
        safetyTags && typeof safetyTags === 'object'
          ? (safetyTags as Record<string, unknown>)
          : undefined,
    };
  }
}
