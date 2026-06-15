import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus } from '../courses/courses.types';
import {
  CreateLevelInput,
  LevelListResponse,
  LevelRow,
  LevelSummary,
  UpdateLevelInput,
} from './levels.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toLevelSummary(row: LevelRow): LevelSummary {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    code: row.code,
    slug: row.slug,
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
export class LevelsService {
  constructor(private readonly db: DatabaseService) {}

  async listLevels(
    courseId: string,
    page: number,
    limit: number,
    status?: string,
    q?: string,
  ): Promise<LevelListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) {
      validateStatus(status);
    }

    const conditions: string[] = ['course_id = $1'];
    const values: unknown[] = [courseId];
    let idx = 2;

    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const search = q?.trim();
    if (search) {
      conditions.push(
        `(title ILIKE $${idx} OR COALESCE(code, '') ILIKE $${idx} OR COALESCE(slug, '') ILIKE $${idx} OR COALESCE(description, '') ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM levels ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<LevelRow>(
      `SELECT id, course_id, title, code, slug, description, sort_order, status, created_at, updated_at
         FROM levels
         ${where}
         ORDER BY sort_order ASC, created_at ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      levels: dataResult.rows.map(toLevelSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getLevel(id: string): Promise<LevelSummary> {
    const result = await this.db.query<LevelRow>(
      `SELECT id, course_id, title, code, slug, description, sort_order, status, created_at, updated_at
         FROM levels
         WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Level not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toLevelSummary(result.rows[0]);
  }

  async createLevel(input: CreateLevelInput): Promise<LevelSummary> {
    const { courseId, title, code, slug, description, sortOrder } = input;

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Level title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const courseExists = await this.db.query<{ id: string }>(
      `SELECT id FROM courses WHERE id = $1 LIMIT 1`,
      [courseId],
    );
    if (courseExists.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Parent course not found: ${courseId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (slug !== undefined && slug !== null) {
      const existing = await this.db.query<{ id: string }>(
        `SELECT id FROM levels WHERE course_id = $1 AND slug = $2 LIMIT 1`,
        [courseId, slug],
      );
      if (existing.rows.length > 0) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: `Slug already in use within this course: ${slug}`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const resolvedSortOrder =
      sortOrder !== undefined && sortOrder !== null
        ? sortOrder
        : await this.nextSortOrder(courseId);

    const result = await this.db.query<LevelRow>(
      `INSERT INTO levels (course_id, title, code, slug, description, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft')
         RETURNING id, course_id, title, code, slug, description, sort_order, status, created_at, updated_at`,
      [
        courseId,
        title.trim(),
        code?.trim() ?? null,
        slug ?? null,
        description?.trim() ?? null,
        resolvedSortOrder,
      ],
    );

    return toLevelSummary(result.rows[0]);
  }

  async updateLevel(id: string, input: UpdateLevelInput): Promise<LevelSummary> {
    const existing = await this.getLevel(id);

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Level title cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }

    if ('code' in input) {
      setClauses.push(`code = $${idx++}`);
      values.push(input.code?.trim() ?? null);
    }

    if ('slug' in input) {
      if (input.slug !== undefined && input.slug !== null) {
        const conflict = await this.db.query<{ id: string }>(
          `SELECT id FROM levels WHERE course_id = $1 AND slug = $2 AND id != $3 LIMIT 1`,
          [existing.courseId, input.slug, id],
        );
        if (conflict.rows.length > 0) {
          throw new AppError({
            code: ApiErrorCode.CONFLICT,
            message: `Slug already in use within this course: ${input.slug}`,
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

    const result = await this.db.query<LevelRow>(
      `UPDATE levels
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, course_id, title, code, slug, description, sort_order, status, created_at, updated_at`,
      values,
    );

    return toLevelSummary(result.rows[0]);
  }

  private async nextSortOrder(courseId: string): Promise<number> {
    const result = await this.db.query<{ max_order: string | null }>(
      `SELECT MAX(sort_order)::text AS max_order FROM levels WHERE course_id = $1`,
      [courseId],
    );
    const current = parseInt(result.rows[0]?.max_order ?? '-1', 10);
    return isNaN(current) ? 0 : current + 1;
  }
}
