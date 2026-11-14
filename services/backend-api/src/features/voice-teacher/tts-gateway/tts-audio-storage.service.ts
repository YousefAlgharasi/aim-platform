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

/**
 * How long a synthesized reply stays in memory, and how many clips are kept at most. The clips are only needed for
 * the moment the student plays the reply; without a limit every reply ever synthesized stayed in memory for as long
 * as the process lived. The oldest clips are dropped first.
 */
const AUDIO_TTL_MS = 30 * 60 * 1000;
const MAX_STORED_CLIPS = 300;

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

      this.evictStale();
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

  /** Drops expired clips, then the oldest ones beyond the capacity (a Map iterates in insertion order). */
  private evictStale(): void {
    const now = Date.now();
    for (const [ref, entry] of this.store) {
      if (now - entry.storedAt > AUDIO_TTL_MS) this.store.delete(ref);
    }
    while (this.store.size >= MAX_STORED_CLIPS) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
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

    if (Date.now() - entry.storedAt > AUDIO_TTL_MS) {
      this.store.delete(audioRef);
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
