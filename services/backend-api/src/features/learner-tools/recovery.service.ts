import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AiTeacherProviderGateway } from '../ai-teacher/governance/ai-teacher-provider.interface';
import { ProviderGatewayConfigService } from '../ai-teacher/provider-gateway/provider-gateway.config';
import { SessionsService } from '../sessions/sessions.service';

/**
 * Improve "recovery loop".
 *
 * A weak skill is recovered in three steps: learn (AI Teacher / lesson), wait (RECOVERY_COOLDOWN_DAYS after the
 * latest mistake on that skill), then retry. The retry is a REAL learning session: every answer goes through
 * POST /sessions/:id/attempt, so mastery, weakness and review schedules are still written only by the AIM
 * engine pipeline. Nothing here computes or stores mastery.
 *
 * The retry mixes (1) the questions the student missed, (2) unseen bank questions for the same skill, and
 * (3) when those run short, AI-written questions for THIS student only, at or below their level.
 */

export const RECOVERY_COOLDOWN_DAYS = 3;
export const RETRY_SESSION_SIZE = 6;
const MISSED_IN_RETRY = 2;
const COOLDOWN_MS = RECOVERY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export const GROUP_KEYS = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'] as const;
export type GroupKey = (typeof GROUP_KEYS)[number];

const LEVELS = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'] as const;
type Level = (typeof LEVELS)[number];
const levelRank = (l: string): number => Math.max(0, LEVELS.indexOf(l as Level));
const OPTION_TYPES = ['multiple_choice', 'true_false'];

/** Fallback when a skill is missing from skill_group_map: group by its curriculum domain. */
export const groupForDomain = (domain: string | null): GroupKey => {
  if (domain === 'pronunciation' || domain === 'functional_language') return 'speaking';
  return (GROUP_KEYS as readonly string[]).includes(domain ?? '') ? (domain as GroupKey) : 'vocabulary';
};

export interface RecoverySkill {
  skillKey: string;
  title: string;
  group: GroupKey;
  masteryScore: number | null;
  openMistakes: number;
  lastMistakeAt: string | null;
  /** null = nothing to wait for. */
  retryAvailableAt: string | null;
  unlocked: boolean;
}

export interface RecoveryQuestion {
  itemId: string;
  type: string;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  source: 'missed' | 'bank' | 'ai';
}

export interface RecoveryStart {
  sessionId: string;
  skillKey: string;
  level: string;
  questions: RecoveryQuestion[];
}

interface GeneratedQuestion { stem: string; options: string[]; correctIndex: number; explanation: string }

/** Pure: when may the student retry? Exported for tests. */
export function retryWindow(lastMistakeAt: Date | null, now: Date = new Date()): { retryAvailableAt: Date | null; unlocked: boolean } {
  if (!lastMistakeAt) return { retryAvailableAt: null, unlocked: true };
  const at = new Date(lastMistakeAt.getTime() + COOLDOWN_MS);
  return { retryAvailableAt: at, unlocked: at.getTime() <= now.getTime() };
}

/** Pure: validate the model's reply into questions we can safely store. Exported for tests. */
export function parseGeneratedQuestions(raw: string, existingStems: ReadonlySet<string>): GeneratedQuestion[] {
  const match = raw?.match(/\[[\s\S]*\]/);
  if (!match) return [];
  let data: unknown;
  try { data = JSON.parse(match[0]); } catch { return []; }
  if (!Array.isArray(data)) return [];
  const seen = new Set(existingStems);
  const out: GeneratedQuestion[] = [];
  for (const q of data as Array<Record<string, unknown>>) {
    const stem = typeof q?.stem === 'string' ? q.stem.trim() : '';
    const options = Array.isArray(q?.options) ? (q.options as unknown[]).map((o) => (typeof o === 'string' ? o.trim() : '')) : [];
    const correctIndex = typeof q?.correctIndex === 'number' ? q.correctIndex : -1;
    const explanation = typeof q?.explanation === 'string' ? q.explanation.trim().slice(0, 400) : '';
    const distinct = new Set(options.map((o) => o.toLowerCase()));
    if (stem.length < 8 || stem.length > 400) continue;
    if (options.length < 2 || options.length > 4 || options.some((o) => !o || o.length > 120) || distinct.size !== options.length) continue;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) continue;
    const key = stem.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ stem, options, correctIndex, explanation });
  }
  return out;
}

const studentIds = (ids: string | readonly string[]): string[] => [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly sessions: SessionsService,
    private readonly provider: AiTeacherProviderGateway,
    private readonly providerConfig: ProviderGatewayConfigService,
  ) {}

  /**
   * Every skill the student should recover: an open mistake (latest attempt on the question was wrong and not
   * since fixed) or an open/improving AIM weakness record. Read-only.
   */
  async overview(student: string | readonly string[]): Promise<{ cooldownDays: number; skills: RecoverySkill[] }> {
    const ids = studentIds(student);
    const rows = await this.db.query<any>(
      `WITH latest AS (
         SELECT DISTINCT ON (item_id) item_id, is_correct, submitted_at, skill_ids
           FROM lesson_attempts WHERE student_id = ANY($1::uuid[])
          ORDER BY item_id, submitted_at DESC
       ), open_wrong AS (
         SELECT l.item_id, l.submitted_at, k.skill_key
           FROM latest l, jsonb_array_elements_text(l.skill_ids) AS k(skill_key)
          WHERE NOT l.is_correct
       ), per_skill AS (
         SELECT skill_key, max(submitted_at) AS last_mistake_at, count(*)::int AS open_mistakes
           FROM open_wrong GROUP BY skill_key
       ), weak AS (
         SELECT DISTINCT skill_id AS skill_key FROM weakness_records
          WHERE student_id = ANY($1::uuid[]) AND status IN ('open', 'improving')
       ), keys AS (
         SELECT skill_key FROM per_skill UNION SELECT skill_key FROM weak
       )
       SELECT k.skill_key,
              s.title, s.domain,
              m.group_key,
              p.last_mistake_at, COALESCE(p.open_mistakes, 0) AS open_mistakes,
              (SELECT mastery_score::float FROM student_skill_states ss
                WHERE ss.student_id = ANY($1::uuid[]) AND ss.skill_id = k.skill_key
                ORDER BY ss.last_evaluated_at DESC LIMIT 1) AS mastery
         FROM keys k
         LEFT JOIN skills s ON s.key = k.skill_key
         LEFT JOIN skill_group_map m ON m.skill_key = k.skill_key
         LEFT JOIN per_skill p ON p.skill_key = k.skill_key`,
      [ids],
    );
    const now = new Date();
    const skills = rows.rows.map((r): RecoverySkill => {
      const last = r.last_mistake_at ? new Date(r.last_mistake_at) : null;
      const win = retryWindow(last, now);
      return {
        skillKey: r.skill_key,
        title: r.title ?? r.skill_key,
        group: (GROUP_KEYS as readonly string[]).includes(r.group_key) ? r.group_key : groupForDomain(r.domain),
        masteryScore: r.mastery,
        openMistakes: r.open_mistakes,
        lastMistakeAt: last ? last.toISOString() : null,
        retryAvailableAt: win.retryAvailableAt ? win.retryAvailableAt.toISOString() : null,
        unlocked: win.unlocked,
      };
    });
    skills.sort((a, b) => (a.masteryScore ?? 0.5) - (b.masteryScore ?? 0.5));
    return { cooldownDays: RECOVERY_COOLDOWN_DAYS, skills };
  }

  /** Start a retry session for one weak skill. 403 while the cooldown is still running. */
  async start(authId: string, internalId: string, skillKey: unknown): Promise<RecoveryStart> {
    if (typeof skillKey !== 'string' || skillKey.trim().length === 0) throw new BadRequestException('skillKey is required');
    const ids = studentIds([authId, internalId]);
    const { skills } = await this.overview(ids);
    const skill = skills.find((s) => s.skillKey === skillKey);
    if (!skill) throw new NotFoundException('This skill is not in your improve list');
    if (!skill.unlocked) {
      throw new ForbiddenException({ message: 'Retry is not open yet', retryAvailableAt: skill.retryAvailableAt });
    }

    const level = await this.studentLevel(ids);
    const skillRow = await this.db.query<{ id: string; description: string | null }>(`SELECT id, description FROM skills WHERE key = $1 LIMIT 1`, [skillKey]);
    if (!skillRow.rowCount) throw new NotFoundException('Skill not found');

    const missed = await this.missedQuestions(ids, skillKey, MISSED_IN_RETRY);
    const taken = new Set(missed.map((q) => q.itemId));
    const bank = await this.bankQuestions(ids, skillKey, level, RETRY_SESSION_SIZE - missed.length, taken);
    bank.forEach((q) => taken.add(q.itemId));

    const questions: RecoveryQuestion[] = [...missed, ...bank];
    const missing = RETRY_SESSION_SIZE - questions.length;
    if (missing > 0) {
      questions.push(...(await this.generateForStudent(authId, skill, skillRow.rows[0], level, missing, missed)));
    }
    if (questions.length === 0) throw new NotFoundException('No questions are available for this skill yet');

    const session = await this.sessions.startSession({
      studentId: authId,
      internalUserId: internalId,
      sessionType: 'review_practice',
      skillFocusIds: [skillKey],
    });
    return { sessionId: session.id, skillKey, level: session.currentLevel, questions };
  }

  // -------------------------------------------------------------------------

  private async studentLevel(ids: string[]): Promise<Level> {
    const r = await this.db.query<{ current_level: string }>(
      `SELECT current_level FROM learning_sessions WHERE student_id = ANY($1::uuid[]) ORDER BY started_at DESC LIMIT 1`, [ids]);
    const lvl = r.rows[0]?.current_level;
    return (LEVELS as readonly string[]).includes(lvl) ? (lvl as Level) : 'beginner';
  }

  private async withOptions(rows: Array<{ id: string; type: string; stem: string }>, source: RecoveryQuestion['source']): Promise<RecoveryQuestion[]> {
    if (rows.length === 0) return [];
    const c = await this.db.query<{ question_id: string; id: string; text: string }>(
      `SELECT question_id, id, text FROM question_choices WHERE question_id = ANY($1::uuid[]) ORDER BY sort_order, created_at`,
      [rows.map((r) => r.id)]);
    const by = new Map<string, Array<{ id: string; text: string }>>();
    for (const o of c.rows) by.set(o.question_id, [...(by.get(o.question_id) ?? []), { id: o.id, text: o.text }]);
    // A question without options cannot be answered from this screen; skip it rather than ship a dead card.
    return rows.filter((r) => (by.get(r.id)?.length ?? 0) >= 2).map((r) => ({ itemId: r.id, type: r.type, prompt: r.stem, options: by.get(r.id) ?? [], source }));
  }

  private async missedQuestions(ids: string[], skillKey: string, limit: number): Promise<RecoveryQuestion[]> {
    const r = await this.db.query<{ id: string; type: string; stem: string }>(
      `WITH latest AS (
         SELECT DISTINCT ON (item_id) item_id, is_correct, submitted_at, skill_ids
           FROM lesson_attempts WHERE student_id = ANY($1::uuid[]) ORDER BY item_id, submitted_at DESC
       )
       SELECT qb.id, qb.type, qb.stem
         FROM latest l JOIN question_bank qb ON qb.id = l.item_id AND qb.type = ANY($3)
        WHERE NOT l.is_correct AND l.skill_ids ? $2::text
          AND (qb.status = 'published' OR EXISTS (SELECT 1 FROM recovery_questions rq WHERE rq.question_id = qb.id AND rq.student_id = ANY($1::uuid[])))
        ORDER BY l.submitted_at DESC LIMIT $4`,
      [ids, skillKey, OPTION_TYPES, limit]);
    return this.withOptions(r.rows, 'missed');
  }

  /** Unseen published questions for the skill, never harder than the student's level, nearest level first. */
  private async bankQuestions(ids: string[], skillKey: string, level: Level, limit: number, exclude: ReadonlySet<string>): Promise<RecoveryQuestion[]> {
    if (limit <= 0) return [];
    const allowed = LEVELS.slice(0, levelRank(level) + 1);
    const r = await this.db.query<{ id: string; type: string; stem: string }>(
      `SELECT qb.id, qb.type, qb.stem
         FROM question_bank qb
         JOIN question_skills qs ON qs.question_id = qb.id
         JOIN skills s ON s.id = qs.skill_id AND s.key = $2
        WHERE qb.status = 'published' AND qb.type = ANY($3) AND qb.difficulty = ANY($4)
          AND qb.id <> ALL($5::uuid[])
          AND NOT EXISTS (SELECT 1 FROM lesson_attempts la WHERE la.item_id = qb.id AND la.student_id = ANY($1::uuid[]))
        ORDER BY array_position($6::text[], qb.difficulty) DESC, random() LIMIT $7`,
      [ids, skillKey, OPTION_TYPES, allowed, [...exclude], allowed, limit]);
    return this.withOptions(r.rows, 'bank');
  }

  /** Ask the AI for `count` questions at the student's level, store them as the student's own, and return them. */
  private async generateForStudent(
    authId: string,
    skill: RecoverySkill,
    skillRow: { id: string; description: string | null },
    level: Level,
    count: number,
    missed: RecoveryQuestion[],
  ): Promise<RecoveryQuestion[]> {
    const existing = await this.db.query<{ stem: string }>(
      `SELECT qb.stem FROM question_bank qb JOIN question_skills qs ON qs.question_id = qb.id WHERE qs.skill_id = $1 LIMIT 200`, [skillRow.id]);
    const stems = new Set(existing.rows.map((r) => r.stem.trim().toLowerCase()));

    const prompt =
      `You write practice questions for an English-learning app.\n` +
      `Skill: ${skill.title}${skillRow.description ? ` (${skillRow.description})` : ''}.\n` +
      `Student level: ${level.replace('_', ' ')}. Every question must be answerable at this level or EASIER. ` +
      `Use simple, common words. Never go beyond the level.\n` +
      (missed.length ? `The student recently got these wrong, so target the same underlying point with NEW wording and different examples:\n${missed.map((m) => `- ${m.prompt}`).join('\n')}\n` : '') +
      `Write exactly ${count} multiple-choice questions that test only this skill. Each has 3 or 4 short options, exactly one correct, ` +
      `and a one-sentence explanation of why the answer is right.\n` +
      `Reply with ONLY a JSON array, no other text: ` +
      `[{"stem":"...","options":["..."],"correctIndex":0,"explanation":"..."}]`;

    let text = '';
    try {
      const { model } = this.providerConfig.getConfig();
      text = (await this.provider.generateText({ providerKeyRef: 'recovery-questions', modelId: model, prompt })).text;
    } catch (e: unknown) {
      this.logger.warn(`recovery_generation_failed: ${e instanceof Error ? e.message : 'unknown error'}`);
      return [];
    }
    const valid = parseGeneratedQuestions(text, stems).slice(0, count);
    if (valid.length === 0) return [];

    const out: RecoveryQuestion[] = [];
    await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        for (const q of valid) {
          // 'draft' keeps it out of every shared query; recovery_questions is what lets this student answer it.
          const ins = await client.query<{ id: string }>(
            `INSERT INTO question_bank (type, stem, difficulty, explanation, tags, status, created_by)
             VALUES ('multiple_choice', $1, $2, $3, ARRAY['recovery', 'student-only', 'ai-generated'], 'draft', $4) RETURNING id`,
            [q.stem, level, q.explanation || null, authId]);
          const qid = ins.rows[0].id;
          // Models like to put the right answer first; shuffle so position gives nothing away.
          const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
          const options: Array<{ id: string; text: string }> = [];
          for (let pos = 0; pos < order.length; pos++) {
            const text = q.options[order[pos]];
            const c = await client.query<{ id: string }>(
              `INSERT INTO question_choices (question_id, text, is_correct, sort_order) VALUES ($1, $2, $3, $4) RETURNING id`,
              [qid, text, order[pos] === q.correctIndex, pos]);
            options.push({ id: c.rows[0].id, text });
          }
          await client.query(`INSERT INTO question_skills (question_id, skill_id, is_primary) VALUES ($1, $2, true)`, [qid, skillRow.id]);
          await client.query(`INSERT INTO recovery_questions (question_id, student_id, skill_key) VALUES ($1, $2, $3)`, [qid, authId, skill.skillKey]);
          out.push({ itemId: qid, type: 'multiple_choice', prompt: q.stem, options, source: 'ai' });
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        out.length = 0;
        this.logger.warn(`recovery_question_store_failed: ${e instanceof Error ? e.message : 'unknown error'}`);
      }
    });
    return out;
  }
}
