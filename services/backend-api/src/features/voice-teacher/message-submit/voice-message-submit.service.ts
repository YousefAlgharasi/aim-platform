/**
 * P9-050: Build Voice Message Submit Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Coordinates a full student voice-message submit:
 *
 *   1. Audio Upload (P9-028) — validates the upload (field presence, file
 *      size, declared MIME type, declared duration), checks session
 *      ownership/status, and creates a pending `voice_messages` row.
 *   2. Voice Orchestrator (P9-048) — runs STT → AI Teacher (P8-062) for the
 *      uploaded audio and returns a safety-filtered reply.
 *   3. Persists the reply (and audio reference, once TTS is wired) onto the
 *      same `voice_messages` row via `VoiceMessageRepository` (P9-027).
 *
 * `studentId`/`sessionId` ownership is resolved by the caller before this
 * service runs; this service only validates the inputs it is given. Performs
 * no STT/TTS/AI provider call itself and computes no mastery/level/weakness/
 * difficulty/recommendation/review-schedule value
 * (docs/phase-9/no-aim-authority-change-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { AudioUploadService } from '../audio-upload/audio-upload.service';
import { VoiceOrchestratorService } from '../orchestrator/voice-orchestrator.service';
import { VoiceMessageRepository } from '../repositories/voice-message.repository';
import {
  SubmitVoiceMessageInput,
  SubmitVoiceMessageResult,
  SubmitVoiceMessageValidationError,
} from './voice-message-submit.types';

@Injectable()
export class VoiceMessageSubmitService {
  constructor(
    private readonly audioUploadService: AudioUploadService,
    private readonly voiceOrchestrator: VoiceOrchestratorService,
    private readonly voiceMessageRepository: VoiceMessageRepository,
  ) {}

  async submitMessage(
    input: SubmitVoiceMessageInput,
  ): Promise<SubmitVoiceMessageResult | SubmitVoiceMessageValidationError> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();
    const contextRef = input.contextRef?.trim();
    const languageCode = input.languageCode?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot submit a voice message: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot submit a voice message: sessionId is missing.');
    }

    if (!contextRef) {
      throw new BadRequestException('Cannot submit a voice message: contextRef is missing.');
    }

    if (!languageCode) {
      throw new BadRequestException('Cannot submit a voice message: languageCode is missing.');
    }

    const upload = await this.audioUploadService.upload({
      sessionId,
      studentId,
      audio: input.audio,
      mimeType: input.mimeType,
      durationMs: input.durationMs,
    });

    if ('error' in upload) {
      return upload;
    }

    const turnResult = await this.voiceOrchestrator.handleTurn({
      studentId,
      sessionId,
      contextRef,
      audio: input.audio,
      contentType: input.mimeType,
      languageCode,
    });

    if (turnResult.audioRef) {
      await this.voiceMessageRepository.updateAudioRef(upload.messageId, turnResult.audioRef);
    } else {
      await this.voiceMessageRepository.updateReply(upload.messageId, turnResult.text);
    }

    return {
      messageId: upload.messageId,
      reply: turnResult.text,
      audioRef: turnResult.audioRef,
      isFallback: turnResult.isFallback,
    };
  }
}
