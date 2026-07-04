/**
 * P9-049: Build Voice Session Start Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). `studentId` ownership is resolved by the caller
 * (e.g. from the authenticated JWT, in the P9-068 API task); this service
 * never validates ownership itself, only that the inputs it is given are
 * present. Performs no STT/TTS/AI provider call itself and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 *
 * P21-007: No longer creates its own `voice_sessions` row. Delegates
 * directly to `ChatSessionStartService.startSession()` — the same
 * get-or-create-by-(studentId, contextRef) path the AI Teacher chat entry
 * point uses — so a lesson's chat and voice turns resolve to the same
 * `ai_chat_sessions` row and share one conversation (including the P21-008
 * auto-generated opening greeting). `voice_sessions` stops receiving new
 * rows going forward; existing rows remain for historical reads (P21-021).
 */
import { Injectable } from '@nestjs/common';

import { ChatSessionStartService } from '../../ai-teacher/chat-session/chat-session-start.service';
import { StartVoiceSessionInput, StartVoiceSessionResult } from './voice-session-start.types';

@Injectable()
export class VoiceSessionStartService {
  constructor(private readonly chatSessionStartService: ChatSessionStartService) {}

  async startSession(input: StartVoiceSessionInput): Promise<StartVoiceSessionResult> {
    const result = await this.chatSessionStartService.startSession({
      studentId: input.studentId,
      contextRef: input.contextRef,
    });

    return {
      sessionId: result.sessionId,
      studentId: result.studentId,
      contextRef: result.contextRef,
      status: result.status,
      createdAt: result.createdAt,
      focusRecap: result.focusRecap,
      lastSessionRecap: result.lastSessionRecap,
    };
  }
}
