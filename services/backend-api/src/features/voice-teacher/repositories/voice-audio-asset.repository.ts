import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceAudioAssetRow } from './voice-repository.types';

@Injectable()
export class VoiceAudioAssetRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    messageId: string,
    studentId: string,
    storageKey: string,
    contentType: string,
    durationMs: number | null,
  ): Promise<VoiceAudioAssetRow> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `INSERT INTO voice_audio_assets (message_id, student_id, storage_key, content_type, duration_ms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, message_id, student_id, storage_key, content_type, duration_ms, created_at`,
      [messageId, studentId, storageKey, contentType, durationMs],
    );

    return result.rows[0] ?? null;
  }

  async findById(assetId: string): Promise<VoiceAudioAssetRow | null> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `SELECT id, message_id, student_id, storage_key, content_type, duration_ms, created_at
       FROM voice_audio_assets
       WHERE id = $1
       LIMIT 1`,
      [assetId],
    );

    return result.rows[0] ?? null;
  }

  async findByMessageId(messageId: string): Promise<VoiceAudioAssetRow | null> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `SELECT id, message_id, student_id, storage_key, content_type, duration_ms, created_at
       FROM voice_audio_assets
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }
}
