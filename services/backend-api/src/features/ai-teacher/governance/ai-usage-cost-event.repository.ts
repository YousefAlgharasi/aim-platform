// P18-025: Create AI Teacher Repository Layer
// Backend-only persistence abstraction for ai_usage_cost_events. A row is
// written only after a cost/quota check has passed and the provider call
// has completed (or failed); quota state is always computed server-side
// from these rows, never trusted from the client.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiUsageCostEventRow } from './governance-repository.types';

export interface CreateAiUsageCostEventInput {
  readonly studentId: string;
  readonly eventType: 'text_generation' | 'stt' | 'tts';
  readonly modelConfigId?: string | null;
  readonly requestId: string;
  readonly tokensUsed?: number | null;
  readonly durationSeconds?: number | null;
  readonly costEstimate: number;
  readonly quotaPeriod: 'daily' | 'monthly';
  readonly metadata?: Record<string, unknown>;
}

@Injectable()
export class AiUsageCostEventRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateAiUsageCostEventInput): Promise<AiUsageCostEventRow> {
    const result = await this.db.query<AiUsageCostEventRow>(
      `INSERT INTO ai_usage_cost_events
         (student_id, event_type, model_config_id, request_id, tokens_used, duration_seconds, cost_estimate, quota_period, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, student_id, event_type, model_config_id, request_id, tokens_used, duration_seconds, cost_estimate, quota_period, metadata, created_at`,
      [
        input.studentId,
        input.eventType,
        input.modelConfigId ?? null,
        input.requestId,
        input.tokensUsed ?? null,
        input.durationSeconds ?? null,
        input.costEstimate,
        input.quotaPeriod,
        JSON.stringify(input.metadata ?? {}),
      ],
    );
    return result.rows[0];
  }

  async sumCostSince(studentId: string, windowStart: Date): Promise<number> {
    const result = await this.db.query<{ total: string | null }>(
      `SELECT SUM(cost_estimate) AS total
       FROM ai_usage_cost_events
       WHERE student_id = $1 AND created_at >= $2`,
      [studentId, windowStart],
    );
    return parseFloat(result.rows[0]?.total ?? '0');
  }

  async findByRequestId(requestId: string): Promise<AiUsageCostEventRow | null> {
    const result = await this.db.query<AiUsageCostEventRow>(
      `SELECT id, student_id, event_type, model_config_id, request_id, tokens_used, duration_seconds, cost_estimate, quota_period, metadata, created_at
       FROM ai_usage_cost_events
       WHERE request_id = $1
       LIMIT 1`,
      [requestId],
    );
    return result.rows[0] ?? null;
  }
}
