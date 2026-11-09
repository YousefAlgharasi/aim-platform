import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PersistentTtsAudioService } from '../voice-teacher/tts-gateway/persistent/persistent-tts-audio.service';

export const VOCAB_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type VocabLevel = (typeof VOCAB_LEVELS)[number];
export const PARTS_OF_SPEECH = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'phrase'] as const;

export interface LibraryWord {
  id: string; word: string; translationAr: string; exampleSentence: string;
  partOfSpeech: string | null; level: VocabLevel; saved: boolean;
}
export interface AdminLibraryWord extends Omit<LibraryWord, 'saved'> { sortOrder: number; isActive: boolean }

const MAX_LIMIT = 100;

/** Turn the raw query-string numbers into safe paging values. */
export function paging(limit: unknown, offset: unknown, fallbackLimit = 30): { limit: number; offset: number } {
  const l = Number.parseInt(String(limit ?? ''), 10);
  const o = Number.parseInt(String(offset ?? ''), 10);
  return { limit: Number.isFinite(l) && l > 0 ? Math.min(l, MAX_LIMIT) : fallbackLimit, offset: Number.isFinite(o) && o > 0 ? o : 0 };
}

function level(v: unknown, required: boolean): VocabLevel | null {
  if (v === undefined || v === null || v === '') {
    if (required) throw new BadRequestException('level is required');
    return null;
  }
  if (!(VOCAB_LEVELS as readonly string[]).includes(String(v))) throw new BadRequestException('level must be beginner, intermediate or advanced');
  return v as VocabLevel;
}

function text(v: unknown, field: string, max: number, required: boolean): string | null {
  if (v === undefined || v === null || (typeof v === 'string' && !v.trim())) {
    if (required) throw new BadRequestException(`${field} is required`);
    return null;
  }
  if (typeof v !== 'string' || v.trim().length > max) throw new BadRequestException(`${field} must be text up to ${max} characters`);
  return v.trim().replace(/\s+/g, ' ');
}

function pos(v: unknown): string | null {
  if (v === undefined || v === null || v === '') return null;
  if (!(PARTS_OF_SPEECH as readonly string[]).includes(String(v))) throw new BadRequestException(`partOfSpeech must be one of ${PARTS_OF_SPEECH.join(', ')}`);
  return String(v);
}

const toAdmin = (r: any): AdminLibraryWord => ({
  id: r.id, word: r.word, translationAr: r.translation_ar, exampleSentence: r.example_sentence,
  partOfSpeech: r.part_of_speech, level: r.level, sortOrder: r.sort_order, isActive: r.is_active,
});

const ADMIN_COLS = 'id, word, translation_ar, example_sentence, part_of_speech, level, sort_order, is_active';

@Injectable()
export class VocabularyLibraryService {
  constructor(
    private readonly db: DatabaseService,
    private readonly tts: PersistentTtsAudioService,
  ) {}

  // ── Student ──────────────────────────────────────────────────────────────

  async list(studentId: string, q: { level?: string; q?: string; limit?: unknown; offset?: unknown }) {
    const lvl = level(q.level, false);
    const { limit, offset } = paging(q.limit, q.offset);
    const search = (q.q ?? '').trim().slice(0, 60);
    const like = search ? `%${search.replace(/[\\%_]/g, '\\$&')}%` : null;
    const filter = (l: string, s: string) =>
      `w.is_active AND (${l}::text IS NULL OR w.level = ${l}) AND (${s}::text IS NULL OR w.word ILIKE ${s} OR w.translation_ar ILIKE ${s})`;
    const [rows, total] = await Promise.all([
      this.db.query(
        `SELECT w.id, w.word, w.translation_ar, w.example_sentence, w.part_of_speech, w.level,
                EXISTS (SELECT 1 FROM saved_words s WHERE s.student_id = $1 AND lower(btrim(s.word)) = lower(btrim(w.word))) AS saved
           FROM vocabulary_words w
          WHERE ${filter('$2', '$3')}
          ORDER BY w.sort_order ASC, lower(w.word) ASC
          LIMIT ${limit} OFFSET ${offset}`, [studentId, lvl, like]),
      this.db.query<{ n: string }>(`SELECT count(*)::text AS n FROM vocabulary_words w WHERE ${filter('$1', '$2')}`, [lvl, like]),
    ]);
    return {
      words: rows.rows.map((r: any): LibraryWord => ({
        id: r.id, word: r.word, translationAr: r.translation_ar, exampleSentence: r.example_sentence,
        partOfSpeech: r.part_of_speech, level: r.level, saved: r.saved,
      })),
      total: parseInt(total.rows[0]?.n ?? '0', 10),
      limit, offset,
    };
  }

  private async activeWord(id: string) {
    const r = await this.db.query<{ word: string; translation_ar: string; example_sentence: string }>(
      `SELECT word, translation_ar, example_sentence FROM vocabulary_words WHERE id = $1 AND is_active`, [id]);
    if (!r.rows[0]) throw new NotFoundException('Word not found');
    return r.rows[0];
  }

  /** Save to My words (idempotent). The Arabic translation becomes the meaning, the example the context. */
  async save(studentId: string, id: string): Promise<{ saved: true }> {
    const w = await this.activeWord(id);
    await this.db.query(
      `INSERT INTO saved_words (student_id, word, meaning, context, source)
       VALUES ($1, $2, $3, $4, 'library')
       ON CONFLICT (student_id, lower(btrim(word)))
       DO UPDATE SET meaning = COALESCE(saved_words.meaning, EXCLUDED.meaning),
                     context = COALESCE(saved_words.context, EXCLUDED.context)`,
      [studentId, w.word, w.translation_ar, w.example_sentence]);
    return { saved: true };
  }

  async unsave(studentId: string, id: string): Promise<{ saved: false }> {
    const w = await this.activeWord(id);
    await this.db.query(`DELETE FROM saved_words WHERE student_id = $1 AND lower(btrim(word)) = lower(btrim($2))`, [studentId, w.word]);
    return { saved: false };
  }

  /** Spoken pronunciation of the word (text-to-speech). Returns the stored audio reference. */
  async audioRef(studentId: string, id: string): Promise<string | null> {
    const w = await this.activeWord(id);
    return this.tts.getStudentAudioRef({
      scope: 'vocabulary', subjectId: id, questionId: null, script: w.word, languageCode: 'en', studentId,
    });
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async adminList(q: { level?: string; q?: string; limit?: unknown; offset?: unknown }) {
    const lvl = level(q.level, false);
    const { limit, offset } = paging(q.limit, q.offset, 50);
    const search = (q.q ?? '').trim().slice(0, 60);
    const params = [lvl, search ? `%${search.replace(/[\\%_]/g, '\\$&')}%` : null];
    const where = `($1::text IS NULL OR level = $1) AND ($2::text IS NULL OR word ILIKE $2 OR translation_ar ILIKE $2)`;
    const [rows, total, byLevel] = await Promise.all([
      this.db.query(`SELECT ${ADMIN_COLS} FROM vocabulary_words WHERE ${where} ORDER BY level, sort_order, lower(word) LIMIT ${limit} OFFSET ${offset}`, params),
      this.db.query<{ n: string }>(`SELECT count(*)::text AS n FROM vocabulary_words WHERE ${where}`, params),
      this.db.query<{ level: string; n: string }>(`SELECT level, count(*)::text AS n FROM vocabulary_words GROUP BY level`),
    ]);
    return {
      words: rows.rows.map(toAdmin),
      total: parseInt(total.rows[0]?.n ?? '0', 10),
      counts: Object.fromEntries(byLevel.rows.map((r) => [r.level, parseInt(r.n, 10)])),
      limit, offset,
    };
  }

  async create(body: Record<string, unknown>): Promise<AdminLibraryWord> {
    const vals = [
      text(body.word, 'word', 60, true), text(body.translationAr, 'translationAr', 200, true),
      text(body.exampleSentence, 'exampleSentence', 300, true), pos(body.partOfSpeech), level(body.level, true),
      Number.parseInt(String(body.sortOrder ?? 0), 10) || 0, body.isActive === false ? false : true,
    ];
    try {
      const r = await this.db.query(
        `INSERT INTO vocabulary_words (word, translation_ar, example_sentence, part_of_speech, level, sort_order, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${ADMIN_COLS}`, vals);
      return toAdmin(r.rows[0]);
    } catch (e: any) {
      if (e?.code === '23505') throw new BadRequestException('This word already exists in the library');
      throw e;
    }
  }

  async update(id: string, body: Record<string, unknown>): Promise<AdminLibraryWord> {
    const sets: string[] = [];
    const vals: unknown[] = [id];
    const add = (col: string, v: unknown) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
    if (body.word !== undefined) add('word', text(body.word, 'word', 60, true));
    if (body.translationAr !== undefined) add('translation_ar', text(body.translationAr, 'translationAr', 200, true));
    if (body.exampleSentence !== undefined) add('example_sentence', text(body.exampleSentence, 'exampleSentence', 300, true));
    if (body.partOfSpeech !== undefined) add('part_of_speech', pos(body.partOfSpeech));
    if (body.level !== undefined) add('level', level(body.level, true));
    if (body.sortOrder !== undefined) add('sort_order', Number.parseInt(String(body.sortOrder), 10) || 0);
    if (body.isActive !== undefined) add('is_active', body.isActive === true);
    if (!sets.length) throw new BadRequestException('Nothing to update');
    try {
      const r = await this.db.query(`UPDATE vocabulary_words SET ${sets.join(', ')}, updated_at = now() WHERE id = $1 RETURNING ${ADMIN_COLS}`, vals);
      if (!r.rows[0]) throw new NotFoundException('Word not found');
      return toAdmin(r.rows[0]);
    } catch (e: any) {
      if (e?.code === '23505') throw new BadRequestException('This word already exists in the library');
      throw e;
    }
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const r = await this.db.query(`DELETE FROM vocabulary_words WHERE id = $1`, [id]);
    if (!r.rowCount) throw new NotFoundException('Word not found');
    return { deleted: true };
  }
}
