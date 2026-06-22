/**
 * P8-064: Build Student Message Submit Service (Group G — AI Teacher
 * Backend Pipeline). Receives a student's chat message and starts the AI
 * Teacher response pipeline via `AiTeacherOrchestratorService` (P8-062),
 * which itself coordinates context building, prompt building, the AI
 * provider gateway, and persistence. Performs no AI provider call itself
 * and computes no mastery/level/weakness/difficulty/recommendation/
 * review-schedule value (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../orchestrator/ai-teacher-orchestrator.service';
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

    const result = await this.orchestrator.handleTurn({
      studentId,
      sessionId,
      contextRef,
      studentMessage,
    });

    return {
      text: result.text,
      isFallback: result.isFallback,
      provider: result.provider,
      model: result.model,
      latencyMs: result.latencyMs,
    };
  }
}
