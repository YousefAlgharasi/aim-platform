// P18-043: Create AI Streaming Message API — request DTO.
//
// sessionId is never accepted here from the body — it comes from the route
// param and is cross-checked against the session owner server-side
// (ai-teacher-stream-message.controller.ts). studentId is never accepted
// from the client at all; it is always JWT-resolved.

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

export class StreamChatMessageRequestDto {
  readonly message!: string;

  static fromBody(body: unknown): StreamChatMessageRequestDto {
    const message = (body as Record<string, unknown> | null)?.message;

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'message is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return { message: message.trim() };
  }
}
