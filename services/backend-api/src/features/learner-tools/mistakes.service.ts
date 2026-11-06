import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

const CHOICE_TYPES = ['multiple_choice', 'true_false', 'listening_choice'];

export interface MistakeItem {
  itemId: string; type: string; prompt: string; listeningScript: string | null;
  /** Skills the question trains (skill keys), so a weak spot can show its own mistakes. */
  skillIds: string[];
  options: Array<{ id: string; text: string }>; yourAnswer: string | null; answeredAt: string;
}
export interface MistakeCheck { correct: boolean; correctChoiceId: string | null; correctText: string | null; explanation: string | null }

/**
 * "My mistakes": questions whose most recent attempt was wrong. Retrying here is a drill only —
 * it never writes lesson attempts or mastery (those belong to the AIM engine); a correct retry just
 * hides the question from the list until the student gets it wrong again in a real session.
 */
/**
 * Quiz and practice attempts are stored under the student's sign-in id (users.supabase_auth_uid), while the rest
 * of the learner tools use the internal users.id. A student's mistakes can sit under either, so both are matched.
 * The first id must be the internal users.id: "fixed" marks are stored against it (a foreign key to users).
 */
const studentIds = (ids: string | readonly string[]): string[] => [...new Set((Array.isArray(ids) ? ids : [ids]).filter(Boolean))];

@Injectable()
export class MistakesService {
  constructor(private readonly db: DatabaseService) {}

  async list(student: string | readonly string[], limit = 30, skill?: string): Promise<{ total: number; items: MistakeItem[] }> {
    const ids = studentIds(student);
    const base = `
      WITH latest AS (
        SELECT DISTINCT ON (item_id) item_id, answer_value, is_correct, submitted_at, skill_ids
        FROM lesson_attempts WHERE student_id = ANY($1::uuid[])
        ORDER BY item_id, submitted_at DESC
      ), open AS (
        SELECT l.* FROM latest l
        JOIN question_bank qb ON qb.id = l.item_id AND qb.status = 'published' AND qb.type = ANY($2)
        WHERE NOT l.is_correct
          AND ($3::text IS NULL OR l.skill_ids ? $3::text)
          AND NOT EXISTS (SELECT 1 FROM mistake_resolutions r
                          WHERE r.student_id = ANY($1::uuid[]) AND r.item_id = l.item_id AND r.resolved_at > l.submitted_at)
      )`;
    const [rows, total] = await Promise.all([
      this.db.query<any>(
        `${base}
         SELECT qb.id, qb.type, qb.stem, qb.listening_script, o.answer_value, o.submitted_at, o.skill_ids,
                COALESCE((SELECT json_agg(json_build_object('id', c.id, 'text', c.text) ORDER BY c.sort_order, c.created_at)
                          FROM question_choices c WHERE c.question_id = qb.id), '[]'::json) AS options
         FROM open o JOIN question_bank qb ON qb.id = o.item_id
         ORDER BY o.submitted_at DESC LIMIT $4`, [ids, CHOICE_TYPES, skill ?? null, limit]),
      this.db.query<{ n: string }>(`${base} SELECT count(*)::text AS n FROM open`, [ids, CHOICE_TYPES, skill ?? null]),
    ]);
    return {
      total: parseInt(total.rows[0]?.n ?? '0', 10),
      items: rows.rows.map((r) => {
        const options = r.options as Array<{ id: string; text: string }>;
        return {
          itemId: r.id, type: r.type, prompt: r.stem, listeningScript: r.listening_script,
          skillIds: Array.isArray(r.skill_ids) ? (r.skill_ids as unknown[]).filter((x): x is string => typeof x === 'string') : [],
          options, yourAnswer: options.find((o) => o.id === r.answer_value)?.text ?? null,
          answeredAt: new Date(r.submitted_at).toISOString(),
        };
      }),
    };
  }

  async check(student: string | readonly string[], itemId: unknown, answerId: unknown): Promise<MistakeCheck> {
    const ids = studentIds(student);
    if (typeof itemId !== 'string' || typeof answerId !== 'string') throw new BadRequestException('itemId and answerId are required');
    // Only questions this student has actually attempted can be checked (no answer lookup for arbitrary ids).
    const attempted = await this.db.query(`SELECT 1 FROM lesson_attempts WHERE student_id = ANY($1::uuid[]) AND item_id = $2 LIMIT 1`, [ids, itemId]);
    if (!attempted.rowCount) throw new NotFoundException('Question not found');
    const q = await this.db.query<any>(
      `SELECT qb.explanation, c.id, c.text, c.is_correct
       FROM question_bank qb JOIN question_choices c ON c.question_id = qb.id
       WHERE qb.id = $1 AND qb.status = 'published'`, [itemId]);
    if (!q.rows.length) throw new NotFoundException('Question not found');
    const correctRow = q.rows.find((r) => r.is_correct);
    const correct = !!correctRow && correctRow.id === answerId;
    if (correct) {
      await this.db.query(
        `INSERT INTO mistake_resolutions (student_id, item_id) VALUES ($1, $2)
         ON CONFLICT (student_id, item_id) DO UPDATE SET resolved_at = now()`, [ids[0], itemId]);
    }
    return { correct, correctChoiceId: correctRow?.id ?? null, correctText: correctRow?.text ?? null, explanation: q.rows[0].explanation ?? null };
  }
}
