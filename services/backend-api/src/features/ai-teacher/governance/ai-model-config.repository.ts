// P18-025: Create AI Teacher Repository Layer
// Backend-only persistence abstraction for ai_model_configs. Returns
// provider_key_ref (a non-secret reference string) only — never resolves or
// exposes the underlying provider secret here.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiModelConfigRow } from './governance-repository.types';

@Injectable()
export class AiModelConfigRepository {
  constructor(private readonly db: DatabaseService) {}

  async findActiveByName(name: string): Promise<AiModelConfigRow | null> {
    const result = await this.db.query<AiModelConfigRow>(
      `SELECT id, name, provider_key_ref, model_id, tier, status, limits, parameters, created_at, updated_at
       FROM ai_model_configs
       WHERE name = $1 AND status = 'active'
       LIMIT 1`,
      [name],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<AiModelConfigRow | null> {
    const result = await this.db.query<AiModelConfigRow>(
      `SELECT id, name, provider_key_ref, model_id, tier, status, limits, parameters, created_at, updated_at
       FROM ai_model_configs
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async listActiveByTier(tier: 'economy' | 'standard' | 'premium'): Promise<AiModelConfigRow[]> {
    const result = await this.db.query<AiModelConfigRow>(
      `SELECT id, name, provider_key_ref, model_id, tier, status, limits, parameters, created_at, updated_at
       FROM ai_model_configs
       WHERE tier = $1 AND status = 'active'
       ORDER BY name ASC`,
      [tier],
    );
    return result.rows;
  }
}
