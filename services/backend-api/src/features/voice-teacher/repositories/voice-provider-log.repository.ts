import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceProviderLogRow } from './voice-repository.types';

@Injectable()
export class VoiceProviderLogRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    messageId: string,
    providerType: 'stt' | 'tts',
    provider: string,
    model: string,
    status: 'success' | 'error' | 'timeout',
    errorCategory: string | null,
    latencyMs: number | null,
  ): Promise<VoiceProviderLogRow> {
    const result = await this.db.query<VoiceProviderLogRow>(
      `INSERT INTO voice_provider_logs (message_id, provider_type, provider, model, status, error_category, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, message_id, provider_type, provider, model, status, error_category, latency_ms, created_at`,
      [messageId, providerType, provider, model, status, errorCategory, latencyMs],
    );

    return result.rows[0];
  }

  async findByMessageId(messageId: string): Promise<VoiceProviderLogRow[]> {
    const result = await this.db.query<VoiceProviderLogRow>(
      `SELECT id, message_id, provider_type, provider, model, status, error_category, latency_ms, created_at
       FROM voice_provider_logs
       WHERE message_id = $1
       ORDER BY created_at ASC`,
      [messageId],
    );

    return result.rows;
  }
}
