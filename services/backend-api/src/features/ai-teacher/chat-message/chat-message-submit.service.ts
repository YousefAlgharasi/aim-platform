/**
 * P8-064: Build Student Message Submit Service (Group G — AI Teacher
 * Backend Pipeline). Receives a student's chat message and starts the AI
 * Teacher response pipeline via `AiTeacherOrchestratorService` (P8-062),
 * which itself coordinates context building, prompt building, the AI
 * provider gateway, and persistence. Performs no AI provider call itself
 * and computes no mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-8/no-aim-replacement-rule.md).
 */
import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AiTeacherOrchestratorService } from '../orchestrator/ai-teacher-orchestrator.service';
import { RateLimitExceededError } from '../rate-limit-policy/rate-limit-exceeded.error';
import { AiQuotaExceededError } from '../governance/ai-quota-exceeded.error';
import { AiInputBlockedError } from '../governance/ai-input-blocked.error';
import { SubmitStudentMessageInput, SubmitStudentMessageResult } from './chat-message-submit.types';

@Injectable()
export class ChatMessageSubmitService {
  constructor(private readonly orchestrator: AiTeacherOrchestratorService) {}

  async submitMessage(input: SubmitStudentMessageInput): Promise<SubmitStudentMessageResult> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();
    const contextRef = input.contextRef?.trim();
    const studentMessage = input.studentMessage?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot submit a student message: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot submit a student message: sessionId is missing.');
    }

    if (!contextRef) {
      throw new BadRequestException('Cannot submit a student message: contextRef is missing.');
    }

    if (!studentMessage) {
      throw new BadRequestException('Cannot submit a student message: studentMessage is missing.');
    }

    let result;
    try {
      result = await this.orchestrator.handleTurn({
        studentId,
        sessionId,
        contextRef,
        studentMessage,
      });
    } catch (error) {
      // These are expected, student-facing rejections with their own safe
      // messages — translate them into a proper AppError so the global
      // exception filter returns a clean 429/403 the client can render
      // meaningfully, instead of falling through to a generic 500
      // ("temporarily unavailable") that looks like a real crash.
      if (error instanceof RateLimitExceededError) {
        throw new AppError({
          code: ApiErrorCode.RATE_LIMITED,
          message: error.message,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          details: error.retryAfterSeconds !== null
            ? { retryAfterSeconds: error.retryAfterSeconds }
            : undefined,
        });
      }
      if (error instanceof AiQuotaExceededError) {
        throw new AppError({
          code: ApiErrorCode.RATE_LIMITED,
          message: error.message,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        });
      }
      if (error instanceof AiInputBlockedError) {
        throw new AppError({
          code: ApiErrorCode.FORBIDDEN,
          message: error.message,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
      throw error;
    }

    return {
      text: result.text,
      isFallback: result.isFallback,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs,
    };
  }
}
