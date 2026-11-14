/**
 * P21-011: Lazy on-demand TTS for text-originated AI turns.
 *
 * A text-chat turn is generated as text only — synthesizing audio for every
 * single text turn would be wasted TTS spend if the student never opens
 * voice mode. But once a student switches to voice mode mid-conversation,
 * that same turn needs playable audio too. This service is the single path
 * both entry points funnel through: given a message id, synthesize its text
 * only if `audio_ref` is still null, then persist the result on that same
 * row so it is never re-synthesized (cache-on-row, not a separate cache).
 */
import { Inject, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';

import { AiChatMessageRepository } from '../../ai-teacher/repositories/ai-chat-message.repository';
import { AiChatMessageRow } from '../../ai-teacher/repositories/ai-chat-repository.types';
import { TTS_GATEWAY, TtsGateway } from '../tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../tts-gateway/tts-safe-failure.service';

export interface EnsureAudioResult {
  readonly messageId: string;
  readonly audioRef: string | null;
  readonly audioDurationMs: number | null;
  readonly synthesized: boolean;
}

@Injectable()
export class VoiceMessageAudioService {
  private readonly logger = new Logger(VoiceMessageAudioService.name);

  /**
   * Syntheses in progress, by message id. A second request for a message whose audio is already being made (the
   * student pressed play again, the app retried after a slow answer) waits for that same synthesis instead of paying
   * for and waiting on another one.
   */
  private readonly inFlight = new Map<string, Promise<EnsureAudioResult>>();

  constructor(
    private readonly chatMessageRepository: AiChatMessageRepository,
    @Optional() @Inject(TTS_GATEWAY) private readonly ttsGateway: TtsGateway | null,
    private readonly ttsSafeFailure: TtsSafeFailureService,
  ) {}

  /**
   * Given a message id owned by `studentId`, return its audio, synthesizing
   * it first if `audio_ref` is currently null. Returns `synthesized: false`
   * when an existing `audio_ref` was reused (cache hit) or the row belongs
   * to `role='student'` (no reply audio ever exists for a student turn).
   */
  async ensureAudio(
    messageId: string,
    studentId: string,
    languageCode: string,
    options: { forceRegenerate?: boolean } = {},
  ): Promise<EnsureAudioResult> {
    const message = await this.chatMessageRepository.findById(messageId);

    if (!message || message.student_id !== studentId) {
      throw new NotFoundException('Message not found');
    }

    // forceRegenerate: the stored clip is gone (the clips live in memory, so a restart or another server instance
    // loses them) even though the row still points at it; make it again instead of answering "no audio".
    if (message.audio_ref && !options.forceRegenerate) {
      // Cache hit: never re-synthesize.
      return {
        messageId: message.id,
        audioRef: message.audio_ref,
        audioDurationMs: message.audio_duration_ms,
        synthesized: false,
      };
    }

    const running = this.inFlight.get(message.id);
    if (running) return running;

    const synthesis = this.synthesizeAndPersist(message, studentId, languageCode).finally(() => {
      this.inFlight.delete(message.id);
    });
    this.inFlight.set(message.id, synthesis);
    return synthesis;
  }

  private async synthesizeAndPersist(
    message: AiChatMessageRow,
    studentId: string,
    languageCode: string,
  ): Promise<EnsureAudioResult> {
    if (!this.ttsGateway) {
      this.logger.warn(
        `VoiceMessageAudioService.ensureAudio: TTS_GATEWAY not bound, cannot synthesize messageId=${message.id}`,
      );
      return {
        messageId: message.id,
        audioRef: null,
        audioDurationMs: null,
        synthesized: false,
      };
    }

    const response = await this.ttsGateway.synthesize({
      text: message.text,
      languageCode,
      sessionId: message.session_id,
      studentId,
    });

    const outcome = this.ttsSafeFailure.toSafeOutcome(response);

    if (outcome.isFallback || !outcome.audioRef) {
      this.logger.warn(
        `VoiceMessageAudioService.ensureAudio: synthesis failed for messageId=${message.id}`,
      );
      return {
        messageId: message.id,
        audioRef: null,
        audioDurationMs: null,
        synthesized: false,
      };
    }

    const updated = await this.chatMessageRepository.updateAudio(
      message.id,
      outcome.audioRef,
      response.durationMs,
    );

    return {
      messageId: message.id,
      audioRef: updated?.audio_ref ?? outcome.audioRef,
      audioDurationMs: updated?.audio_duration_ms ?? response.durationMs,
      synthesized: true,
    };
  }
}
