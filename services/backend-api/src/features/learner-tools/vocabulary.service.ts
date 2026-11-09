import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export const WORD_SOURCES = ['manual', 'chat', 'lesson', 'voice', 'library'] as const;
/** Leitner schedule: days until the next review for each box (index = box - 1). A miss drops back to box 1. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;
export const MAX_BOX = BOX_INTERVAL_DAYS.length;

export interface SavedWord {
  id: string; word: string; meaning: string | null; context: string | null; source: string;
  box: number; nextReviewAt: string; timesCorrect: number; timesWrong: number; createdAt: string;
}

const toWord = (r: any): SavedWord => ({
  id: r.id, word: r.word, meaning: r.meaning, context: r.context, source: r.source, box: r.box,
  nextReviewAt: new Date(r.next_review_at).toISOString(), timesCorrect: r.times_correct,
  timesWrong: r.times_wrong, createdAt: new Date(r.created_at).toISOString(),
});

const COLS = 'id, word, meaning, context, source, box, next_review_at, times_correct, times_wrong, created_at';

function clean(v: unknown, field: string, max: number, required: boolean): string | null {
  if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
    if (required) throw new BadRequestException(`${field} is required`);
    return null;
  }
  if (typeof v !== 'string' || v.trim().length > max) throw new BadRequestException(`${field} must be text up to ${max} characters`);
  return v.trim().replace(/\s+/g, ' ');
}

/** Next box and review time after an answer. Pure so it can be tested without a database. */
export function nextSchedule(box: number, correct: boolean, now = new Date()): { box: number; nextReviewAt: Date } {
  if (!correct) return { box: 1, nextReviewAt: new Date(now.getTime() + 10 * 60_000) };
  const nb = Math.min(MAX_BOX, box + 1);
  return { box: nb, nextReviewAt: new Date(now.getTime() + BOX_INTERVAL_DAYS[nb - 1] * 86_400_000) };
}

@Injectable()
export class VocabularyService {
  constructor(private readonly db: DatabaseService) {}

  async list(studentId: string, limit = 200): Promise<{ words: SavedWord[]; dueCount: number }> {
    const [rows, due] = await Promise.all([
      this.db.query(`SELECT ${COLS} FROM saved_words WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2`, [studentId, limit]),
      this.db.query<{ n: string }>(`SELECT count(*)::text AS n FROM saved_words WHERE student_id = $1 AND next_review_at <= now()`, [studentId]),
    ]);
    return { words: rows.rows.map(toWord), dueCount: parseInt(due.rows[0]?.n ?? '0', 10) };
  }

  async save(studentId: string, body: Record<string, unknown>): Promise<SavedWord> {
    const word = clean(body.word, 'word', 60, true)!;
    const source = body.source === undefined ? 'manual' : String(body.source);
    if (!(WORD_SOURCES as readonly string[]).includes(source)) throw new BadRequestException('Invalid source');
    // Saving a word that is already there refreshes its meaning/context instead of failing the tap.
    const r = await this.db.query(
      `INSERT INTO saved_words (student_id, word, meaning, context, source)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, lower(btrim(word)))
       DO UPDATE SET meaning = COALESCE(EXCLUDED.meaning, saved_words.meaning),
                     context = COALESCE(EXCLUDED.context, saved_words.context)
       RETURNING ${COLS}`,
      [studentId, word, clean(body.meaning, 'meaning', 200, false), clean(body.context, 'context', 300, false), source],
    );
    return toWord(r.rows[0]);
  }

  async remove(studentId: string, id: string): Promise<void> {
    const r = await this.db.query(`DELETE FROM saved_words WHERE id = $1 AND student_id = $2`, [id, studentId]);
    if (!r.rowCount) throw new NotFoundException('Word not found');
  }

  async dueCards(studentId: string, limit = 20): Promise<SavedWord[]> {
    const r = await this.db.query(
      `SELECT ${COLS} FROM saved_words WHERE student_id = $1 AND next_review_at <= now()
       ORDER BY next_review_at ASC LIMIT $2`, [studentId, limit]);
    return r.rows.map(toWord);
  }

  async review(studentId: string, id: string, correct: unknown): Promise<SavedWord> {
    if (typeof correct !== 'boolean') throw new BadRequestException('correct must be true or false');
    const cur = await this.db.query<{ box: number }>(`SELECT box FROM saved_words WHERE id = $1 AND student_id = $2`, [id, studentId]);
    if (!cur.rows[0]) throw new NotFoundException('Word not found');
    const next = nextSchedule(cur.rows[0].box, correct);
    const r = await this.db.query(
      `UPDATE saved_words SET box = $3, next_review_at = $4, last_reviewed_at = now(),
              times_correct = times_correct + $5, times_wrong = times_wrong + $6
       WHERE id = $1 AND student_id = $2 RETURNING ${COLS}`,
      [id, studentId, next.box, next.nextReviewAt, correct ? 1 : 0, correct ? 0 : 1]);
    return toWord(r.rows[0]);
  }
}
