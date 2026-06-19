/**
 * P9-033: Add Audio Cleanup Policy.
 * Determines which voice_audio_assets rows are eligible for deletion
 * according to the retention rules in docs/phase-9/audio-cleanup-policy.md:
 *
 *   1. Transcription complete  — uploaded audio whose parent message
 *      has status 'transcribed', 'replied', 'synthesized', or 'failed'
 *      (transcription either succeeded or permanently failed) and the
 *      asset is older than the post-transcription grace period (default 24h).
 *
 *   2. Session ended before transcription — uploaded audio whose parent
 *      session has ended but the message never reached 'transcribed',
 *      and the asset is older than 24 hours.
 *
 *   3. TTS audio delivered or session ended — TTS assets (identified
 *      by content_type) whose session has ended or whose asset is older
 *      than 24 hours.
 *
 *   4. Hard cap — any asset whose created_at is older than maxRetentionMs
 *      (default 7 days), regardless of status.
 *
 * This service only reads from the database to build the eligible set.
 * It never deletes, never calls an STT/TTS/AI provider, and never
 * touches any AIM Engine-owned field. Deletion is performed by
 * AudioCleanupService, which calls this service first.
 */
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import {
  AudioCleanupPolicyConfig,
  AudioCleanupReason,
  EligibleAudioAsset,
} from './audio-cleanup.types';

const DEFAULT_MAX_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours

interface RawEligibleRow {
  asset_id: string;
  storage_key: string;
  message_id: string;
  reason: AudioCleanupReason;
}

@Injectable()
export class AudioCleanupPolicyService {
  private readonly config: AudioCleanupPolicyConfig;

  constructor(
    private readonly db: DatabaseService,
    config?: Partial<AudioCleanupPolicyConfig>,
  ) {
    this.config = {
      maxRetentionMs: config?.maxRetentionMs ?? DEFAULT_MAX_RETENTION_MS,
    };
  }

  /**
   * Returns the set of voice_audio_assets eligible for deletion right now.
   * Safe to call repeatedly — read-only, idempotent.
   */
  async findEligibleAssets(): Promise<EligibleAudioAsset[]> {
    const now = new Date();
    const hardCutoff = new Date(now.getTime() - this.config.maxRetentionMs);
    const graceCutoff = new Date(now.getTime() - GRACE_PERIOD_MS);

    // Single query with UNION to collect all four eligibility buckets.
    // Uses LEFT JOINs so a missing message or session row still surfaces
    // the asset under the hard-cap bucket.
    const result = await this.db.query<RawEligibleRow>(
      `
      -- Bucket 1: transcription complete (message reached a terminal status)
      SELECT
        a.id            AS asset_id,
        a.storage_key,
        a.message_id,
        'transcription_complete'::text AS reason
      FROM voice_audio_assets a
      JOIN voice_messages m ON m.id = a.message_id
      WHERE m.status IN ('transcribed', 'replied', 'synthesized', 'failed')
        AND a.created_at < $2

      UNION

      -- Bucket 2: session ended before transcription
      SELECT
        a.id,
        a.storage_key,
        a.message_id,
        'session_ended_before_transcription'::text
      FROM voice_audio_assets a
      JOIN voice_messages m ON m.id = a.message_id
      JOIN voice_sessions s  ON s.id = m.session_id
      WHERE s.status = 'ended'
        AND m.status = 'pending'
        AND a.created_at < $2

      UNION

      -- Bucket 3: TTS audio — session ended or asset older than grace period
      SELECT
        a.id,
        a.storage_key,
        a.message_id,
        'tts_audio_delivered_or_session_ended'::text
      FROM voice_audio_assets a
      JOIN voice_messages m ON m.id = a.message_id
      JOIN voice_sessions s  ON s.id = m.session_id
      WHERE a.content_type LIKE 'audio/%'
        AND m.status IN ('synthesized', 'failed')
        AND (s.status = 'ended' OR a.created_at < $2)

      UNION

      -- Bucket 4: hard cap — any asset older than maxRetentionMs
      SELECT
        a.id,
        a.storage_key,
        a.message_id,
        'max_retention_exceeded'::text
      FROM voice_audio_assets a
      WHERE a.created_at < $1
      `,
      [hardCutoff.toISOString(), graceCutoff.toISOString()],
    );

    return result.rows.map((row) => ({
      assetId: row.asset_id,
      storageKey: row.storage_key,
      messageId: row.message_id,
      reason: row.reason,
    }));
  }
}
