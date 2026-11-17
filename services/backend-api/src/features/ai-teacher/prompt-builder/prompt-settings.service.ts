// Admin-editable AI Teacher prompt parts + extra rules.
//
// buildPrompt() is synchronous, so the settings are kept in a small in-memory snapshot that is loaded at startup,
// refreshed every 30s, and replaced immediately after every admin write.
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import {
  LESSON_COMPLETE_MARKER,
  buildLessonStageInstructions,
  buildPracticeInstructions,
  buildStudentIdentityInstructions,
} from './prompt-builder.constants';

export const PROMPT_PART_KEYS = ['identity', 'greeting', 'teaching', 'complete', 'practice'] as const;
export type PromptPartKey = (typeof PROMPT_PART_KEYS)[number];

export interface CustomRule {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  sortOrder: number;
  /** Course titles the rule applies to; null = every course. */
  courseTitles: string[] | null;
  updatedAt: string;
}

interface Snapshot {
  overrides: Partial<Record<PromptPartKey, string>>;
  rules: CustomRule[];
}

export const PROMPT_PART_DEFAULTS: Record<PromptPartKey, () => string> = {
  identity: () => buildStudentIdentityInstructions(),
  greeting: () => buildLessonStageInstructions('greeting'),
  teaching: () => buildLessonStageInstructions('teaching'),
  complete: () => buildLessonStageInstructions('complete'),
  practice: () => buildPracticeInstructions(),
};

export class PromptSettingsError extends Error {}

function cleanCourses(v: string[] | null | undefined): string[] | null {
  if (!Array.isArray(v)) return null;
  const list = v.map((x) => String(x).trim()).filter(Boolean).slice(0, 30);
  return list.length > 0 ? list : null;
}

@Injectable()
export class AiTeacherPromptSettingsService implements OnModuleInit {
  private readonly logger = new Logger(AiTeacherPromptSettingsService.name);
  private snapshot: Snapshot = { overrides: {}, rules: [] };
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    await this.refresh();
    this.timer = setInterval(() => void this.refresh(), 30_000);
    this.timer.unref?.();
  }

  async refresh(): Promise<void> {
    try {
      const o = await this.db.query<{ key: PromptPartKey; body: string }>('SELECT key, body FROM ai_teacher_prompt_overrides');
      const r = await this.db.query<{ id: string; title: string; body: string; enabled: boolean; sort_order: number; course_titles: string[] | null; updated_at: string }>(
        'SELECT id, title, body, enabled, sort_order, course_titles, updated_at FROM ai_teacher_custom_rules ORDER BY sort_order, created_at',
      );
      const overrides: Snapshot['overrides'] = {};
      for (const row of o.rows) if ((PROMPT_PART_KEYS as readonly string[]).includes(row.key)) overrides[row.key] = row.body;
      this.snapshot = {
        overrides,
        rules: r.rows.map((x) => ({ id: x.id, title: x.title, body: x.body, enabled: x.enabled, sortOrder: x.sort_order, courseTitles: x.course_titles, updatedAt: String(x.updated_at) })),
      };
    } catch (error) {
      // Keep the last good snapshot (or built-in defaults) if the tables are unreachable.
      this.logger.warn(`prompt settings refresh failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  /** Text for one prompt part: the admin override when set, else the built-in default. Synchronous. */
  part(key: PromptPartKey): string {
    return this.snapshot.overrides[key] ?? PROMPT_PART_DEFAULTS[key]();
  }

  /**
   * Enabled admin rules that apply to this course, rendered as one block appended to the prompt ('' when none).
   * A rule with no course list applies everywhere; course titles match case-insensitively. Synchronous.
   */
  rulesBlock(courseTitle?: string | null): string {
    const course = (courseTitle ?? '').trim().toLowerCase();
    const active = this.snapshot.rules.filter(
      (r) =>
        r.enabled &&
        (!r.courseTitles || r.courseTitles.length === 0 || (course !== '' && r.courseTitles.some((c) => c.trim().toLowerCase() === course))),
    );
    if (active.length === 0) return '';
    return 'Additional rules from the AIM administrators (always follow them): ' + active.map((r, i) => `${i + 1}) ${r.body.trim()}`).join(' ');
  }

  view() {
    return {
      parts: PROMPT_PART_KEYS.map((key) => ({
        key,
        default: PROMPT_PART_DEFAULTS[key](),
        override: this.snapshot.overrides[key] ?? null,
        effective: this.part(key),
      })),
      rules: this.snapshot.rules,
    };
  }

  async setPart(key: PromptPartKey, body: string, by: string | null): Promise<void> {
    if (!(PROMPT_PART_KEYS as readonly string[]).includes(key)) throw new PromptSettingsError('Unknown prompt part.');
    const text = (body ?? '').trim();
    if (!text) throw new PromptSettingsError('The prompt cannot be empty. Use "Reset to default" instead.');
    if (text.length > 8000) throw new PromptSettingsError('The prompt is too long (max 8000 characters).');
    if (key === 'teaching' && !text.includes(LESSON_COMPLETE_MARKER)) {
      throw new PromptSettingsError(
        `The teaching prompt must keep the completion marker ${LESSON_COMPLETE_MARKER}; without it lessons can never be marked finished.`,
      );
    }
    await this.db.query(
      `INSERT INTO ai_teacher_prompt_overrides (key, body, updated_by) VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET body = EXCLUDED.body, updated_by = EXCLUDED.updated_by, updated_at = now()`,
      [key, text, by],
    );
    await this.refresh();
  }

  async resetPart(key: PromptPartKey): Promise<void> {
    await this.db.query('DELETE FROM ai_teacher_prompt_overrides WHERE key = $1', [key]);
    await this.refresh();
  }

  async createRule(input: { title: string; body: string; enabled?: boolean; courseTitles?: string[] | null }, by: string | null): Promise<void> {
    const title = (input.title ?? '').trim();
    const body = (input.body ?? '').trim();
    if (!title || title.length > 120) throw new PromptSettingsError('A short title (max 120 characters) is required.');
    if (!body || body.length > 2000) throw new PromptSettingsError('The rule text (max 2000 characters) is required.');
    await this.db.query(
      `INSERT INTO ai_teacher_custom_rules (title, body, enabled, sort_order, course_titles, updated_by)
       VALUES ($1, $2, $3, COALESCE((SELECT MAX(sort_order) + 1 FROM ai_teacher_custom_rules), 0), $4, $5)`,
      [title, body, input.enabled ?? true, cleanCourses(input.courseTitles), by],
    );
    await this.refresh();
  }

  async updateRule(id: string, input: { title?: string; body?: string; enabled?: boolean; courseTitles?: string[] | null }, by: string | null): Promise<void> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.title !== undefined) {
      const t = input.title.trim();
      if (!t || t.length > 120) throw new PromptSettingsError('A short title (max 120 characters) is required.');
      sets.push(`title = $${vals.push(t)}`);
    }
    if (input.body !== undefined) {
      const b = input.body.trim();
      if (!b || b.length > 2000) throw new PromptSettingsError('The rule text (max 2000 characters) is required.');
      sets.push(`body = $${vals.push(b)}`);
    }
    if (input.enabled !== undefined) sets.push(`enabled = $${vals.push(!!input.enabled)}`);
    if (input.courseTitles !== undefined) sets.push(`course_titles = $${vals.push(cleanCourses(input.courseTitles))}`);
    if (sets.length === 0) return;
    sets.push(`updated_by = $${vals.push(by)}`, 'updated_at = now()');
    const r = await this.db.query(`UPDATE ai_teacher_custom_rules SET ${sets.join(', ')} WHERE id = $${vals.push(id)}`, vals);
    if (r.rowCount === 0) throw new PromptSettingsError('Rule not found.');
    await this.refresh();
  }

  async deleteRule(id: string): Promise<void> {
    await this.db.query('DELETE FROM ai_teacher_custom_rules WHERE id = $1', [id]);
    await this.refresh();
  }
}
