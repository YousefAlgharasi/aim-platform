import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceAudioAssetRow } from './voice-repository.types';

const SELECT_COLUMNS =
  'id, message_id, ai_chat_message_id, student_id, storage_key, content_type, duration_ms, created_at';

@Injectable()
export class VoiceAudioAssetRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * P21-021b: anchors the new asset row to an ai_chat_messages row
   * (`aiChatMessageId`) instead of a voice_messages row — new voice
   * submissions no longer create a voice_messages placeholder.
   */
  async create(
    aiChatMessageId: string,
    studentId: string,
    storageKey: string,
    contentType: string,
    durationMs: number | null,
  ): Promise<VoiceAudioAssetRow> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `INSERT INTO voice_audio_assets (ai_chat_message_id, student_id, storage_key, content_type, duration_ms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${SELECT_COLUMNS}`,
      [aiChatMessageId, studentId, storageKey, contentType, durationMs],
    );

    return result.rows[0] ?? null;
  }

  async findById(assetId: string): Promise<VoiceAudioAssetRow | null> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM voice_audio_assets
       WHERE id = $1
       LIMIT 1`,
      [assetId],
    );

    return result.rows[0] ?? null;
  }

  /** Legacy lookup by the historical voice_messages FK — only ever matches
   *  rows written before P21-021b. */
  async findByMessageId(messageId: string): Promise<VoiceAudioAssetRow | null> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM voice_audio_assets
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  /** Lookup by the ai_chat_messages FK — the live path for rows written
   *  after P21-021b. */
  async findByAiChatMessageId(aiChatMessageId: string): Promise<VoiceAudioAssetRow | null> {
    const result = await this.db.query<VoiceAudioAssetRow>(
      `SELECT ${SELECT_COLUMNS}
       FROM voice_audio_assets
       WHERE ai_chat_message_id = $1
       LIMIT 1`,
      [aiChatMessageId],
    );

    return result.rows[0] ?? null;
  }
}
