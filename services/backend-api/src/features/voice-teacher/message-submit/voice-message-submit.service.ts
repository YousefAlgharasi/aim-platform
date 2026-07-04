/**
 * P9-050: Build Voice Message Submit Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Coordinates a full student voice-message submit:
 *
 *   1. Audio Upload (P9-028) — validates the upload (field presence, file
 *      size, declared MIME type, declared duration), checks session
 *      ownership/status, and stores the raw uploaded audio bytes (a
 *      `voice_messages` placeholder row + `voice_audio_assets` row — this
 *      step is unchanged by P21-010: `voice_audio_assets.message_id` has a
 *      hard FK to `voice_messages`, so the raw-audio-storage pipeline is a
 *      separate concern from where the conversation text/reply live).
 *   2. Voice Orchestrator (P9-048) — runs STT → AI Teacher (P8-062) for the
 *      uploaded audio. As of P21-010, `AiTeacherOrchestratorService.handleTurn()`
 *      already persists both the transcribed student turn and the AI reply
 *      as `ai_chat_messages` rows (channel='voice'), and the orchestrator
 *      attaches the synthesized TTS `audio_ref` onto that same reply row.
 *      This service no longer writes the reply/transcript into
 *      `voice_messages`/`voice_transcripts` — those tables receive no new
 *      turn data going forward (historical rows only).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { AudioUploadService } from '../audio-upload/audio-upload.service';
import { VoiceOrchestratorService } from '../orchestrator/voice-orchestrator.service';
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

    // P21-010: the transcript + reply (and, when synthesis succeeds, the
    // reply's audio_ref) are already persisted as ai_chat_messages rows by
    // the voice orchestrator's call into AiTeacherOrchestratorService — no
    // separate write into voice_messages/voice_transcripts here.

    return {
      messageId: upload.messageId,
      reply: turnResult.text,
      audioRef: turnResult.audioRef,
      isFallback: turnResult.isFallback,
    };
  }
}
