/**
 * P9-032: Persist Audio Metadata.
 * Orchestrates the two writes that must happen atomically after audio
 * upload validation passes:
 *   1. Write raw audio bytes to backend-managed opaque storage via
 *      AudioStorageAdapter (P9-031) → returns a storageKey that is never
 *      a filesystem path or a public URL.
 *   2. Persist the opaque storageKey together with content-type and
 *      decoded duration into the `voice_audio_assets` table via
 *      VoiceAudioAssetRepository (P9-027 / P9-020 migration).
 *
 * This service is the sole place that links a voice_message row to a
 * stored audio file. Callers (AudioUploadService) receive the resulting
 * `assetId` and include it in the upload result so the orchestration
 * layer (P9-068+) can hand the opaque reference to the STT gateway
 * without ever exposing raw bytes or a storage path to the client.
 *
 * Invariants enforced here:
 * - No STT/TTS/AI provider is called; this is pure byte storage +
 *   metadata persistence.
 * - No AIM Engine-owned field (mastery, weakness, difficulty,
 *   recommendation, review schedule) is written or read.
 * - No raw audio bytes, filesystem paths, or provider credentials are
 *   returned to callers; only the opaque assetId crosses the boundary.
 * - The studentId stored on voice_audio_assets matches the sessionId
 *   owner verified upstream in AudioUploadService — this service trusts
 *   the caller to have performed that check.
 */
import { Inject, Injectable } from '@nestjs/common';

import {
  AUDIO_STORAGE_ADAPTER,
  AudioStorageAdapter,
} from '../audio-storage/audio-storage.adapter';
import { VoiceAudioAssetRepository } from '../repositories/voice-audio-asset.repository';
import { AudioMetadataPersistenceInput, AudioMetadataPersistenceResult } from './audio-metadata-persistence.types';

@Injectable()
export class AudioMetadataPersistenceService {
  constructor(
    @Inject(AUDIO_STORAGE_ADAPTER)
    private readonly storageAdapter: AudioStorageAdapter,
    private readonly audioAssetRepo: VoiceAudioAssetRepository,
  ) {}

  /**
   * Writes audio bytes to opaque storage and persists the resulting
   * storageKey + metadata as a voice_audio_assets record.
   * Returns the new asset row's `id` (opaque UUID) and the storageKey.
   * Throws on storage or DB failure — callers should handle and map to
   * an appropriate HTTP error.
   */
  async persist(
    input: AudioMetadataPersistenceInput,
  ): Promise<AudioMetadataPersistenceResult> {
    const { storageKey } = await this.storageAdapter.write({
      studentId: input.studentId,
      contentType: input.contentType,
      data: input.audio,
    });

    const assetRow = await this.audioAssetRepo.create(
      input.messageId,
      input.studentId,
      storageKey,
      input.contentType,
      input.durationMs,
    );

    return {
      assetId: assetRow.id,
      storageKey,
    };
  }
}
