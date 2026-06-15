import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  CURRICULUM_CONTENT_STATUSES,
  ChapterListResponse,
  ChapterRow,
  ChapterSummary,
  CreateChapterInput,
  CurriculumContentStatus,
  UpdateChapterInput,
} from './chapters.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toChapterSummary(row: ChapterRow): ChapterSummary {
  return {
    id: row.id,
    levelId: row.level_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
export class ChaptersService {
  constructor(private readonly db: DatabaseService) {}

  async listChapters(
    page: number,
    limit: number,
    levelId?: string,
    status?: string,
    q?: string,
  ): Promise<ChapterListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) {
      validateStatus(status);
    }

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (levelId !== undefined) {
      conditions.push(`level_id = $${idx++}`);
      values.push(levelId);
    }

    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const search = q?.trim();
    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR COALESCE(slug, '') ILIKE $${idx} OR COALESCE(description, '') ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM chapters ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<ChapterRow>(
      `SELECT id, level_id, title, slug, description, sort_order, status, created_at, updated_at
         FROM chapters
         ${where}
         ORDER BY sort_order ASC, created_at ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      chapters: dataResult.rows.map(toChapterSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getChapter(id: string): Promise<ChapterSummary> {
    const result = await this.db.query<ChapterRow>(
      `SELECT id, level_id, title, slug, description, sort_order, status, created_at, updated_at
         FROM chapters
         WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Chapter not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toChapterSummary(result.rows[0]);
  }

  async createChapter(input: CreateChapterInput): Promise<ChapterSummary> {
    const { levelId, title, slug, description, sortOrder } = input;

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Chapter title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Verify parent level exists
    const levelCheck = await this.db.query<{ id: string }>(
      `SELECT id FROM levels WHERE id = $1 LIMIT 1`,
      [levelId],
    );
    if (levelCheck.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Level not found: ${levelId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (slug !== undefined && slug !== null) {
      const existing = await this.db.query<{ id: string }>(
        `SELECT id FROM chapters WHERE level_id = $1 AND slug = $2 LIMIT 1`,
        [levelId, slug],
      );
      if (existing.rows.length > 0) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: `Slug already in use within this level: ${slug}`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const resolvedSortOrder =
      sortOrder !== undefined && sortOrder !== null
        ? sortOrder
        : await this.nextSortOrder(levelId);

    const result = await this.db.query<ChapterRow>(
      `INSERT INTO chapters (level_id, title, slug, description, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')
         RETURNING id, level_id, title, slug, description, sort_order, status, created_at, updated_at`,
      [levelId, title.trim(), slug ?? null, description?.trim() ?? null, resolvedSortOrder],
    );

    return toChapterSummary(result.rows[0]);
  }

  async updateChapter(id: string, input: UpdateChapterInput): Promise<ChapterSummary> {
    const existing = await this.getChapter(id);

    if (existing.status !== 'draft') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Only draft chapters can be updated',
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
          message: 'Chapter title cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }

    if ('slug' in input) {
      if (input.slug !== undefined && input.slug !== null) {
        const conflict = await this.db.query<{ id: string }>(
          `SELECT id FROM chapters WHERE level_id = $1 AND slug = $2 AND id != $3 LIMIT 1`,
          [existing.levelId, input.slug, id],
        );
        if (conflict.rows.length > 0) {
          throw new AppError({
            code: ApiErrorCode.CONFLICT,
            message: `Slug already in use within this level: ${input.slug}`,
            statusCode: HttpStatus.CONFLICT,
          });
        }
      }
      setClauses.push(`slug = $${idx++}`);
      values.push(input.slug ?? null);
    }

    if ('description' in input) {
      setClauses.push(`description = $${idx++}`);
      values.push(input.description?.trim() ?? null);
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

    if (setClauses.length === 0) {
      return existing;
    }

    values.push(id);

    const result = await this.db.query<ChapterRow>(
      `UPDATE chapters
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, level_id, title, slug, description, sort_order, status, created_at, updated_at`,
      values,
    );

    return toChapterSummary(result.rows[0]);
  }

  private async nextSortOrder(levelId: string): Promise<number> {
    const result = await this.db.query<{ max_order: string | null }>(
      `SELECT MAX(sort_order)::text AS max_order FROM chapters WHERE level_id = $1`,
      [levelId],
    );
    const current = parseInt(result.rows[0]?.max_order ?? '-1', 10);
    return isNaN(current) ? 0 : current + 1;
  }
}
