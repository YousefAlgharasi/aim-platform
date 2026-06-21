// P18-025: Create AI Teacher Repository Layer
// Backend-only persistence abstraction for ai_prompt_templates. Prompt
// selection authority stays server-side; callers never accept a
// client-submitted template body or ID as truth.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiPromptTemplateRow } from './governance-repository.types';

@Injectable()
export class AiPromptTemplateRepository {
  constructor(private readonly db: DatabaseService) {}

  async findActiveByNameAndLocale(
    name: string,
    locale: string,
    audience: string,
  ): Promise<AiPromptTemplateRow | null> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `SELECT id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at
       FROM ai_prompt_templates
       WHERE name = $1 AND locale = $2 AND audience = $3 AND status = 'active'
       ORDER BY version DESC
       LIMIT 1`,
      [name, locale, audience],
    );
    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<AiPromptTemplateRow | null> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `SELECT id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at
       FROM ai_prompt_templates
       WHERE id = $1
       LIMIT 1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async listByStatus(status: 'draft' | 'active' | 'retired'): Promise<AiPromptTemplateRow[]> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `SELECT id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at
       FROM ai_prompt_templates
       WHERE status = $1
       ORDER BY name ASC, version DESC`,
      [status],
    );
    return result.rows;
  }
}
