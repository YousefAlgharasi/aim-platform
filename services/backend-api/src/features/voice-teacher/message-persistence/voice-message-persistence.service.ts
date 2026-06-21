/**
 * P9-054: Persist Voice Conversation Messages (Group F — Voice
 * Orchestration With Phase 8 AI Teacher). Stores a completed voice turn —
 * the mapped STT transcript (P9-044) and the AI Teacher text response
 * (P9-053) — onto the pending `voice_messages` row created at upload time
 * (P9-028) and a new `voice_transcripts` row (P9-021), via the existing
 * `VoiceMessageRepository` and `VoiceTranscriptRepository` (P9-027).
 *
 * Performs no STT/TTS/AI provider call itself and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md). Never persists raw audio
 * bytes or provider credentials — only mapped, student-safe text.
 */
import { Injectable } from '@nestjs/common';

import { VoiceMessageRepository } from '../repositories/voice-message.repository';
import { VoiceTranscriptRepository } from '../repositories/voice-transcript.repository';
import { PersistVoiceTurnInput, PersistVoiceTurnResult } from './voice-message-persistence.types';

@Injectable()
export class VoiceMessagePersistenceService {
  constructor(
    private readonly voiceMessageRepository: VoiceMessageRepository,
    private readonly voiceTranscriptRepository: VoiceTranscriptRepository,
  ) {}

  async persistTurn(input: PersistVoiceTurnInput): Promise<PersistVoiceTurnResult> {
    const messageId = input.messageId?.trim();
    const sessionId = input.sessionId?.trim();

    if (!messageId) {
      throw new Error('Cannot persist voice turn: messageId is missing.');
    }

    if (!sessionId) {
      throw new Error('Cannot persist voice turn: sessionId is missing.');
    }

    await this.voiceMessageRepository.updateTranscript(messageId, input.transcript ?? '');

    const transcriptRow = await this.voiceTranscriptRepository.create(
      messageId,
      sessionId,
      input.transcript ?? '',
      input.languageCode ?? null,
      input.confidence ?? null,
      null,
      null,
    );

    await this.voiceMessageRepository.updateReply(messageId, input.reply ?? '');

    return {
      messageId,
      transcriptId: transcriptRow.id,
    };
  }
}
