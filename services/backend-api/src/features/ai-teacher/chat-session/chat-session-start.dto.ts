// P8-071: Create Start Chat API — request DTO.
//
// studentId is intentionally absent. It is never accepted from the client;
// it is always resolved server-side from the verified JWT
// (chat-session-start.controller.ts).

import { HttpStatus } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';

export class StartChatSessionRequestDto {
  readonly contextRef!: string;

  static fromBody(body: unknown): StartChatSessionRequestDto {
    const contextRef = (body as Record<string, unknown> | null)?.contextRef;

    if (typeof contextRef !== 'string' || contextRef.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'contextRef is required and must be a non-empty string.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return { contextRef: contextRef.trim() };
  }
}
