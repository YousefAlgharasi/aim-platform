/**
 * P8-063: Build Chat Session Start Service (Group G — AI Teacher Backend
 * Pipeline). Creates a new, student-owned `ai_chat_sessions` row via
 * `AiChatSessionRepository` (P8-026). `studentId` ownership is resolved
 * by the caller (e.g. from the authenticated JWT, in a later API task);
 * this service never validates ownership itself, only that the inputs it
 * is given are present. Performs no AI provider call and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 *
 * P21-007: `startSession` now resolves to the same `ai_chat_sessions` row
 * for a given (studentId, contextRef) pair rather than always creating a
 * new one — this is the single entry point both the AI Teacher chat screen
 * and the Voice Teacher screen call into (VoiceSessionStartService
 * delegates here directly), so a lesson's chat and voice turns share one
 * conversation.
 *
 * P21-008/P21-009: When get-or-create actually creates a brand-new session,
 * this service immediately generates one opening greeting message (reusing
 * AiTeacherOrchestratorService's existing AI-call path — never a second,
 * parallel AI-call mechanism) and eagerly synthesizes its audio, so the
 * greeting is ready to play the instant the student opens either screen.
 */
import { Inject, Injectable, BadRequestException, Logger, Optional } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { AiChatMessageRepository } from '../repositories/ai-chat-message.repository';
import { AiTeacherOrchestratorService } from '../orchestrator/ai-teacher-orchestrator.service';
import { ContextBuilderService } from '../context-builder/context-builder.service';
import {
  TTS_GATEWAY,
  TtsGateway,
} from '../../voice-teacher/tts-gateway/tts-gateway.interface';
import { StartChatSessionInput, StartChatSessionResult } from './chat-session-start.types';
import { FocusRecapService } from './focus-recap.service';

// P21-009: same default used by the Voice Teacher audio-submit API
// (voice-audio-submit.controller.ts) for this codebase's Arabic-speaking
// A1-level English learner base; used only when synthesizing the greeting's
// audio, never as an AIM authority signal.
const DEFAULT_GREETING_LANGUAGE_CODE = 'ar';

@Injectable()
export class ChatSessionStartService {
  private readonly logger = new Logger(ChatSessionStartService.name);

  constructor(
    private readonly chatSessionRepository: AiChatSessionRepository,
    private readonly chatMessageRepository: AiChatMessageRepository,
    private readonly aiTeacherOrchestrator: AiTeacherOrchestratorService,
    private readonly contextBuilder: ContextBuilderService,
    /**
     * P21-009: TTS Gateway — same `TTS_GATEWAY` token used by the Voice
     * Teacher orchestrator. Declared `@Optional()` so this service still
     * compiles/works in test contexts that don't import TtsGatewayModule;
     * when null, the greeting stays text-only (no different from a TTS
     * provider failure).
     */
    @Optional()
    @Inject(TTS_GATEWAY)
    private readonly ttsGateway: TtsGateway | null,
    private readonly focusRecap: FocusRecapService,
  ) {}

  async startSession(input: StartChatSessionInput): Promise<StartChatSessionResult> {
    const studentId = input.studentId?.trim();
    const contextRef = input.contextRef?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot start an AI chat session: studentId is missing.');
    }

    if (!contextRef) {
      throw new BadRequestException('Cannot start an AI chat session: contextRef is missing.');
    }

    // P21-007: resolve to the same session both chat and voice would use for
    // this (student, contextRef) pair, rather than always creating a new row.
    const { session, created } = await this.chatSessionRepository.getOrCreateForContext(
      studentId,
      contextRef,
    );

    if (created) {
      // Awaited so the greeting exists before the response is returned, but
      // any failure here must never fail session creation — it's caught and
      // logged rather than rethrown.
      await this.generateOpeningGreeting(session.id, studentId, contextRef).catch((error) => {
        this.logger.error(
          `Failed to generate opening greeting for session ${session.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });
    }

    // P21-012: derived independently of greeting generation — the recap is
    // shown on every session-start response, not only when a new session
    // was just created.
    const focusRecap = await this.focusRecap.getFocusRecap(studentId);

    return {
      sessionId: session.id,
      studentId: session.student_id,
      contextRef: session.context_ref,
      status: session.status,
      createdAt: session.created_at,
      focusRecap,
    };
  }

  /**
   * P21-008: build context, generate an opening greeting via the existing
   * AI Teacher orchestrator AI-call path, and persist it as the first
   * ai_chat_messages row (role='ai_teacher', is_greeting=true, channel='text').
   * P21-009: immediately after persisting, synthesize its audio eagerly so
   * it is ready to play instantly once the Voice Teacher screen opens.
   */
  private async generateOpeningGreeting(
    sessionId: string,
    studentId: string,
    contextRef: string,
  ): Promise<void> {
    const greeting = await this.aiTeacherOrchestrator.generateGreeting({
      studentId,
      sessionId,
      contextRef,
    });

    const greetingMessage = await this.chatMessageRepository.create(
      sessionId,
      studentId,
      'ai_teacher',
      greeting.text,
      { channel: 'text', isGreeting: true },
    );

    await this.contextBuilder.persistSnapshot(greetingMessage.id, greeting.context);

    // P21-009: synthesize the greeting's audio eagerly, right after
    // persisting the text. `channel` intentionally stays 'text' (its origin
    // channel — this message was generated the moment the session was
    // created, not spoken by anyone) — a non-null `audio_ref` is the actual
    // "voice playback available" signal, decoupled from origin channel, so
    // Voice Teacher can play this greeting without it being mislabeled as a
    // voice-originated turn. TTS failure must never fail session creation:
    // any error here is caught, logged, and the greeting stays text-only —
    // audio_ref simply stays null until a future retry/lazy-synthesis path
    // (P21-011) fills it in.
    if (!this.ttsGateway) {
      this.logger.warn(
        `TTS_GATEWAY not bound; greeting message ${greetingMessage.id} stays text-only.`,
      );
      return;
    }

    try {
      const ttsResult = await this.ttsGateway.synthesize({
        text: greeting.text,
        languageCode: DEFAULT_GREETING_LANGUAGE_CODE,
        sessionId,
        studentId,
      });

      if (ttsResult.status === 'success' && ttsResult.audioRef) {
        await this.chatMessageRepository.updateAudio(
          greetingMessage.id,
          ttsResult.audioRef,
          ttsResult.durationMs,
        );
      } else {
        this.logger.warn(
          `Greeting TTS synthesis did not succeed for message ${greetingMessage.id}; text greeting still works.`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Greeting TTS synthesis threw for message ${greetingMessage.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
