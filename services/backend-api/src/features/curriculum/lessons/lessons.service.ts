import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
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
export class LessonsService {
  constructor(private readonly db: DatabaseService) {}

  async listLessons(
    page: number,
    limit: number,
    chapterId?: string,
    status?: string,
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
      conditions.push(`chapter_id = $${idx++}`);
      values.push(chapterId);
    }

    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM lessons ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<LessonRow>(
      `SELECT id, chapter_id, title, description, sort_order, status, created_at, updated_at
         FROM lessons
         ${where}
         ORDER BY sort_order ASC, created_at ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      lessons: dataResult.rows.map(toLessonSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getLesson(id: string): Promise<LessonSummary> {
    const result = await this.db.query<LessonRow>(
      `SELECT id, chapter_id, title, description, sort_order, status, created_at, updated_at
         FROM lessons
         WHERE id = $1`,
      [id],
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

    const result = await this.db.query<LessonRow>(
      `INSERT INTO lessons (chapter_id, title, description, sort_order, status)
         VALUES ($1, $2, $3, $4, 'draft')
         RETURNING id, chapter_id, title, description, sort_order, status, created_at, updated_at`,
      [chapterId, title.trim(), description.trim(), resolvedSortOrder],
    );

    return toLessonSummary(result.rows[0]);
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

    if (setClauses.length === 0) {
      return existing;
    }

    values.push(id);

    const result = await this.db.query<LessonRow>(
      `UPDATE lessons
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, chapter_id, title, description, sort_order, status, created_at, updated_at`,
      values,
    );

    return toLessonSummary(result.rows[0]);
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
