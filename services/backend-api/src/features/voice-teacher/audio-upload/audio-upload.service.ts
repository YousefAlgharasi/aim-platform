/**
 * P9-028: Build Audio Upload Service.
 * P9-029: Add Audio File Validation.
 * Receives validated audio from the voice API endpoint, enforces the
 * backend validation sequence from docs/phase-9/audio-upload-contract.md
 * (steps 3–8: field presence, file size, declared MIME type, actual MIME
 * type via magic-byte sniffing, declared duration, and actual duration
 * decoded from the container header), creates a pending voice message
 * record via VoiceMessageRepository, and returns the message ID. Steps
 * 1–2 (auth + session ownership) are handled by the API
 * controller/guard layer before this service is called. The STT Gateway
 * call is wired by a later orchestration task. This service never calls
 * an STT/TTS/AI provider, never holds provider credentials, and never
 * computes any AIM Engine-owned value.
 */
import { Injectable } from '@nestjs/common';

import { VoiceMessageRepository } from '../repositories/voice-message.repository';
import { VoiceSessionRepository } from '../repositories/voice-session.repository';
import {
  AUDIO_UPLOAD_ALLOWED_MIME_TYPES,
  AUDIO_UPLOAD_MAX_DURATION_MS,
  AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES,
  AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY,
  AUDIO_UPLOAD_MIN_DURATION_MS,
} from './audio-upload.constants';
import { decodeActualAudioDurationMs } from './audio-duration-decoder';
import { detectAudioContainerFamily } from './audio-format-sniffer';
import {
  AudioUploadInput,
  AudioUploadResult,
  AudioUploadValidationError,
} from './audio-upload.types';

@Injectable()
export class AudioUploadService {
  constructor(
    private readonly voiceSessionRepo: VoiceSessionRepository,
    private readonly voiceMessageRepo: VoiceMessageRepository,
  ) {}

  async upload(
    input: AudioUploadInput,
  ): Promise<AudioUploadResult | AudioUploadValidationError> {
    const validationError = this.validate(input);
    if (validationError) {
      return validationError;
    }

    const session = await this.voiceSessionRepo.findById(input.sessionId);
    if (!session || session.student_id !== input.studentId) {
      return { statusCode: 403, error: 'Forbidden' };
    }

    if (session.status !== 'active') {
      return { statusCode: 403, error: 'Forbidden' };
    }

    const message = await this.voiceMessageRepo.create(
      input.sessionId,
      input.studentId,
    );

    return { messageId: message.id, status: 'pending' };
  }

  private validate(
    input: AudioUploadInput,
  ): AudioUploadValidationError | null {
    if (!input.audio || !input.mimeType || input.durationMs == null) {
      return { statusCode: 400, error: 'Bad Request' };
    }

    if (input.audio.length > AUDIO_UPLOAD_MAX_FILE_SIZE_BYTES) {
      return { statusCode: 413, error: 'Payload Too Large' };
    }

    if (
      !AUDIO_UPLOAD_ALLOWED_MIME_TYPES.includes(
        input.mimeType as (typeof AUDIO_UPLOAD_ALLOWED_MIME_TYPES)[number],
      )
    ) {
      return { statusCode: 400, error: 'Bad Request' };
    }

    const expectedFamily =
      AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY[
        input.mimeType as keyof typeof AUDIO_UPLOAD_MIME_TO_CONTAINER_FAMILY
      ];
    const actualFamily = detectAudioContainerFamily(input.audio);
    if (!actualFamily || actualFamily !== expectedFamily) {
      return { statusCode: 400, error: 'Bad Request' };
    }

    if (
      !Number.isInteger(input.durationMs) ||
      input.durationMs < AUDIO_UPLOAD_MIN_DURATION_MS ||
      input.durationMs > AUDIO_UPLOAD_MAX_DURATION_MS
    ) {
      return { statusCode: 400, error: 'Bad Request' };
    }

    const actualDurationMs = decodeActualAudioDurationMs(
      input.audio,
      actualFamily,
    );
    if (
      actualDurationMs == null ||
      actualDurationMs < AUDIO_UPLOAD_MIN_DURATION_MS ||
      actualDurationMs > AUDIO_UPLOAD_MAX_DURATION_MS
    ) {
      return { statusCode: 400, error: 'Bad Request' };
    }

    return null;
  }
}
