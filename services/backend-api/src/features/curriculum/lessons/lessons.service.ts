import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DEFAULT_LOCALE, SupportedLocale, lessonTextSql } from '../../../common/locale';
import { loadAvailableLocales, runInTransaction, syncEnglishTranslation } from '../translations/entity-translations.helpers';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  CURRICULUM_CONTENT_STATUSES,
  CreateLessonInput,
  CurriculumContentStatus,
  LessonListResponse,
  LessonRow,
  LessonSummary,
  UpdateLessonInput,
} from './lessons.types';

const LESSON_TRANSLATION_TABLE = {
  entityTable: 'lessons',
  translationTable: 'lesson_translations',
  foreignKey: 'lesson_id',
} as const;

const LESSON_RETURNING = `id, chapter_id, title, description, sort_order, status, xp_value, system_prompt, teaching_outline, created_at, updated_at,
         'en'::text AS locale, ARRAY['en']::text[] AS available_locales`;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toLessonSummary(row: LessonRow): LessonSummary {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    title: row.title,
    description: row.description,
    status: row.status,
    sortOrder: row.sort_order,
    xpValue: row.xp_value,
    systemPrompt: row.system_prompt,
    teachingOutline: row.teaching_outline,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    locale: row.locale,
    availableLocales: row.available_locales ?? [],
  };
}

function validateStatus(status: string): asserts status is CurriculumContentStatus {
  if (!(CURRICULUM_CONTENT_STATUSES as readonly string[]).includes(status)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid status value: ${status}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class LessonsService {
  constructor(private readonly db: DatabaseService) {}

  async listLessons(
    page: number,
    limit: number,
    chapterId?: string,
    status?: string,
    q?: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<LessonListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) {
      validateStatus(status);
    }

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (chapterId !== undefined) {
      conditions.push(`l.chapter_id = $${idx++}`);
      values.push(chapterId);
    }

    if (status !== undefined) {
      conditions.push(`l.status = $${idx++}`);
      values.push(status);
    }

    const search = q?.trim();
    if (search) {
      conditions.push(
        `(l.title ILIKE $${idx} OR l.description ILIKE $${idx}
          OR EXISTS (SELECT 1 FROM lesson_translations st WHERE st.lesson_id = l.id
                       AND (st.title ILIKE $${idx} OR COALESCE(st.description, '') ILIKE $${idx})))`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM lessons l ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const text = lessonTextSql('l', `$${idx}`);
    const dataResult = await this.db.query<LessonRow>(
      `SELECT l.id, l.chapter_id, ${text.title} AS title, ${text.description} AS description,
              l.sort_order, l.status, l.xp_value, l.system_prompt, l.teaching_outline, l.created_at, l.updated_at,
              ${text.locale} AS locale,
              ARRAY(SELECT al.locale FROM lesson_translations al WHERE al.lesson_id = l.id ORDER BY al.locale) AS available_locales
         FROM lessons l
         ${text.joins}
         ${where}
         ORDER BY l.sort_order ASC, l.created_at ASC
         LIMIT $${idx + 1} OFFSET $${idx + 2}`,
      [...values, locale, safeLimit, offset],
    );

    return {
      lessons: dataResult.rows.map(toLessonSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getLesson(id: string, locale: SupportedLocale = DEFAULT_LOCALE): Promise<LessonSummary> {
    const text = lessonTextSql('l', '$2');
    const result = await this.db.query<LessonRow>(
      `SELECT l.id, l.chapter_id, ${text.title} AS title, ${text.description} AS description,
              l.sort_order, l.status, l.xp_value, l.system_prompt, l.teaching_outline, l.created_at, l.updated_at,
              ${text.locale} AS locale,
              ARRAY(SELECT al.locale FROM lesson_translations al WHERE al.lesson_id = l.id ORDER BY al.locale) AS available_locales
         FROM lessons l
         ${text.joins}
         WHERE l.id = $1`,
      [id, locale],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toLessonSummary(result.rows[0]);
  }

  async createLesson(input: CreateLessonInput): Promise<LessonSummary> {
    const { chapterId, title, description, sortOrder } = input;

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Lesson title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (!description || description.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Lesson description is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Verify parent chapter exists
    const chapterCheck = await this.db.query<{ id: string }>(
      `SELECT id FROM chapters WHERE id = $1 LIMIT 1`,
      [chapterId],
    );
    if (chapterCheck.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Chapter not found: ${chapterId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const resolvedSortOrder =
      sortOrder !== undefined && sortOrder !== null
        ? sortOrder
        : await this.nextSortOrder(chapterId);

    const row = await runInTransaction(
      (callback) => this.db.withClient(callback),
      async (client) => {
        const result = await client.query<LessonRow>(
          `INSERT INTO lessons (chapter_id, title, description, sort_order, status)
             VALUES ($1, $2, $3, $4, 'draft')
             RETURNING ${LESSON_RETURNING}`,
          [chapterId, title.trim(), description.trim(), resolvedSortOrder],
        );
        await syncEnglishTranslation(client, LESSON_TRANSLATION_TABLE, result.rows[0].id);
        return result.rows[0];
      },
    );

    return toLessonSummary(row);
  }

  async updateLesson(id: string, input: UpdateLessonInput): Promise<LessonSummary> {
    const existing = await this.getLesson(id);

    if (existing.status !== 'draft') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Only draft lessons can be updated',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Lesson title cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }

    if (input.description !== undefined) {
      if (input.description.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Lesson description cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`description = $${idx++}`);
      values.push(input.description.trim());
    }

    if (input.sortOrder !== undefined) {
      if (input.sortOrder < 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'sortOrder must be non-negative',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`sort_order = $${idx++}`);
      values.push(input.sortOrder);
    }

    if (input.systemPrompt !== undefined) {
      setClauses.push(`system_prompt = $${idx++}`);
      values.push(input.systemPrompt);
    }

    if (input.teachingOutline !== undefined) {
      setClauses.push(`teaching_outline = $${idx++}`);
      values.push(input.teachingOutline === null ? null : JSON.stringify(input.teachingOutline));
    }

    if (setClauses.length === 0) {
      return existing;
    }

    values.push(id);

    const touchesEnglishText = input.title !== undefined || input.description !== undefined;

    const row = await runInTransaction(
      (callback) => this.db.withClient(callback),
      async (client) => {
        const result = await client.query<LessonRow>(
          `UPDATE lessons
             SET ${setClauses.join(', ')}
             WHERE id = $${idx}
             RETURNING ${LESSON_RETURNING}`,
          values,
        );
        if (touchesEnglishText) {
          await syncEnglishTranslation(client, LESSON_TRANSLATION_TABLE, id);
        }
        const available = await loadAvailableLocales(client, LESSON_TRANSLATION_TABLE, id);
        return { ...result.rows[0], available_locales: available };
      },
    );

    return toLessonSummary(row);
  }

  private async nextSortOrder(chapterId: string): Promise<number> {
    const result = await this.db.query<{ max_order: string | null }>(
      `SELECT MAX(sort_order)::text AS max_order FROM lessons WHERE chapter_id = $1`,
      [chapterId],
    );
    const current = parseInt(result.rows[0]?.max_order ?? '-1', 10);
    return isNaN(current) ? 0 : current + 1;
  }
}
