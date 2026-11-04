import { HttpStatus, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale, isSupportedLocale } from '../../../common/locale';
import {
  CourseTranslation,
  CourseTranslationRow,
  CourseTranslationsResponse,
  DeleteCourseTranslationResponse,
  UpsertCourseTranslationInput,
} from './course-translations.types';

const TITLE_MAX = 255;
const DESCRIPTION_MAX = 2000;

function toTranslation(row: CourseTranslationRow): CourseTranslation {
  return {
    locale: row.locale,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertSupportedLocale(locale: string): asserts locale is SupportedLocale {
  if (!isSupportedLocale(locale)) {
    throw new AppError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message: `Unsupported locale: ${locale}. Supported: ${SUPPORTED_LOCALES.join(', ')}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class CourseTranslationsService {
  constructor(private readonly db: DatabaseService) {}

  async listTranslations(courseId: string): Promise<CourseTranslationsResponse> {
    await this.assertCourseExists(courseId);

    const result = await this.db.query<CourseTranslationRow>(
      `SELECT locale, title, description, created_at, updated_at
         FROM course_translations
         WHERE course_id = $1
         ORDER BY locale`,
      [courseId],
    );

    const translations = result.rows.map(toTranslation);
    const present = new Set(translations.map((t) => t.locale));

    return {
      courseId,
      supportedLocales: [...SUPPORTED_LOCALES],
      missingLocales: SUPPORTED_LOCALES.filter((l) => !present.has(l)),
      translations,
    };
  }

  async upsertTranslation(
    courseId: string,
    locale: string,
    input: UpsertCourseTranslationInput,
  ): Promise<CourseTranslation> {
    assertSupportedLocale(locale);
    const title = this.validateTitle(input.title);
    const description = this.validateDescription(input.description);

    return this.inTransaction(async (client) => {
      const locked = await client.query<{ id: string }>(
        `SELECT id FROM courses WHERE id = $1 FOR UPDATE`,
        [courseId],
      );
      if (locked.rows.length === 0) {
        throw this.courseNotFound(courseId);
      }

      const saved = await client.query<CourseTranslationRow>(
        `INSERT INTO course_translations (course_id, locale, title, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (course_id, locale)
           DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
           RETURNING locale, title, description, created_at, updated_at`,
        [courseId, locale, title, description],
      );

      if (locale === DEFAULT_LOCALE) {
        await client.query(`UPDATE courses SET title = $2, description = $3 WHERE id = $1`, [
          courseId,
          title,
          description,
        ]);
      }

      return toTranslation(saved.rows[0]);
    });
  }

  async deleteTranslation(courseId: string, locale: string): Promise<DeleteCourseTranslationResponse> {
    assertSupportedLocale(locale);

    if (locale === DEFAULT_LOCALE) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: 'The English translation is the default and cannot be deleted',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.assertCourseExists(courseId);

    const result = await this.db.query(
      `DELETE FROM course_translations WHERE course_id = $1 AND locale = $2`,
      [courseId, locale],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `No ${locale} translation for course ${courseId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return { courseId, locale, deleted: true };
  }

  private validateTitle(raw: unknown): string {
    const title = typeof raw === 'string' ? raw.trim() : '';
    if (title.length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Translation title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (title.length > TITLE_MAX) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Translation title must be at most ${TITLE_MAX} characters`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return title;
  }

  private validateDescription(raw: unknown): string | null {
    if (raw === undefined || raw === null) {
      return null;
    }
    if (typeof raw !== 'string') {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Translation description must be a string',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const description = raw.trim();
    if (description.length > DESCRIPTION_MAX) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `Translation description must be at most ${DESCRIPTION_MAX} characters`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    return description.length === 0 ? null : description;
  }

  private async assertCourseExists(courseId: string): Promise<void> {
    const result = await this.db.query(`SELECT 1 FROM courses WHERE id = $1`, [courseId]);
    if (result.rows.length === 0) {
      throw this.courseNotFound(courseId);
    }
  }

  private courseNotFound(courseId: string): AppError {
    return new AppError({
      code: ApiErrorCode.NOT_FOUND,
      message: `Course not found: ${courseId}`,
      statusCode: HttpStatus.NOT_FOUND,
    });
  }

  private async inTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    return this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        const value = await work(client);
        await client.query('COMMIT');
        return value;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });
  }
}
