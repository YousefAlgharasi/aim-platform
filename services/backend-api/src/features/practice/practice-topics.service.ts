// Practice topics: student reads (translated) + admin CRUD.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryResult, QueryResultRow } from 'pg';
import { SupportedLocale } from '../../common/locale/locale.constants';
import { DatabaseService } from '../../database/database.service';
import { assertLocaleKey, PracticeTopicDto } from './practice.dtos';
import { AdminPracticeTopicView, PracticeKind, PracticeTopicView } from './practice.types';

type Q = <T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<QueryResult<T>>;

interface TopicRow {
  id: string;
  kind: PracticeKind;
  title: string;
  description: string | null;
  level_code: string | null;
  xp_reward: number;
  time_limit_seconds: number | null;
  min_words: number | null;
}

const toView = (r: TopicRow): PracticeTopicView => ({
  id: r.id,
  kind: r.kind,
  title: r.title,
  description: r.description,
  levelCode: r.level_code,
  xpReward: r.xp_reward,
  timeLimitSeconds: r.time_limit_seconds,
  minWords: r.min_words,
});

@Injectable()
export class PracticeTopicsService {
  constructor(private readonly db: DatabaseService) {}

  // ── Student ──

  async listActive(kind: PracticeKind, locale: SupportedLocale): Promise<PracticeTopicView[]> {
    const text = this.textSql();
    const result = await this.db.query<TopicRow>(
      `SELECT t.id, t.kind, ${text.title} AS title, ${text.description} AS description,
              t.level_code, t.xp_reward, t.time_limit_seconds, t.min_words
       FROM practice_topics t ${text.joins}
       WHERE t.kind = $1 AND t.is_active = true
       ORDER BY t.sort_order, t.created_at`,
      [kind, locale],
    );
    return result.rows.map(toView);
  }

  async getActive(id: string, kind: PracticeKind, locale: SupportedLocale): Promise<PracticeTopicView> {
    const text = this.textSql();
    const result = await this.db.query<TopicRow>(
      `SELECT t.id, t.kind, ${text.title} AS title, ${text.description} AS description,
              t.level_code, t.xp_reward, t.time_limit_seconds, t.min_words
       FROM practice_topics t ${text.joins}
       WHERE t.id = $1 AND t.kind = $3 AND t.is_active = true`,
      [id, locale, kind],
    );
    if (!result.rows[0]) throw new NotFoundException('Practice topic not found');
    return toView(result.rows[0]);
  }

  /** AI-only data for a topic (never sent to students). */
  async getAiPrompt(id: string): Promise<{ prompt: string; title: string } | null> {
    const result = await this.db.query<{ ai_prompt: string; title: string | null }>(
      `SELECT t.ai_prompt, en.title
       FROM practice_topics t
       LEFT JOIN practice_topic_translations en ON en.topic_id = t.id AND en.locale = 'en'
       WHERE t.id = $1 AND t.is_active = true`,
      [id],
    );
    const row = result.rows[0];
    return row ? { prompt: row.ai_prompt, title: row.title ?? '' } : null;
  }

  // ── Admin ──

  async listAll(): Promise<AdminPracticeTopicView[]> {
    const topics = await this.db.query<{
      id: string; kind: PracticeKind; level_code: string | null; xp_reward: number;
      time_limit_seconds: number | null; min_words: number | null; ai_prompt: string;
      sort_order: number; is_active: boolean;
    }>(`SELECT * FROM practice_topics ORDER BY kind, sort_order, created_at`);
    const tr = await this.db.query<{ topic_id: string; locale: string; title: string; description: string | null }>(
      `SELECT topic_id, locale, title, description FROM practice_topic_translations`,
    );
    return topics.rows.map((t) => ({
      id: t.id,
      kind: t.kind,
      levelCode: t.level_code,
      xpReward: t.xp_reward,
      timeLimitSeconds: t.time_limit_seconds,
      minWords: t.min_words,
      aiPrompt: t.ai_prompt,
      sortOrder: t.sort_order,
      isActive: t.is_active,
      translations: Object.fromEntries(
        tr.rows.filter((x) => x.topic_id === t.id).map((x) => [x.locale, { title: x.title, description: x.description }]),
      ),
    }));
  }

  async create(dto: PracticeTopicDto): Promise<{ id: string }> {
    if (!dto.kind) throw new BadRequestException('kind is required');
    if (!dto.translations?.en?.title) throw new BadRequestException('An English title is required');
    this.assertTranslations(dto.translations);
    return this.tx(async (q) => {
      const ins = await q<{ id: string }>(
        `INSERT INTO practice_topics (kind, level_code, xp_reward, time_limit_seconds, min_words, ai_prompt, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [dto.kind, dto.levelCode ?? null, dto.xpReward ?? 20, dto.timeLimitSeconds ?? null,
         dto.kind === 'writing' ? dto.minWords ?? null : null, dto.aiPrompt ?? '', dto.sortOrder ?? 0, dto.isActive ?? true],
      );
      await this.writeTranslations(q, ins.rows[0].id, dto.translations!);
      return { id: ins.rows[0].id };
    });
  }

  async update(id: string, dto: PracticeTopicDto): Promise<void> {
    if (dto.translations) this.assertTranslations(dto.translations);
    await this.tx(async (q) => {
      // COALESCE keeps unsent fields; nullable fields use the *_set flags so null can clear them.
      const res = await q(
        `UPDATE practice_topics SET
           level_code = CASE WHEN $2::boolean THEN $3 ELSE level_code END,
           xp_reward = COALESCE($4, xp_reward),
           time_limit_seconds = CASE WHEN $5::boolean THEN $6 ELSE time_limit_seconds END,
           min_words = CASE WHEN $7::boolean THEN $8 ELSE min_words END,
           ai_prompt = COALESCE($9, ai_prompt),
           sort_order = COALESCE($10, sort_order),
           is_active = COALESCE($11, is_active)
         WHERE id = $1`,
        [id, 'levelCode' in dto, dto.levelCode ?? null, dto.xpReward ?? null,
         'timeLimitSeconds' in dto, dto.timeLimitSeconds ?? null, 'minWords' in dto, dto.minWords ?? null,
         dto.aiPrompt ?? null, dto.sortOrder ?? null, dto.isActive ?? null],
      );
      if (!res.rowCount) throw new NotFoundException('Practice topic not found');
      if (dto.translations) await this.writeTranslations(q, id, dto.translations);
    });
  }

  /** Deletes an unused topic; one with student attempts is only deactivated (their XP stays). */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const used = await this.db.query(`SELECT 1 FROM practice_attempts WHERE topic_id = $1 LIMIT 1`, [id]);
    if (used.rowCount) {
      await this.db.query(`UPDATE practice_topics SET is_active = false WHERE id = $1`, [id]);
      return { deleted: false };
    }
    const res = await this.db.query(`DELETE FROM practice_topics WHERE id = $1`, [id]);
    if (!res.rowCount) throw new NotFoundException('Practice topic not found');
    return { deleted: true };
  }

  private tx<T>(fn: (q: Q) => Promise<T>): Promise<T> {
    return this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        const out = await fn((sql, params) => client.query(sql, params));
        await client.query('COMMIT');
        return out;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });
  }

  /** Requested-locale text with an English fallback (topics have no base title column). */
  private textSql() {
    return {
      joins:
        `LEFT JOIN practice_topic_translations t_req ON t_req.topic_id = t.id AND t_req.locale = $2::text ` +
        `LEFT JOIN practice_topic_translations t_en ON t_en.topic_id = t.id AND t_en.locale = 'en'`,
      title: `COALESCE(t_req.title, t_en.title, '')`,
      description: `CASE WHEN t_req.id IS NOT NULL THEN t_req.description ELSE t_en.description END`,
    };
  }

  private assertTranslations(tr: NonNullable<PracticeTopicDto['translations']>): void {
    for (const [locale, text] of Object.entries(tr)) {
      if (!assertLocaleKey(locale)) throw new BadRequestException(`Invalid locale: ${locale}`);
      if (!text?.title || typeof text.title !== 'string') throw new BadRequestException(`Title required for ${locale}`);
    }
  }

  private async writeTranslations(
    q: Q,
    topicId: string,
    tr: NonNullable<PracticeTopicDto['translations']>,
  ): Promise<void> {
    for (const [locale, text] of Object.entries(tr)) {
      await q(
        `INSERT INTO practice_topic_translations (topic_id, locale, title, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (topic_id, locale) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description`,
        [topicId, locale, text.title, text.description ?? null],
      );
    }
  }
}
