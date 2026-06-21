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

  // ---------------------------------------------------------------------
  // P18-048: Admin AI Prompt Management API — read/draft/versioning/
  // publishing support. Admin authority over prompt content; client
  // requests never set the resolved active template directly.
  // ---------------------------------------------------------------------

  async listAll(): Promise<AiPromptTemplateRow[]> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `SELECT id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at
       FROM ai_prompt_templates
       ORDER BY name ASC, locale ASC, audience ASC, version DESC`,
    );
    return result.rows;
  }

  async findNextVersion(name: string, locale: string, audience: string): Promise<number> {
    const result = await this.db.query<{ max_version: number | null }>(
      `SELECT MAX(version) AS max_version
       FROM ai_prompt_templates
       WHERE name = $1 AND locale = $2 AND audience = $3`,
      [name, locale, audience],
    );
    return (result.rows[0]?.max_version ?? 0) + 1;
  }

  async createDraft(input: {
    name: string;
    version: number;
    locale: string;
    audience: string;
    body: string;
    safetyTags?: Record<string, unknown>;
  }): Promise<AiPromptTemplateRow> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `INSERT INTO ai_prompt_templates (name, version, locale, audience, status, body, safety_tags)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6)
       RETURNING id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at`,
      [input.name, input.version, input.locale, input.audience, input.body, JSON.stringify(input.safetyTags ?? {})],
    );
    return result.rows[0];
  }

  async retireActiveByNameAndLocale(name: string, locale: string, audience: string): Promise<void> {
    await this.db.query(
      `UPDATE ai_prompt_templates
       SET status = 'retired', updated_at = now()
       WHERE name = $1 AND locale = $2 AND audience = $3 AND status = 'active'`,
      [name, locale, audience],
    );
  }

  async updateStatus(
    id: string,
    status: 'draft' | 'active' | 'retired',
  ): Promise<AiPromptTemplateRow | null> {
    const result = await this.db.query<AiPromptTemplateRow>(
      `UPDATE ai_prompt_templates
       SET status = $2, updated_at = now()
       WHERE id = $1
       RETURNING id, name, version, locale, audience, status, body, safety_tags, created_at, updated_at`,
      [id, status],
    );
    return result.rows[0] ?? null;
  }
}
