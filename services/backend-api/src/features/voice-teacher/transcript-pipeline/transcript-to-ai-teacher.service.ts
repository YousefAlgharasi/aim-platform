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
import { Injectable, BadRequestException } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.service';
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

    const aiResult = await this.aiTeacherOrchestrator.handleTurn({
      studentId,
      sessionId,
      contextRef,
      studentMessage: input.transcript ?? '',
    });

    return {
      text: aiResult.text,
      isFallback: input.isTranscriptFallback || aiResult.isFallback,
      provider: aiResult.provider,
      model: aiResult.model,
    };
  }
}
