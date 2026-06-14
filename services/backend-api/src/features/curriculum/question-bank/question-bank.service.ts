import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  QUESTION_DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  CreateQuestionInput,
  QuestionBankDetail,
  QuestionBankListResponse,
  QuestionBankRow,
  QuestionBankSummary,
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
  UpdateQuestionInput,
} from './question-bank.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toSummary(row: QuestionBankRow): QuestionBankSummary {
  return {
    id: row.id,
    type: row.type,
    stem: row.stem,
    difficulty: row.difficulty,
    tags: row.tags,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDetail(row: QuestionBankRow): QuestionBankDetail {
  return {
    ...toSummary(row),
    richStem: row.rich_stem,
    explanation: row.explanation,
    hint: row.hint,
  };
}

function validateType(type: string): asserts type is QuestionType {
  if (!(QUESTION_TYPES as readonly string[]).includes(type)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid question type: ${type}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

function validateDifficulty(difficulty: string): asserts difficulty is QuestionDifficulty {
  if (!(QUESTION_DIFFICULTIES as readonly string[]).includes(difficulty)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid difficulty: ${difficulty}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

function validateStatus(status: string): asserts status is QuestionStatus {
  if (!(QUESTION_STATUSES as readonly string[]).includes(status)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid status: ${status}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class QuestionBankService {
  constructor(private readonly db: DatabaseService) {}

  async listQuestions(
    page: number,
    limit: number,
    type?: string,
    difficulty?: string,
    status?: string,
  ): Promise<QuestionBankListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (type !== undefined) validateType(type);
    if (difficulty !== undefined) validateDifficulty(difficulty);
    if (status !== undefined) validateStatus(status);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (type !== undefined) {
      conditions.push(`type = $${idx++}`);
      values.push(type);
    }
    if (difficulty !== undefined) {
      conditions.push(`difficulty = $${idx++}`);
      values.push(difficulty);
    }
    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM question_bank ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<QuestionBankRow>(
      `SELECT id, type, stem, difficulty, tags, status, created_by, created_at, updated_at,
              NULL::jsonb AS rich_stem, NULL::text AS explanation, NULL::text AS hint
         FROM question_bank
         ${where}
         ORDER BY created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      questions: dataResult.rows.map(toSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getQuestion(id: string): Promise<QuestionBankDetail> {
    const result = await this.db.query<QuestionBankRow>(
      `SELECT id, type, stem, rich_stem, difficulty, explanation, hint, tags,
              status, created_by, created_at, updated_at
         FROM question_bank
         WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toDetail(result.rows[0]);
  }

  async createQuestion(input: CreateQuestionInput): Promise<QuestionBankDetail> {
    validateType(input.type);
    validateDifficulty(input.difficulty);

    if (!input.stem || input.stem.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Question stem is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const result = await this.db.query<QuestionBankRow>(
      `INSERT INTO question_bank
         (type, stem, rich_stem, difficulty, explanation, hint, tags, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8)
         RETURNING id, type, stem, rich_stem, difficulty, explanation, hint, tags,
                   status, created_by, created_at, updated_at`,
      [
        input.type,
        input.stem.trim(),
        input.richStem ?? null,
        input.difficulty,
        input.explanation?.trim() ?? null,
        input.hint?.trim() ?? null,
        input.tags ?? [],
        input.createdBy,
      ],
    );

    return toDetail(result.rows[0]);
  }

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<QuestionBankDetail> {
    const existing = await this.getQuestion(id);

    if (existing.status !== 'draft') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Only draft questions can be updated',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (input.difficulty !== undefined) {
      validateDifficulty(input.difficulty);
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.stem !== undefined) {
      if (input.stem.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Question stem cannot be empty',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
      setClauses.push(`stem = $${idx++}`);
      values.push(input.stem.trim());
    }

    if (input.difficulty !== undefined) {
      setClauses.push(`difficulty = $${idx++}`);
      values.push(input.difficulty);
    }

    if ('richStem' in input) {
      setClauses.push(`rich_stem = $${idx++}`);
      values.push(input.richStem ?? null);
    }

    if ('explanation' in input) {
      setClauses.push(`explanation = $${idx++}`);
      values.push(input.explanation?.trim() ?? null);
    }

    if ('hint' in input) {
      setClauses.push(`hint = $${idx++}`);
      values.push(input.hint?.trim() ?? null);
    }

    if (input.tags !== undefined) {
      setClauses.push(`tags = $${idx++}`);
      values.push(input.tags);
    }

    if (setClauses.length === 0) {
      return existing;
    }

    values.push(id);

    const result = await this.db.query<QuestionBankRow>(
      `UPDATE question_bank
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, type, stem, rich_stem, difficulty, explanation, hint, tags,
                   status, created_by, created_at, updated_at`,
      values,
    );

    return toDetail(result.rows[0]);
  }
}
