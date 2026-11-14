import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AiTeacherProviderGateway } from '../ai-teacher/governance/ai-teacher-provider.interface';
import { ProviderGatewayConfigService } from '../ai-teacher/provider-gateway/provider-gateway.config';
import { SessionsService } from '../sessions/sessions.service';
import { parseGeneratedQuestions } from './recovery.service';

/**
 * Skill practice: Grammar, Listening and Reading sessions on the Practice page.
 *
 * Every session is a REAL learning session (type adaptive_drill): each answer goes through
 * POST /sessions/:id/attempt, so the AIM engine (never this service, never a client) updates mastery.
 *
 *  - Grammar: published bank questions for the chosen skill, never harder than the student's level,
 *    unseen first. The AI only tops up when the bank runs short.
 *  - Reading: the AI writes a short passage plus questions answerable from it.
 *  - Listening: the AI writes a short spoken script plus questions; the existing question-audio
 *    endpoint turns the script into speech (one audio file per script).
 *
 * AI-written questions belong to ONE student: stored as drafts (so no shared query ever serves them)
 * and tied to the student in recovery_questions, which is what lets that student answer and hear them.
 */

export const PRACTICE_MODES = ['grammar', 'listening', 'reading'] as const;
export type PracticeMode = (typeof PRACTICE_MODES)[number];

export const GRAMMAR_SESSION_SIZE = 8;
export const PASSAGE_QUESTION_COUNT = 4;
/** Cap on AI-written questions per student per 24h, to bound AI and audio cost. */
export const DAILY_AI_QUESTION_CAP = 40;

const LEVELS = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'] as const;
type Level = (typeof LEVELS)[number];
const levelRank = (l: string): number => Math.max(0, LEVELS.indexOf(l as Level));

/** Skill-key level tag -> the student level where that skill starts to be appropriate. */
const TAG_RANK: Record<string, number> = { a1: 0, a2: 1, a3: 2, b1: 2, b2: 3, c1: 4, c2: 4 };

/** Pure: the level rank a skill key belongs to (en.a2.gra.x -> 1). Keys without a tag are available from the start. */
export function skillLevelRank(skillKey: string): number {
  for (const seg of skillKey.toLowerCase().split('.')) if (seg in TAG_RANK) return TAG_RANK[seg];
  return 0;
}

const PASSAGE_WORDS: Record<Level, string> = {
  beginner: '40 to 70', elementary: '70 to 110', intermediate: '110 to 160', upper_intermediate: '150 to 200', advanced: '180 to 260',
};

export interface PracticeSkill { skillKey: string; title: string; masteryScore: number | null; questionCount: number; recommended: boolean }
export interface PracticeQuestion {
  itemId: string; type: string; prompt: string; options: Array<{ id: string; text: string }>; source: 'bank' | 'ai';
}
export interface PracticeStart {
  sessionId: string; mode: PracticeMode; skillKey: string; title: string; level: string;
  /** Reading only: shown once above all the questions. */
  passage: string | null; questions: PracticeQuestion[];
}

export interface GeneratedSet { text: string; questions: Array<{ stem: string; options: string[]; correctIndex: number; explanation: string }> }

/** Pure: parse the model's {passage|script, questions[]} reply. Exported for tests. */
export function parseGeneratedSet(raw: string, textKey: 'passage' | 'script', existingStems: ReadonlySet<string>): GeneratedSet | null {
  const match = raw?.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let data: Record<string, unknown>;
  try { data = JSON.parse(match[0]) as Record<string, unknown>; } catch { return null; }
  const text = typeof data?.[textKey] === 'string' ? (data[textKey] as string).trim() : '';
  if (text.length < 30 || text.length > 2400) return null;
  const questions = parseGeneratedQuestions(JSON.stringify(Array.isArray(data.questions) ? data.questions : []), existingStems);
  return questions.length >= 2 ? { text, questions } : null;
}

const shuffle = <T,>(xs: readonly T[]): T[] => [...xs].sort(() => Math.random() - 0.5);
const studentIds = (ids: string | readonly string[]): string[] => [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];

@Injectable()
export class SkillPracticeService {
  private readonly logger = new Logger(SkillPracticeService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly sessions: SessionsService,
    private readonly provider: AiTeacherProviderGateway,
    private readonly providerConfig: ProviderGatewayConfigService,
  ) {}

  /** The skills the student can practise in [mode]: at or below their level, weakest first. */
  async skills(student: string | readonly string[], mode: unknown): Promise<{ mode: PracticeMode; level: string; skills: PracticeSkill[] }> {
    const m = this.parseMode(mode);
    const ids = studentIds(student);
    const level = await this.studentLevel(ids);
    const rows = await this.db.query<any>(
      `SELECT s.key, s.title,
              (SELECT mastery_score::float FROM student_skill_states ss
                WHERE ss.student_id = ANY($1::uuid[]) AND ss.skill_id = s.key
                ORDER BY ss.last_evaluated_at DESC LIMIT 1) AS mastery,
              (SELECT count(DISTINCT qb.id)::int FROM question_skills qs
                 JOIN question_bank qb ON qb.id = qs.question_id AND qb.status = 'published'
                WHERE qs.skill_id = s.id) AS q_count
         FROM skills s
        WHERE s.domain = $2 AND s.status = 'published' AND s.key NOT LIKE '%placement%'
        ORDER BY s.key`,
      [ids, m],
    );
    const allowed = rows.rows.filter((r) => skillLevelRank(r.key) <= levelRank(level));
    const pool = allowed.length > 0 ? allowed : rows.rows.filter((r) => skillLevelRank(r.key) === 0);
    const weakest = [...pool].sort(
      (a, b) => (a.mastery ?? 0.5) - (b.mastery ?? 0.5) || skillLevelRank(b.key) - skillLevelRank(a.key) || a.key.localeCompare(b.key),
    )[0];
    const skills = pool
      .map((r): PracticeSkill => ({
        skillKey: r.key, title: r.title ?? r.key, masteryScore: r.mastery, questionCount: r.q_count ?? 0, recommended: r.key === weakest?.key,
      }))
      .sort((a, b) => Number(b.recommended) - Number(a.recommended) || (a.masteryScore ?? 0.5) - (b.masteryScore ?? 0.5));
    return { mode: m, level, skills };
  }

  async start(authId: string, internalId: string, mode: unknown, skillKey?: unknown): Promise<PracticeStart> {
    const m = this.parseMode(mode);
    const ids = studentIds([authId, internalId]);
    const { skills, level } = await this.skills(ids, m);
    const wanted = typeof skillKey === 'string' && skillKey.trim() ? skillKey.trim() : null;
    const skill = wanted ? skills.find((s) => s.skillKey === wanted) : skills.find((s) => s.recommended) ?? skills[0];
    if (!skill) throw new NotFoundException(wanted ? 'This skill is not available for you yet' : 'No practice is available for this skill area yet');
    const skillRow = await this.db.query<{ id: string; description: string | null }>(`SELECT id, description FROM skills WHERE key = $1 LIMIT 1`, [skill.skillKey]);
    if (!skillRow.rowCount) throw new NotFoundException('Skill not found');

    let passage: string | null = null;
    let questions: PracticeQuestion[] = [];
    if (m === 'grammar') {
      questions = await this.bankQuestions(ids, skill.skillKey, level as Level, GRAMMAR_SESSION_SIZE, ['multiple_choice', 'true_false', 'fill_in_the_blank']);
      if (questions.length < 5) {
        const ai = await this.generate(authId, m, skill, skillRow.rows[0], level as Level, GRAMMAR_SESSION_SIZE - questions.length);
        questions.push(...ai.questions);
      }
    } else {
      const ai = await this.generate(authId, m, skill, skillRow.rows[0], level as Level, PASSAGE_QUESTION_COUNT);
      questions = ai.questions;
      passage = m === 'reading' ? ai.text : null;
      if (questions.length === 0) {
        // The AI is unavailable (or over the daily cap): fall back to what the bank has for this skill.
        questions = await this.bankQuestions(ids, skill.skillKey, level as Level, PASSAGE_QUESTION_COUNT, m === 'listening' ? ['listening_choice'] : ['multiple_choice', 'true_false']);
        passage = null;
      }
    }
    if (questions.length === 0) throw new ServiceUnavailableException('We could not prepare this practice right now. Please try again in a moment.');

    const session = await this.sessions.startSession({ studentId: authId, internalUserId: internalId, sessionType: 'adaptive_drill', skillFocusIds: [skill.skillKey] });
    return { sessionId: session.id, mode: m, skillKey: skill.skillKey, title: skill.title, level: session.currentLevel, passage, questions };
  }

  // -------------------------------------------------------------------------

  private parseMode(mode: unknown): PracticeMode {
    if (typeof mode === 'string' && (PRACTICE_MODES as readonly string[]).includes(mode)) return mode as PracticeMode;
    throw new BadRequestException('mode must be grammar, listening or reading');
  }

  private async studentLevel(ids: string[]): Promise<Level> {
    const r = await this.db.query<{ current_level: string }>(
      `SELECT current_level FROM learning_sessions WHERE student_id = ANY($1::uuid[]) ORDER BY started_at DESC LIMIT 1`, [ids]);
    const lvl = r.rows[0]?.current_level;
    return (LEVELS as readonly string[]).includes(lvl) ? (lvl as Level) : 'beginner';
  }

  /** Published questions for the skill, never harder than the student's level; unseen first, then least recent. */
  private async bankQuestions(ids: string[], skillKey: string, level: Level, limit: number, types: string[]): Promise<PracticeQuestion[]> {
    const allowed = LEVELS.slice(0, levelRank(level) + 1);
    const r = await this.db.query<{ id: string; type: string; stem: string }>(
      `SELECT qb.id, qb.type, qb.stem
         FROM question_bank qb
         JOIN question_skills qs ON qs.question_id = qb.id
         JOIN skills s ON s.id = qs.skill_id AND s.key = $2
        WHERE qb.status = 'published' AND qb.type = ANY($3) AND qb.difficulty = ANY($4)
        GROUP BY qb.id, qb.type, qb.stem, qb.difficulty
        ORDER BY (SELECT max(la.submitted_at) FROM lesson_attempts la WHERE la.item_id = qb.id AND la.student_id = ANY($1::uuid[])) ASC NULLS FIRST,
                 array_position($4::text[], qb.difficulty) DESC, random()
        LIMIT $5`,
      [ids, skillKey, types, allowed, limit]);
    return this.withOptions(r.rows, 'bank');
  }

  private async withOptions(rows: Array<{ id: string; type: string; stem: string }>, source: PracticeQuestion['source']): Promise<PracticeQuestion[]> {
    if (rows.length === 0) return [];
    const c = await this.db.query<{ question_id: string; id: string; text: string }>(
      `SELECT question_id, id, text FROM question_choices WHERE question_id = ANY($1::uuid[]) ORDER BY sort_order, created_at`, [rows.map((r) => r.id)]);
    const by = new Map<string, Array<{ id: string; text: string }>>();
    for (const o of c.rows) by.set(o.question_id, [...(by.get(o.question_id) ?? []), { id: o.id, text: o.text }]);
    return rows
      .map((r): PracticeQuestion | null => {
        const opts = by.get(r.id) ?? [];
        const typed = r.type === 'fill_in_the_blank';
        if (typed ? opts.length > 0 : opts.length < 2) return null; // a typed question has no options; a choice question needs two
        return { itemId: r.id, type: r.type, prompt: r.stem, options: r.type === 'true_false' ? opts : shuffle(opts), source };
      })
      .filter((q): q is PracticeQuestion => q !== null);
  }

  /** Ask the AI for questions (and a passage/script), store them as this student's own, and return them. */
  private async generate(
    authId: string, mode: PracticeMode, skill: PracticeSkill, skillRow: { id: string; description: string | null }, level: Level, count: number,
  ): Promise<{ text: string; questions: PracticeQuestion[] }> {
    const none = { text: '', questions: [] as PracticeQuestion[] };
    if (count <= 0) return none;
    const used = await this.db.query<{ n: string }>(`SELECT count(*)::text AS n FROM recovery_questions WHERE student_id = $1 AND created_at > now() - interval '24 hours'`, [authId]);
    if (parseInt(used.rows[0]?.n ?? '0', 10) + count > DAILY_AI_QUESTION_CAP) {
      this.logger.log(`practice_ai_cap_reached student=${authId}`);
      return none;
    }
    const existing = await this.db.query<{ stem: string }>(
      `SELECT qb.stem FROM question_bank qb JOIN question_skills qs ON qs.question_id = qb.id WHERE qs.skill_id = $1 LIMIT 200`, [skillRow.id]);
    const stems = new Set(existing.rows.map((r) => r.stem.trim().toLowerCase()));

    const topic = `${skill.title}${skillRow.description ? ` (${skillRow.description})` : ''}`;
    const levelText = `Student level: ${level.replace('_', ' ')}. Everything must be understandable at this level or EASIER: simple, common words and short sentences. Never go beyond the level.`;
    const prompt = mode === 'grammar'
      ? `You write grammar practice for an English-learning app.\nSkill: ${topic}.\n${levelText}\n` +
        `Write exactly ${count} multiple-choice questions that test only this grammar point. Each has 3 or 4 short options, exactly one correct, and a one-sentence explanation.\n` +
        `Reply with ONLY a JSON array: [{"stem":"...","options":["..."],"correctIndex":0,"explanation":"..."}]`
      : mode === 'reading'
        ? `You write reading practice for an English-learning app.\nSkill: ${topic}.\n${levelText}\n` +
          `Write a short reading passage of ${PASSAGE_WORDS[level]} words about an everyday topic. Then write exactly ${count} multiple-choice questions that can be answered ONLY from the passage (no outside knowledge). ` +
          `Each has 3 or 4 short options, exactly one correct, and a one-sentence explanation that points to the passage.\n` +
          `Reply with ONLY a JSON object: {"passage":"...","questions":[{"stem":"...","options":["..."],"correctIndex":0,"explanation":"..."}]}`
        : `You write listening practice for an English-learning app. The script will be read aloud by one voice.\nSkill: ${topic}.\n${levelText}\n` +
          `Write a short spoken script (an announcement, a message or a tiny story) of ${PASSAGE_WORDS[level]} words, as ONE speaker, with NO speaker labels and NO stage directions. ` +
          `Then write exactly ${count} multiple-choice questions about what was said. Never copy the script into a question. Each has 3 or 4 short options, exactly one correct, and a one-sentence explanation.\n` +
          `Reply with ONLY a JSON object: {"script":"...","questions":[{"stem":"...","options":["..."],"correctIndex":0,"explanation":"..."}]}`;

    let raw = '';
    try {
      const { model } = this.providerConfig.getConfig();
      raw = (await this.provider.generateText({ providerKeyRef: 'skill-practice', modelId: model, prompt })).text;
    } catch (e: unknown) {
      this.logger.warn(`practice_generation_failed mode=${mode}: ${e instanceof Error ? e.message : 'unknown error'}`);
      return none;
    }
    const textKey = mode === 'listening' ? 'script' : 'passage';
    const set = mode === 'grammar'
      ? ((): GeneratedSet | null => {
          const qs = parseGeneratedQuestions(raw.match(/\[[\s\S]*\]/)?.[0] ?? '', stems);
          return qs.length ? { text: '', questions: qs } : null;
        })()
      : parseGeneratedSet(raw, textKey, stems);
    if (!set) return none;
    const questions = set.questions.slice(0, count);

    const out: PracticeQuestion[] = [];
    await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        for (const q of questions) {
          const isListening = mode === 'listening';
          const ins = await client.query<{ id: string }>(
            `INSERT INTO question_bank (type, stem, difficulty, explanation, tags, status, created_by, rich_stem, listening_script)
             VALUES ($1, $2, $3, $4, ARRAY['practice', 'student-only', 'ai-generated'], 'draft', $5, $6::jsonb, $7) RETURNING id`,
            [isListening ? 'listening_choice' : 'multiple_choice', q.stem, level, q.explanation || null, authId,
             mode === 'reading' ? JSON.stringify({ passage: set.text }) : null, isListening ? set.text : null]);
          const qid = ins.rows[0].id;
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
          out.push({ itemId: qid, type: isListening ? 'listening_choice' : 'multiple_choice', prompt: q.stem, options, source: 'ai' });
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        out.length = 0;
        this.logger.warn(`practice_question_store_failed: ${e instanceof Error ? e.message : 'unknown error'}`);
      }
    });
    return { text: out.length ? set.text : '', questions: out };
  }
}
