import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../../database/database.service';
import { TtsAudioAssetKey, TtsAudioAssetReadyInput, TtsAudioAssetRow } from './tts-audio-asset.types';

/**
 * SQL for the tts_audio_assets table. Every method is a single short statement: nothing here holds a
 * transaction (or a connection) open while the TTS provider is being called.
 *
 * Cross-instance coordination is a row lease, not an advisory lock: Supabase's pooled connections
 * can hand a session to another client, which makes session-level locks unreliable, whereas a
 * conditional UPDATE is atomic regardless of which connection runs it.
 */
@Injectable()
export class TtsAudioAssetRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByKey(key: TtsAudioAssetKey): Promise<TtsAudioAssetRow | null> {
    const result = await this.db.query<TtsAudioAssetRow>(
      `SELECT * FROM tts_audio_assets
        WHERE content_hash = $1 AND language = $2 AND voice_config_hash = $3
        LIMIT 1`,
      [key.contentHash, key.language, key.voiceConfigHash],
    );
    return result.rows[0] ?? null;
  }

  /**
   * Atomically claims the right to generate this asset. Succeeds when there is no row yet, the last
   * attempt failed, or another instance's lease has expired. Returns null when the asset is ready or
   * someone else holds a live lease.
   */
  async claim(
    key: TtsAudioAssetKey,
    questionId: string | null,
    owner: string,
    leaseSeconds: number,
  ): Promise<TtsAudioAssetRow | null> {
    const result = await this.db.query<TtsAudioAssetRow>(
      `INSERT INTO tts_audio_assets
         (question_id, language, content_hash, voice_config_hash, status, lease_owner, lease_expires_at, attempt_count)
       VALUES ($1, $2, $3, $4, 'generating', $5, now() + make_interval(secs => $6), 1)
       ON CONFLICT (content_hash, language, voice_config_hash) DO UPDATE
          SET status = 'generating',
              lease_owner = EXCLUDED.lease_owner,
              lease_expires_at = EXCLUDED.lease_expires_at,
              attempt_count = tts_audio_assets.attempt_count + 1,
              last_error = NULL,
              updated_at = now()
        WHERE tts_audio_assets.status = 'failed'
           OR (tts_audio_assets.status = 'generating' AND tts_audio_assets.lease_expires_at < now())
       RETURNING *`,
      [questionId, key.language, key.contentHash, key.voiceConfigHash, owner, leaseSeconds],
    );
    return result.rows[0] ?? null;
  }

  /** Claims a READY row whose Storage object turned out to be missing or unusable, so one instance repairs it. */
  async claimRepair(id: string, owner: string, leaseSeconds: number): Promise<TtsAudioAssetRow | null> {
    const result = await this.db.query<TtsAudioAssetRow>(
      `UPDATE tts_audio_assets
          SET status = 'generating',
              lease_owner = $2,
              lease_expires_at = now() + make_interval(secs => $3),
              attempt_count = attempt_count + 1,
              last_error = 'STORAGE_OBJECT_UNUSABLE',
              updated_at = now()
        WHERE id = $1 AND status = 'ready'
       RETURNING *`,
      [id, owner, leaseSeconds],
    );
    return result.rows[0] ?? null;
  }

  /** Publishes the asset. Only a row that is still 'generating' can become ready. */
  async markReady(id: string, input: TtsAudioAssetReadyInput): Promise<boolean> {
    const result = await this.db.query(
      `UPDATE tts_audio_assets
          SET status = 'ready',
              storage_path = $2,
              mime_type = $3,
              size_bytes = $4,
              duration_ms = $5,
              lease_owner = NULL,
              lease_expires_at = NULL,
              last_error = NULL,
              updated_at = now()
        WHERE id = $1 AND status = 'generating'`,
      [id, input.storagePath, input.mimeType, input.sizeBytes, input.durationMs],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Records a failed attempt (category only) and frees the lease. Only the lease holder may do this. */
  async markFailed(id: string, owner: string, errorCategory: string): Promise<void> {
    await this.db.query(
      `UPDATE tts_audio_assets
          SET status = 'failed',
              lease_owner = NULL,
              lease_expires_at = NULL,
              last_error = $3,
              updated_at = now()
        WHERE id = $1 AND status = 'generating' AND lease_owner = $2`,
      [id, owner, errorCategory],
    );
  }
}
