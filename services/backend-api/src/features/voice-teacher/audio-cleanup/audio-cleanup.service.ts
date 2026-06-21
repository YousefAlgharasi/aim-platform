/**
 * P9-033: Add Audio Cleanup Policy.
 * Executes deletion of voice audio assets that are eligible for cleanup
 * according to AudioCleanupPolicyService. For each eligible asset:
 *   1. Deletes the raw audio file via AudioStorageAdapter.delete(storageKey).
 *   2. Deletes the voice_audio_assets row from the database.
 *   3. Nullifies voice_messages.audio_ref for the parent message.
 *
 * Cleanup is idempotent: if the file is already gone from storage, or the
 * DB row is already deleted, the operation continues without error.
 *
 * This service never calls an STT, TTS, or AI provider. It never reads or
 * writes any AIM Engine-owned field (mastery, weakness, difficulty,
 * recommendation, review schedule). Raw audio bytes are never logged.
 *
 * Callers:
 * - A scheduled job that invokes runCleanup() on a configurable interval
 *   (default every 6 hours; overridable via VOICE_AUDIO_CLEANUP_INTERVAL_MS).
 * - The voice session-end flow for opportunistic inline cleanup of a
 *   specific session (runCleanupForSession()).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import {
  AUDIO_STORAGE_ADAPTER,
  AudioStorageAdapter,
} from '../audio-storage/audio-storage.adapter';
import { AudioCleanupPolicyService } from './audio-cleanup-policy.service';
import { AudioCleanupResult, EligibleAudioAsset } from './audio-cleanup.types';

@Injectable()
export class AudioCleanupService {
  private readonly logger = new Logger(AudioCleanupService.name);

  constructor(
    private readonly policyService: AudioCleanupPolicyService,
    @Inject(AUDIO_STORAGE_ADAPTER)
    private readonly storageAdapter: AudioStorageAdapter,
    private readonly db: DatabaseService,
  ) {}

  /**
   * Runs a full sweep: identifies all eligible assets via policy service
   * and deletes each one. Returns counts of deleted vs failed assets.
   * Errors on individual assets are caught and counted; they do not abort
   * the sweep.
   */
  async runCleanup(): Promise<AudioCleanupResult> {
    const eligible = await this.policyService.findEligibleAssets();

    if (eligible.length === 0) {
      return { deleted: 0, failed: 0 };
    }

    this.logger.log(`Audio cleanup: ${eligible.length} asset(s) eligible for deletion`);

    let deleted = 0;
    let failed = 0;

    for (const asset of eligible) {
      try {
        await this.deleteAsset(asset);
        deleted++;
      } catch (err) {
        failed++;
        // Log the assetId at DEBUG level only — never the storageKey at INFO+
        this.logger.warn(
          `Audio cleanup: failed to delete asset ${asset.assetId} (reason: ${asset.reason}): ${(err as Error).message}`,
        );
      }
    }

    this.logger.log(`Audio cleanup complete: ${deleted} deleted, ${failed} failed`);
    return { deleted, failed };
  }

  /**
   * Opportunistic inline cleanup for a specific session (e.g. called
   * when a session is ended). Only deletes assets belonging to that session.
   * Errors are swallowed — this is best-effort; the scheduled sweep will
   * catch any missed assets.
   */
  async runCleanupForSession(sessionId: string): Promise<void> {
    try {
      const eligible = await this.policyService.findEligibleAssets();
      const sessionAssets = await this.findAssetsForSession(sessionId, eligible);

      for (const asset of sessionAssets) {
        try {
          await this.deleteAsset(asset);
        } catch (err) {
          this.logger.warn(
            `Inline cleanup failed for asset ${asset.assetId} in session ${sessionId}: ${(err as Error).message}`,
          );
        }
      }
    } catch (err) {
      // Best-effort — do not propagate to session-end caller
      this.logger.warn(
        `Inline cleanup sweep failed for session ${sessionId}: ${(err as Error).message}`,
      );
    }
  }

  /** Deletes one asset: storage bytes → DB row → nullify message audio_ref. */
  private async deleteAsset(asset: EligibleAudioAsset): Promise<void> {
    // Step 1: delete from storage (idempotent — adapter handles missing key)
    await this.storageAdapter.delete(asset.storageKey);

    // Step 2: delete the voice_audio_assets row
    await this.db.query(
      `DELETE FROM voice_audio_assets WHERE id = $1`,
      [asset.assetId],
    );

    // Step 3: nullify audio_ref on the parent message so message row
    // remains as conversation history without a dangling reference
    await this.db.query(
      `UPDATE voice_messages SET audio_ref = NULL WHERE id = $1 AND audio_ref IS NOT NULL`,
      [asset.messageId],
    );
  }

  /** Filters the global eligible list down to assets belonging to sessionId. */
  private async findAssetsForSession(
    sessionId: string,
    eligible: EligibleAudioAsset[],
  ): Promise<EligibleAudioAsset[]> {
    if (eligible.length === 0) return [];

    const messageIds = eligible.map((a) => a.messageId);
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM voice_messages WHERE session_id = $1 AND id = ANY($2::uuid[])`,
      [sessionId, messageIds],
    );

    const sessionMessageIds = new Set(result.rows.map((r) => r.id));
    return eligible.filter((a) => sessionMessageIds.has(a.messageId));
  }
}
