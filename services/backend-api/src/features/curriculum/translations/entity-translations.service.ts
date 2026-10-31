import { HttpStatus } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, SupportedLocale, isSupportedLocale } from '../../../common/locale';

export interface EntityTranslationsConfig {
  readonly label: string;
  readonly entityTable: string;
  readonly translationTable: string;
  readonly foreignKey: string;
  readonly idKey: string;
  readonly requireEnglishDescription: boolean;
}

export interface EntityTranslation {
  locale: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEntityTranslationInput {
  title: string;
  description?: string | null;
}

export interface DeleteEntityTranslationResponse {
  [key: string]: string | boolean;
}

interface TranslationRow {
  locale: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const TITLE_MAX = 255;
const DESCRIPTION_MAX = 2000;

function toTranslation(row: TranslationRow): EntityTranslation {
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

export class EntityTranslationsService {
  constructor(
    protected readonly db: DatabaseService,
    private readonly config: EntityTranslationsConfig,
  ) {}

  async listTranslations(id: string): Promise<Record<string, unknown>> {
    await this.assertExists(id);

    const result = await this.db.query<TranslationRow>(
      `SELECT locale, title, description, created_at, updated_at
         FROM ${this.config.translationTable}
         WHERE ${this.config.foreignKey} = $1
         ORDER BY locale`,
      [id],
    );

    const translations = result.rows.map(toTranslation);
    const present = new Set(translations.map((t) => t.locale));

    return {
      [this.config.idKey]: id,
      supportedLocales: [...SUPPORTED_LOCALES],
      missingLocales: SUPPORTED_LOCALES.filter((l) => !present.has(l)),
      translations,
    };
  }

  async upsertTranslation(
    id: string,
    locale: string,
    input: UpsertEntityTranslationInput,
  ): Promise<EntityTranslation> {
    assertSupportedLocale(locale);
    const title = this.validateTitle(input.title);
    const description = this.validateDescription(input.description);

    if (locale === DEFAULT_LOCALE && this.config.requireEnglishDescription && description === null) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: `English ${this.config.label.toLowerCase()} description is required`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return this.inTransaction(async (client) => {
      const locked = await client.query<{ status: string }>(
        `SELECT status FROM ${this.config.entityTable} WHERE id = $1 FOR UPDATE`,
        [id],
      );
      if (locked.rows.length === 0) {
        throw this.notFound(id);
      }

      if (locale === DEFAULT_LOCALE && locked.rows[0].status !== 'draft') {
        throw new AppError({
          code: ApiErrorCode.FORBIDDEN,
          message: `Only draft ${this.config.label.toLowerCase()}s can have their English text updated`,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }

      const saved = await client.query<TranslationRow>(
        `INSERT INTO ${this.config.translationTable} (${this.config.foreignKey}, locale, title, description)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (${this.config.foreignKey}, locale)
           DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
           RETURNING locale, title, description, created_at, updated_at`,
        [id, locale, title, description],
      );

      if (locale === DEFAULT_LOCALE) {
        await client.query(`UPDATE ${this.config.entityTable} SET title = $2, description = $3 WHERE id = $1`, [
          id,
          title,
          description,
        ]);
      }

      return toTranslation(saved.rows[0]);
    });
  }

  async deleteTranslation(id: string, locale: string): Promise<DeleteEntityTranslationResponse> {
    assertSupportedLocale(locale);

    if (locale === DEFAULT_LOCALE) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: 'The English translation is the default and cannot be deleted',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.assertExists(id);

    const result = await this.db.query(
      `DELETE FROM ${this.config.translationTable} WHERE ${this.config.foreignKey} = $1 AND locale = $2`,
      [id, locale],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `No ${locale} translation for ${this.config.label.toLowerCase()} ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return { [this.config.idKey]: id, locale, deleted: true };
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

  private async assertExists(id: string): Promise<void> {
    const result = await this.db.query(`SELECT 1 FROM ${this.config.entityTable} WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw this.notFound(id);
    }
  }

  private notFound(id: string): AppError {
    return new AppError({
      code: ApiErrorCode.NOT_FOUND,
      message: `${this.config.label} not found: ${id}`,
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
