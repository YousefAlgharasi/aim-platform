/**
 * P9-034: Add Audio Upload Safe Failure Handling (Group D — Backend
 * Audio Upload & Validation). Wraps AudioUploadService.upload() so that
 * any unexpected error (storage write failure, database error, unhandled
 * exception) is converted into a safe, student-facing fallback response.
 *
 * Design constraints:
 * - Internal details (stack traces, storage paths, SQL errors) are never
 *   exposed to the client — only the fixed fallback message is returned.
 * - Validation errors (400, 413) and auth errors (403) from
 *   AudioUploadService pass through unchanged — they are already safe.
 * - This service never computes any AIM Engine-owned value
 *   (docs/phase-9/no-aim-authority-change-rule.md).
 * - No STT/TTS/AI provider call is made here.
 */
import { Injectable, Logger } from '@nestjs/common';

import { AudioUploadService } from './audio-upload.service';
import {
  AudioUploadInput,
  AudioUploadResult,
  AudioUploadValidationError,
} from './audio-upload.types';
import { AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE } from './audio-upload-safe-failure.constants';

export interface AudioUploadSafeResult {
  readonly result: AudioUploadResult | AudioUploadValidationError;
  readonly isFallback: boolean;
}

@Injectable()
export class AudioUploadSafeFailureService {
  private readonly logger = new Logger(AudioUploadSafeFailureService.name);

  constructor(private readonly uploadService: AudioUploadService) {}

  async safeUpload(input: AudioUploadInput): Promise<AudioUploadSafeResult> {
    try {
      const result = await this.uploadService.upload(input);
      return { result, isFallback: false };
    } catch (error) {
      this.logger.error(
        'Audio upload failed unexpectedly',
        error instanceof Error ? error.stack : String(error),
      );

      return {
        result: {
          statusCode: 500,
          error: AUDIO_UPLOAD_SAFE_FALLBACK_MESSAGE,
        },
        isFallback: true,
      };
    }
  }
}
