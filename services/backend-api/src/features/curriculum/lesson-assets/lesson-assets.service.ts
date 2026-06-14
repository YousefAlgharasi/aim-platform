import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  LESSON_ASSET_STATUSES,
  LESSON_ASSET_TYPES,
  LessonAssetListResponse,
  LessonAssetRow,
  LessonAssetStatus,
  LessonAssetSummary,
  LessonAssetType,
  CreateLessonAssetInput,
  UpdateLessonAssetInput,
} from './lesson-assets.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toLessonAssetSummary(row: LessonAssetRow): LessonAssetSummary {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    type: row.type,
    title: row.title,
    description: row.description,
    url: row.url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes !== null ? parseInt(row.size_bytes, 10) : null,
    durationSeconds: row.duration_seconds,
    altText: row.alt_text,
    thumbnailUrl: row.thumbnail_url,
    order: row.order,
    status: row.status,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateType(type: string): asserts type is LessonAssetType {
  if (!(LESSON_ASSET_TYPES as readonly string[]).includes(type)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid asset type: ${type}. Allowed: ${LESSON_ASSET_TYPES.join(', ')}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

function validateStatus(status: string): asserts status is LessonAssetStatus {
  if (!(LESSON_ASSET_STATUSES as readonly string[]).includes(status)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid status: ${status}. Allowed: ${LESSON_ASSET_STATUSES.join(', ')}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class LessonAssetsService {
  constructor(private readonly db: DatabaseService) {}

  async listAssets(
    page: number,
    limit: number,
    lessonId?: string,
    status?: string,
  ): Promise<LessonAssetListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) validateStatus(status);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (lessonId !== undefined) {
      conditions.push(`lesson_id = $${idx++}`);
      values.push(lessonId);
    }
    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM lesson_assets ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<LessonAssetRow>(
      `SELECT id, lesson_id, type, title, description, url, mime_type, size_bytes,
              duration_seconds, alt_text, thumbnail_url, "order", status, metadata,
              created_at, updated_at
         FROM lesson_assets
         ${where}
         ORDER BY "order" ASC, created_at ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      assets: dataResult.rows.map(toLessonAssetSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getAsset(id: string): Promise<LessonAssetSummary> {
    const result = await this.db.query<LessonAssetRow>(
      `SELECT id, lesson_id, type, title, description, url, mime_type, size_bytes,
              duration_seconds, alt_text, thumbnail_url, "order", status, metadata,
              created_at, updated_at
         FROM lesson_assets WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson asset not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toLessonAssetSummary(result.rows[0]);
  }

  async createAsset(input: CreateLessonAssetInput): Promise<LessonAssetSummary> {
    const {
      lessonId, type, title, description, url, mimeType,
      sizeBytes, durationSeconds, altText, thumbnailUrl, order, metadata,
    } = input;

    validateType(type);

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Asset title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (order < 1) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'order must be a positive integer (>= 1)',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Verify parent lesson exists
    const lessonCheck = await this.db.query<{ id: string }>(
      `SELECT id FROM lessons WHERE id = $1 LIMIT 1`,
      [lessonId],
    );
    if (lessonCheck.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson not found: ${lessonId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Check order uniqueness within lesson
    const orderConflict = await this.db.query<{ id: string }>(
      `SELECT id FROM lesson_assets WHERE lesson_id = $1 AND "order" = $2 LIMIT 1`,
      [lessonId, order],
    );
    if (orderConflict.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Order ${order} is already in use for this lesson`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<LessonAssetRow>(
      `INSERT INTO lesson_assets
         (lesson_id, type, title, description, url, mime_type, size_bytes,
          duration_seconds, alt_text, thumbnail_url, "order", status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft', $12)
         RETURNING id, lesson_id, type, title, description, url, mime_type, size_bytes,
                   duration_seconds, alt_text, thumbnail_url, "order", status, metadata,
                   created_at, updated_at`,
      [
        lessonId, type, title.trim(), description?.trim() ?? null, url ?? null,
        mimeType ?? null, sizeBytes ?? null, durationSeconds ?? null,
        altText ?? null, thumbnailUrl ?? null, order,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );

    return toLessonAssetSummary(result.rows[0]);
  }

  async updateAsset(id: string, input: UpdateLessonAssetInput): Promise<LessonAssetSummary> {
    const existing = await this.getAsset(id);

    if (existing.status !== 'draft') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Only draft assets can be updated',
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
          message: 'Asset title cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`title = $${idx++}`);
      values.push(input.title.trim());
    }

    if ('description' in input) {
      setClauses.push(`description = $${idx++}`);
      values.push(input.description?.trim() ?? null);
    }

    if ('url' in input) {
      setClauses.push(`url = $${idx++}`);
      values.push(input.url ?? null);
    }

    if ('mimeType' in input) {
      setClauses.push(`mime_type = $${idx++}`);
      values.push(input.mimeType ?? null);
    }

    if ('sizeBytes' in input) {
      setClauses.push(`size_bytes = $${idx++}`);
      values.push(input.sizeBytes ?? null);
    }

    if ('durationSeconds' in input) {
      setClauses.push(`duration_seconds = $${idx++}`);
      values.push(input.durationSeconds ?? null);
    }

    if ('altText' in input) {
      setClauses.push(`alt_text = $${idx++}`);
      values.push(input.altText ?? null);
    }

    if ('thumbnailUrl' in input) {
      setClauses.push(`thumbnail_url = $${idx++}`);
      values.push(input.thumbnailUrl ?? null);
    }

    if (input.order !== undefined) {
      if (input.order < 1) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'order must be a positive integer (>= 1)',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      // Check order uniqueness (excluding self)
      const conflict = await this.db.query<{ id: string }>(
        `SELECT id FROM lesson_assets WHERE lesson_id = $1 AND "order" = $2 AND id != $3 LIMIT 1`,
        [existing.lessonId, input.order, id],
      );
      if (conflict.rows.length > 0) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: `Order ${input.order} is already in use for this lesson`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
      setClauses.push(`"order" = $${idx++}`);
      values.push(input.order);
    }

    if ('metadata' in input) {
      setClauses.push(`metadata = $${idx++}`);
      values.push(input.metadata ? JSON.stringify(input.metadata) : null);
    }

    if (setClauses.length === 0) {
      return existing;
    }

    values.push(id);

    const result = await this.db.query<LessonAssetRow>(
      `UPDATE lesson_assets
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, lesson_id, type, title, description, url, mime_type, size_bytes,
                   duration_seconds, alt_text, thumbnail_url, "order", status, metadata,
                   created_at, updated_at`,
      values,
    );

    return toLessonAssetSummary(result.rows[0]);
  }

  async archiveAsset(id: string): Promise<LessonAssetSummary> {
    const existing = await this.getAsset(id);

    if (existing.status === 'archived') {
      return existing;
    }

    const result = await this.db.query<LessonAssetRow>(
      `UPDATE lesson_assets
         SET status = 'archived'
         WHERE id = $1
         RETURNING id, lesson_id, type, title, description, url, mime_type, size_bytes,
                   duration_seconds, alt_text, thumbnail_url, "order", status, metadata,
                   created_at, updated_at`,
      [id],
    );

    return toLessonAssetSummary(result.rows[0]);
  }
}
