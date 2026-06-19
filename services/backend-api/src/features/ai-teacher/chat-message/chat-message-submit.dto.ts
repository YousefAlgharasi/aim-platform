// P8-072: Create Send Message API — request DTO.
//
// sessionId is never accepted here from the body — it comes from the route
// param and is cross-checked against the session owner server-side
// (chat-message-submit.controller.ts). studentId is never accepted from the
// client at all; it is always JWT-resolved.

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

export class SendChatMessageRequestDto {
  readonly message!: string;

  static fromBody(body: unknown): SendChatMessageRequestDto {
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
