import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  CURRICULUM_CONTENT_STATUSES,
  CourseSummary,
  CourseListResponse,
  CourseRow,
  CreateCourseInput,
  CurriculumContentStatus,
  UpdateCourseInput,
} from './courses.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toCourseSummary(row: CourseRow): CourseSummary {
  return {
    id: row.id,
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
export class CoursesService {
  constructor(private readonly db: DatabaseService) {}

  async listCourses(
    page: number,
    limit: number,
    status?: string,
  ): Promise<CourseListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) {
      validateStatus(status);
    }

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM courses ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<CourseRow>(
      `SELECT id, title, slug, description, sort_order, status, created_at, updated_at
         FROM courses
         ${where}
         ORDER BY sort_order ASC, created_at ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      courses: dataResult.rows.map(toCourseSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getCourse(id: string): Promise<CourseSummary> {
    const result = await this.db.query<CourseRow>(
      `SELECT id, title, slug, description, sort_order, status, created_at, updated_at
         FROM courses
         WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Course not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toCourseSummary(result.rows[0]);
  }

  async createCourse(input: CreateCourseInput): Promise<CourseSummary> {
    const { title, slug, description, sortOrder } = input;

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Course title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (slug !== undefined && slug !== null) {
      const existing = await this.db.query<{ id: string }>(
        `SELECT id FROM courses WHERE slug = $1 LIMIT 1`,
        [slug],
      );
      if (existing.rows.length > 0) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: `Slug already in use: ${slug}`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    const resolvedSortOrder =
      sortOrder !== undefined && sortOrder !== null
        ? sortOrder
        : await this.nextSortOrder();

    const result = await this.db.query<CourseRow>(
      `INSERT INTO courses (title, slug, description, sort_order, status)
         VALUES ($1, $2, $3, $4, 'draft')
         RETURNING id, title, slug, description, sort_order, status, created_at, updated_at`,
      [title.trim(), slug ?? null, description?.trim() ?? null, resolvedSortOrder],
    );

    return toCourseSummary(result.rows[0]);
  }

  async updateCourse(id: string, input: UpdateCourseInput): Promise<CourseSummary> {
    await this.getCourse(id);

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Course title cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }

    if ('slug' in input) {
      if (input.slug !== undefined && input.slug !== null) {
        const existing = await this.db.query<{ id: string }>(
          `SELECT id FROM courses WHERE slug = $1 AND id != $2 LIMIT 1`,
          [input.slug, id],
        );
        if (existing.rows.length > 0) {
          throw new AppError({
            code: ApiErrorCode.CONFLICT,
            message: `Slug already in use: ${input.slug}`,
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
      return this.getCourse(id);
    }

    values.push(id);

    const result = await this.db.query<CourseRow>(
      `UPDATE courses
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, title, slug, description, sort_order, status, created_at, updated_at`,
      values,
    );

    return toCourseSummary(result.rows[0]);
  }

  private async nextSortOrder(): Promise<number> {
    const result = await this.db.query<{ max_order: string | null }>(
      `SELECT MAX(sort_order)::text AS max_order FROM courses`,
    );
    const current = parseInt(result.rows[0]?.max_order ?? '-1', 10);
    return isNaN(current) ? 0 : current + 1;
  }
}
