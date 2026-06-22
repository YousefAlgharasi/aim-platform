/**
 * P9-053: Generate AI Teacher Text Response for Voice (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Produces the end-to-end "AI text
 * response from voice transcript" flow by composing:
 *
 *   1. `VoiceSessionContextLinkService` (P9-052) — resolves the
 *      backend-owned, ownership-validated Phase 8 AI Teacher `contextRef`
 *      for this voice session.
 *   2. `TranscriptToAiTeacherService` (P9-051) — forwards the transcript
 *      into the existing AI Teacher Orchestrator (P8-062) using that
 *      `contextRef`.
 *
 * This service performs no STT/TTS/AI provider call itself, holds no
 * provider credentials, and computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value — those remain exclusively assembled
 * by the Phase 8 AI Teacher Context Builder
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { TranscriptToAiTeacherService } from '../transcript-pipeline/transcript-to-ai-teacher.service';
import { VoiceSessionContextLinkService } from '../context-link/voice-session-context-link.service';
import { GenerateVoiceResponseInput, GenerateVoiceResponseResult } from './voice-response-generation.types';

@Injectable()
export class VoiceResponseGenerationService {
  constructor(
    private readonly contextLink: VoiceSessionContextLinkService,
    private readonly transcriptToAiTeacher: TranscriptToAiTeacherService,
  ) {}

  async generateResponse(input: GenerateVoiceResponseInput): Promise<GenerateVoiceResponseResult> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot generate a voice response: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot generate a voice response: sessionId is missing.');
    }

    const link = await this.contextLink.resolveContext({ studentId, sessionId });

    const dispatchResult = await this.transcriptToAiTeacher.dispatch({
      studentId: link.studentId,
      sessionId: link.sessionId,
      contextRef: link.contextRef,
      transcript: input.transcript ?? '',
      isTranscriptFallback: input.isTranscriptFallback,
    });

    return {
      text: dispatchResult.text,
      isFallback: dispatchResult.isFallback,
      provider: dispatchResult.provider,
      model: dispatchResult.model,
    };
  }
}
