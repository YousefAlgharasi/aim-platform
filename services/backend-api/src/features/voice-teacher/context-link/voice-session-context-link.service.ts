/**
 * P9-052: Link Voice Session With AI Teacher Context (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Resolves the Phase 8 AI Teacher
 * `contextRef` (Group D, P8-028..P8-040) a Voice Mode turn must use from
 * the backend-owned `voice_sessions` row (P9-049), instead of trusting any
 * client-supplied `contextRef` at turn time. Callers such as
 * `TranscriptToAiTeacherService` (P9-051) and `VoiceOrchestratorService`
 * (P9-048) should resolve `contextRef` through this service so the same
 * backend-approved context the session was started with is always the one
 * used to build the Phase 8 AI Teacher context snapshot. Performs no
 * STT/TTS/AI provider call and computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value itself.
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

import { VoiceSessionRepository } from '../repositories/voice-session.repository';
import { ResolveVoiceSessionContextInput, VoiceSessionContextLink } from './voice-session-context-link.types';

@Injectable()
export class VoiceSessionContextLinkService {
  constructor(private readonly voiceSessionRepository: VoiceSessionRepository) {}

  async resolveContext(input: ResolveVoiceSessionContextInput): Promise<VoiceSessionContextLink> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot resolve voice session context: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot resolve voice session context: sessionId is missing.');
    }

    const session = await this.voiceSessionRepository.findById(sessionId);

    if (!session || session.student_id !== studentId) {
      throw new NotFoundException('Cannot resolve voice session context: session not found or not owned by studentId.');
    }

    if (session.status !== 'active') {
      throw new BadRequestException('Cannot resolve voice session context: session is not active.');
    }

    return {
      sessionId: session.id,
      studentId: session.student_id,
      contextRef: session.context_ref,
    };
  }
}
