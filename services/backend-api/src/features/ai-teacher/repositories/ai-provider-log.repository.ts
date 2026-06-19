// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_provider_logs.
// Stores only non-sensitive operational metadata (Group F — AI Provider
// Gateway); never the prompt text, raw provider response, or credentials.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiProviderLogRow } from './ai-chat-repository.types';

export interface CreateAiProviderLogInput {
  readonly sessionId: string;
  readonly provider: string;
  readonly model: string;
  readonly status: 'success' | 'error' | 'timeout';
  readonly errorCategory?: string | null;
  readonly latencyMs?: number | null;
}

@Injectable()
export class AiProviderLogRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateAiProviderLogInput): Promise<AiProviderLogRow> {
    const result = await this.db.query<AiProviderLogRow>(
      `INSERT INTO ai_provider_logs (session_id, provider, model, status, error_category, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, session_id, provider, model, status, error_category, latency_ms, created_at`,
      [
        input.sessionId,
        input.provider,
        input.model,
        input.status,
        input.errorCategory ?? null,
        input.latencyMs ?? null,
      ],
    );

    return result.rows[0];
  }

  async findBySessionId(sessionId: string): Promise<AiProviderLogRow[]> {
    const result = await this.db.query<AiProviderLogRow>(
      `SELECT id, session_id, provider, model, status, error_category, latency_ms, created_at
       FROM ai_provider_logs
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [sessionId],
    );

    return result.rows;
  }
}
