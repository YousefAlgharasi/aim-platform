/**
 * P9-050: Build Voice Message Submit Service (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Coordinates a full student voice-message submit:
 *
 *   1. Audio Upload (P9-028) — validates the upload (field presence, file
 *      size, declared MIME type, declared duration), checks session
 *      ownership/status (against `ai_chat_sessions`, per P21-021b), and
 *      stores the raw uploaded audio bytes: an empty placeholder
 *      `ai_chat_messages` row (role='student', channel='voice') +
 *      `voice_audio_assets` row anchored to it. As of P21-021b, this is no
 *      longer a `voice_messages` row — `voice_audio_assets.ai_chat_message_id`
 *      now anchors new rows, decoupling the raw-audio-storage pipeline from
 *      the legacy table entirely.
 *   2. Voice Orchestrator (P9-048) — runs STT → AI Teacher (P8-062) for the
 *      uploaded audio, passing along the placeholder row's id
 *      (`studentMessageId`). As of P21-021b,
 *      `AiTeacherOrchestratorService.handleTurn()` fills in that same
 *      placeholder row with the real transcript (rather than inserting a
 *      second student row) and persists the AI reply as its own
 *      `ai_chat_messages` row (channel='voice'); the orchestrator attaches
 *      the synthesized TTS `audio_ref` onto that reply row. This service
 *      never writes to `voice_messages`/`voice_transcripts` — those tables
 *      receive no new turn data going forward (historical rows only).
 *
 * P21-014 (barge-in verification): this service and VoiceOrchestratorService
 * hold no in-flight/per-session lock and no "previous turn must be
 * completed" status check — each submitMessage() call always creates a
 * fresh voice_messages placeholder row and runs a fresh STT->AI Teacher->TTS
 * pipeline independent of any other in-flight submission for the same
 * session. Two overlapping submissions for the same session are both
 * accepted and persist in the order their upload step completes (see
 * `voice-message-submit.service.spec.ts`'s barge-in test). No lock was
 * found or removed — this is a documented, tested confirmation only.
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
      // P21-021b: the placeholder ai_chat_messages row upload.messageId
      // already refers to (created by AudioUploadService, anchoring the
      // voice_audio_assets row) is where the real transcript belongs.
      studentMessageId: upload.messageId,
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
