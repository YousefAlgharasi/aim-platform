/**
 * P9-049: Build Voice Session Start Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Creates a new, student-owned `voice_sessions`
 * row via `VoiceSessionRepository`, mirroring `ChatSessionStartService`
 * (P8-063). `studentId` ownership is resolved by the caller (e.g. from the
 * authenticated JWT, in the P9-068 API task); this service never validates
 * ownership itself, only that the inputs it is given are present. Performs
 * no STT/TTS/AI provider call and computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { VoiceSessionRepository } from './voice-session.repository';
import { StartVoiceSessionInput, StartVoiceSessionResult } from './voice-session-start.types';

@Injectable()
export class VoiceSessionStartService {
  constructor(private readonly voiceSessionRepository: VoiceSessionRepository) {}

  async startSession(input: StartVoiceSessionInput): Promise<StartVoiceSessionResult> {
    const studentId = input.studentId?.trim();
    const contextRef = input.contextRef?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot start a voice session: studentId is missing.');
    }

    if (!contextRef) {
      throw new BadRequestException('Cannot start a voice session: contextRef is missing.');
    }

    const session = await this.voiceSessionRepository.create(studentId, contextRef);

    return {
      sessionId: session.id,
      studentId: session.student_id,
      contextRef: session.context_ref,
      status: session.status,
      createdAt: session.created_at,
    };
  }
}
