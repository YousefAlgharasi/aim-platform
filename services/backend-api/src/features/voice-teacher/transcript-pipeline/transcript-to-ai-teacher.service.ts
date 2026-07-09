/**
 * P9-051: Connect Transcript to Phase 8 AI Teacher Pipeline (Group F —
 * Voice Orchestration With Phase 8 AI Teacher). Forwards a backend-mapped
 * STT transcript (P9-044) into `AiTeacherOrchestratorService.handleTurn()`
 * (P8-062) as `studentMessage`, formalizing the seam between the STT
 * pipeline and the existing AI Teacher text pipeline as its own testable
 * unit. Context assembly, mastery/level/weakness/difficulty/recommendation/
 * review-schedule values, and AI provider credentials remain exclusively
 * resolved by the AI Teacher pipeline; this service adds nothing to those
 * decisions and never calls an AI provider directly.
 */
import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';

import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AiTeacherOrchestratorService } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
import { RateLimitExceededError } from '../../ai-teacher/rate-limit-policy/rate-limit-exceeded.error';
import { AiQuotaExceededError } from '../../ai-teacher/governance/ai-quota-exceeded.error';
import { AiInputBlockedError } from '../../ai-teacher/governance/ai-input-blocked.error';
import { DispatchTranscriptInput, DispatchTranscriptResult } from './transcript-to-ai-teacher.types';

@Injectable()
export class TranscriptToAiTeacherService {
  constructor(private readonly aiTeacherOrchestrator: AiTeacherOrchestratorService) {}

  async dispatch(input: DispatchTranscriptInput): Promise<DispatchTranscriptResult> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();
    const contextRef = input.contextRef?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot dispatch transcript to AI Teacher: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot dispatch transcript to AI Teacher: sessionId is missing.');
    }

    if (!contextRef) {
      throw new BadRequestException('Cannot dispatch transcript to AI Teacher: contextRef is missing.');
    }

    let aiResult;
    try {
      aiResult = await this.aiTeacherOrchestrator.handleTurn({
        studentId,
        sessionId,
        contextRef,
        studentMessage: input.transcript ?? '',
      });
    } catch (error) {
      // Same translation as the text-chat path (chat-message-submit.service.ts)
      // — a clean 429/403 instead of a generic 500 that reads as a crash.
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
      text: aiResult.text,
      isFallback: input.isTranscriptFallback || aiResult.isFallback,
      provider: aiResult.provider,
      model: aiResult.model,
    };
  }
}
