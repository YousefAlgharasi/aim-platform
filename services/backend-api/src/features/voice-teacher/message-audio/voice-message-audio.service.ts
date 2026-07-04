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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AiChatMessageRepository } from '../../ai-teacher/repositories/ai-chat-message.repository';
import { AiChatMessageRow } from '../../ai-teacher/repositories/ai-chat-repository.types';
import { TTS_GATEWAY, TtsGateway } from '../tts-gateway/tts-gateway.interface';
import { TtsSafeFailureService } from '../tts-gateway/tts-safe-failure.service';
import { Inject, Optional } from '@nestjs/common';

export interface EnsureAudioResult {
  readonly messageId: string;
  readonly audioRef: string | null;
  readonly audioDurationMs: number | null;
  readonly synthesized: boolean;
}

@Injectable()
export class VoiceMessageAudioService {
  private readonly logger = new Logger(VoiceMessageAudioService.name);

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
  async ensureAudio(messageId: string, studentId: string, languageCode: string): Promise<EnsureAudioResult> {
    const message = await this.chatMessageRepository.findById(messageId);

    if (!message || message.student_id !== studentId) {
      throw new NotFoundException('Message not found');
    }

    if (message.audio_ref) {
      // Cache hit: never re-synthesize.
      return {
        messageId: message.id,
        audioRef: message.audio_ref,
        audioDurationMs: message.audio_duration_ms,
        synthesized: false,
      };
    }

    return this.synthesizeAndPersist(message, studentId, languageCode);
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
