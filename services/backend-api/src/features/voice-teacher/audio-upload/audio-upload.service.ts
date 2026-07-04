/**
 * P9-028: Build Audio Upload Service.
 * P9-029: Add Audio File Validation.
 * P9-030: Add Audio Duration Policy.
 * P9-032: Persist Audio Metadata — after validation passes, writes audio
 *         bytes to opaque backend storage and creates a voice_audio_assets
 *         row via AudioMetadataPersistenceService. Returns assetId alongside
 *         messageId so the orchestration layer can reference stored audio
 *         without ever touching a filesystem path or public URL.
 *
 * Receives validated audio from the voice API endpoint, enforces the
 * backend validation sequence from docs/phase-9/audio-upload-contract.md
 * (steps 3–8: field presence, file size, declared MIME type, actual MIME
 * type via magic-byte sniffing, declared duration, and actual duration
 * decoded from the container header), creates a placeholder student turn
 * record, persists audio + metadata via AudioMetadataPersistenceService,
 * and returns messageId + assetId. Steps 1–2 (auth + session ownership)
 * are handled by the API controller/guard layer before this service is
 * called (this service's own ownership/status check is a second,
 * defense-in-depth layer for any caller that reaches it directly). Both
 * the declared and actual duration checks delegate to
 * evaluateAudioDurationPolicy so the min/max rule lives in one place.
 * The STT Gateway call is wired by a later orchestration task. This
 * service never calls an STT/TTS/AI provider, never holds provider
 * credentials, and never computes any AIM Engine-owned value.
 *
 * P21-021b: session ownership/status is now checked against
 * `ai_chat_sessions` via `AiChatSessionRepository`, not the legacy
 * `voice_sessions` table — `VoiceSessionStartService` (P21-007) stopped
 * creating new `voice_sessions` rows, so checking there would have 403'd
 * every audio upload for a post-P21-007 session (the ownership check
 * would always find no row). The placeholder turn row this service
 * creates to anchor the `voice_audio_assets` row is now an `ai_chat_messages`
 * row (role='student', channel='voice', empty text) instead of a
 * `voice_messages` row — `VoiceOrchestratorService` fills in the real
 * transcript on this same row once STT completes (see
 * `AiTeacherOrchestratorService.handleTurn`'s `existingStudentMessageId`),
 * rather than inserting a second student turn.
 */
import { Injectable } from '@nestjs/common';

import { AiChatMessageRepository } from '../../ai-teacher/repositories/ai-chat-message.repository';
import { AiChatSessionRepository } from '../../ai-teacher/repositories/ai-chat-session.repository';
import {
  AUDIO_UPLOAD_ALLOWED_MIME_TYPES,
  AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES,
  AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY,
} from './audio-upload.constants';
import { decodeActualAudioDurationMs } from './audio-duration-decoder';
import { evaluateAudioDurationPolicy } from './audio-duration-policy';
import { detectAudioContainerFamily } from './audio-format-sniffer';
import { AudioMetadataPersistenceService } from './audio-metadata-persistence.service';
import {
  AudioUploadInput,
  AudioUploadResult,
  AudioUploadValidationError,
} from './audio-upload.types';
import { AudioContainerFamily } from './audio-container.types';

/** Internal result of the validation step — error or confirmed details. */
type ValidationPass = {
  ok: true;
  actualFamily: AudioContainerFamily;
  actualDurationMs: number;
};
type ValidationFail = { ok: false; error: AudioUploadValidationError };

@Injectable()
export class AudioUploadService {
  constructor(
    private readonly chatSessionRepo: AiChatSessionRepository,
    private readonly chatMessageRepo: AiChatMessageRepository,
    private readonly audioMetadataPersistence: AudioMetadataPersistenceService,
  ) {}

  async upload(
    input: AudioUploadInput,
  ): Promise<AudioUploadResult | AudioUploadValidationError> {
    const validation = this.validate(input);
    if (!validation.ok) {
      return validation.error;
    }

    const session = await this.chatSessionRepo.findById(input.sessionId);
    if (!session || session.student_id !== input.studentId) {
      return { statusCode: 403, error: 'Forbidden' };
    }

    if (session.status !== 'active') {
      return { statusCode: 403, error: 'Forbidden' };
    }

    // P21-021b: placeholder student turn row, empty until STT fills in the
    // real transcript in place (see AiTeacherOrchestratorService.handleTurn's
    // existingStudentMessageId) — this is purely the voice_audio_assets FK
    // anchor, not yet the real conversation turn.
    const message = await this.chatMessageRepo.create(
      input.sessionId,
      input.studentId,
      'student',
      '',
      { channel: 'voice' },
    );

    // P9-032: Persist bytes to opaque storage + write voice_audio_assets row.
    const { assetId } = await this.audioMetadataPersistence.persist({
      aiChatMessageId: message.id,
      studentId: input.studentId,
      audio: input.audio,
      contentType: input.mimeType,
      durationMs: validation.actualDurationMs,
    });

    return { messageId: message.id, assetId, status: 'pending' };
  }

  private validate(input: AudioUploadInput): ValidationPass | ValidationFail {
    const fail = (statusCode: number, error: string): ValidationFail => ({
      ok: false,
      error: { statusCode, error },
    });

    if (!input.audio || !input.mimeType || input.durationMs == null) {
      return fail(400, 'Bad Request');
    }

    if (input.audio.length > AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES) {
      return fail(413, 'Payload Too Large');
    }

    if (
      !AUDIO_UPLOAD_ALLOWED_MIME_TYPES.includes(
        input.mimeType as (typeof AUDIO_UPLOAD_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return fail(400, 'Bad Request');
    }

    const expectedFamily =
      AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY[
        input.mimeType as keyof typeof AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY
      ];
    const actualFamily = detectAudioContainerFamily(input.audio);
    if (!actualFamily || actualFamily !== expectedFamily) {
      return fail(400, 'Bad Request');
    }

    if (!Number.isInteger(input.durationMs)) {
      return fail(400, 'Bad Request');
    }

    const declaredPolicy = evaluateAudioDurationPolicy(input.durationMs);
    if (!declaredPolicy.valid) {
      return fail(400, 'Bad Request');
    }

    const actualDurationMs = decodeActualAudioDurationMs(
      input.audio,
      actualFamily,
    );
    if (actualDurationMs == null) {
      return fail(400, 'Bad Request');
    }

    const actualPolicy = evaluateAudioDurationPolicy(actualDurationMs);
    if (!actualPolicy.valid) {
      return fail(400, 'Bad Request');
    }

    return { ok: true, actualFamily, actualDurationMs };
  }
}
