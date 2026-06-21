import { Injectable, Logger } from '@nestjs/common';

import {
  TtsAudioStorageInput,
  TtsAudioStorageResult,
} from './tts-audio-storage.types';

const ERROR_CATEGORY_STORAGE = 'TTS_AUDIO_STORAGE_FAILED';
const ALLOWED_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
]);

@Injectable()
export class TtsAudioStorageService {
  private readonly logger = new Logger(TtsAudioStorageService.name);
  private readonly store = new Map<string, { data: Buffer; contentType: string; durationMs: number | null; sessionId: string; studentId: string; storedAt: number }>();

  async storeAudio(input: TtsAudioStorageInput): Promise<TtsAudioStorageResult> {
    try {
      if (!input.audioRef || !input.audioData || input.audioData.length === 0) {
        return {
          audioRef: input.audioRef,
          stored: false,
          errorCategory: ERROR_CATEGORY_STORAGE,
        };
      }

      if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
        return {
          audioRef: input.audioRef,
          stored: false,
          errorCategory: ERROR_CATEGORY_STORAGE,
        };
      }

      this.store.set(input.audioRef, {
        data: input.audioData,
        contentType: input.contentType,
        durationMs: input.durationMs,
        sessionId: input.sessionId,
        studentId: input.studentId,
        storedAt: Date.now(),
      });

      this.logger.log(
        `TtsAudioStorageService.storeAudio: stored audioRef=${input.audioRef} session=${input.sessionId} size=${input.audioData.length}`,
      );

      return { audioRef: input.audioRef, stored: true };
    } catch (error: unknown) {
      this.logger.error(
        `TtsAudioStorageService.storeAudio: failed audioRef=${input.audioRef}`,
      );
      return {
        audioRef: input.audioRef,
        stored: false,
        errorCategory: ERROR_CATEGORY_STORAGE,
      };
    }
  }

  async retrieveAudio(
    audioRef: string,
    studentId: string,
  ): Promise<{ data: Buffer; contentType: string } | null> {
    const entry = this.store.get(audioRef);
    if (!entry) {
      return null;
    }

    if (entry.studentId !== studentId) {
      this.logger.warn(
        `TtsAudioStorageService.retrieveAudio: ownership mismatch for audioRef=${audioRef}`,
      );
      return null;
    }

    return { data: entry.data, contentType: entry.contentType };
  }
}
