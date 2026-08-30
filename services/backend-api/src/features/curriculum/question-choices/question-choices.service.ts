import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  CreateQuestionChoiceRequest,
  UpdateQuestionChoiceRequest,
  validateCreateQuestionChoiceRequest,
  validateUpdateQuestionChoiceRequest,
} from '../dto/question.dto';
import { CurriculumErrorCode } from '../validation/curriculum-error-code';
import { CurriculumValidationError } from '../validation/curriculum-validation.error';
import { isUuidArray } from '../validation/validation-helpers';
import {
  QuestionChoice,
  QuestionChoiceListResponse,
  QuestionChoiceRow,
} from './question-choices.types';

interface QuestionForMutation {
  id: string;
  status: string;
}

function toChoice(row: QuestionChoiceRow): QuestionChoice {
  return {
    id: row.id,
    questionId: row.question_id,
    text: row.text,
    richText: row.rich_text,
    isCorrect: row.is_correct,
    order: row.sort_order,
    explanation: row.explanation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the safe-client-error shape produced by the shared question DTO
// validators (services/backend-api/src/features/curriculum/dto/question.dto.ts)
// onto this feature's existing AppError/ApiErrorCode HTTP-error convention —
// the GlobalExceptionFilter does not special-case CurriculumValidationError.
function toAppError(error: CurriculumValidationError): AppError {
  return new AppError({
    code: statusCodeApiErrorCode(error.code),
    message: error.message,
    statusCode: statusCodeForCurriculumError(error.code),
    details: error.details,
  });
}

function statusCodeForCurriculumError(code: CurriculumErrorCode): number {
  switch (code) {
    case CurriculumErrorCode.QUESTION_NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case CurriculumErrorCode.QUESTION_CHOICE_ORDER_CONFLICT:
    case CurriculumErrorCode.QUESTION_CHOICE_CONFLICT:
      return HttpStatus.CONFLICT;
    default:
      return HttpStatus.BAD_REQUEST;
  }
}

function statusCodeApiErrorCode(code: CurriculumErrorCode): ApiErrorCode {
  switch (statusCodeForCurriculumError(code)) {
    case HttpStatus.NOT_FOUND:
      return ApiErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ApiErrorCode.CONFLICT;
    default:
      return ApiErrorCode.VALIDATION_ERROR;
  }
}

@Injectable()
export class QuestionChoicesService {
  constructor(private readonly db: DatabaseService) {}

  async listChoices(questionId: string): Promise<QuestionChoiceListResponse> {
    await this.assertQuestionExists(questionId);

    const result = await this.db.query<QuestionChoiceRow>(
      `SELECT id, question_id, text, rich_text, is_correct, sort_order, explanation, created_at, updated_at
         FROM question_choices
         WHERE question_id = $1
         ORDER BY sort_order ASC, created_at ASC`,
      [questionId],
    );

    return { choices: result.rows.map(toChoice), total: result.rows.length };
  }

  async createChoice(questionId: string, body: Record<string, unknown>): Promise<QuestionChoice> {
    await this.assertQuestionEditable(questionId);

    let input: CreateQuestionChoiceRequest;
    try {
      input = validateCreateQuestionChoiceRequest({ ...body, questionId });
    } catch (error) {
      if (error instanceof CurriculumValidationError) throw toAppError(error);
      throw error;
    }

    await this.assertOrderAvailable(questionId, input.order);

    const result = await this.db.query<QuestionChoiceRow>(
      `INSERT INTO question_choices (question_id, text, rich_text, is_correct, sort_order, explanation)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, question_id, text, rich_text, is_correct, sort_order, explanation, created_at, updated_at`,
      [
        questionId,
        input.text,
        input.richText ?? null,
        input.isCorrect,
        input.order,
        input.explanation?.trim() ?? null,
      ],
    );

    return toChoice(result.rows[0]);
  }

  async updateChoice(
    questionId: string,
    choiceId: string,
    body: Record<string, unknown>,
  ): Promise<QuestionChoice> {
    await this.assertQuestionEditable(questionId);
    const existing = await this.getChoiceRowOrThrow(questionId, choiceId);

    let input: UpdateQuestionChoiceRequest;
    try {
      input = validateUpdateQuestionChoiceRequest(body);
    } catch (error) {
      if (error instanceof CurriculumValidationError) throw toAppError(error);
      throw error;
    }

    if (input.order !== undefined && input.order !== existing.sort_order) {
      await this.assertOrderAvailable(questionId, input.order, choiceId);
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.text !== undefined) {
      setClauses.push(`text = $${idx++}`);
      values.push(input.text);
    }
    if ('richText' in input) {
      setClauses.push(`rich_text = $${idx++}`);
      values.push(input.richText ?? null);
    }
    if (input.isCorrect !== undefined) {
      setClauses.push(`is_correct = $${idx++}`);
      values.push(input.isCorrect);
    }
    if (input.order !== undefined) {
      setClauses.push(`sort_order = $${idx++}`);
      values.push(input.order);
    }
    if ('explanation' in input) {
      setClauses.push(`explanation = $${idx++}`);
      values.push(input.explanation?.trim() ?? null);
    }

    if (setClauses.length === 0) {
      return toChoice(existing);
    }

    values.push(questionId, choiceId);

    const result = await this.db.query<QuestionChoiceRow>(
      `UPDATE question_choices
         SET ${setClauses.join(', ')}
         WHERE question_id = $${idx++} AND id = $${idx}
         RETURNING id, question_id, text, rich_text, is_correct, sort_order, explanation, created_at, updated_at`,
      values,
    );

    return toChoice(result.rows[0]);
  }

  async deleteChoice(questionId: string, choiceId: string): Promise<void> {
    await this.assertQuestionEditable(questionId);

    const result = await this.db.query<{ id: string }>(
      `DELETE FROM question_choices WHERE question_id = $1 AND id = $2 RETURNING id`,
      [questionId, choiceId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Choice not found: ${choiceId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  /**
   * Reassigns sort_order for every choice on a question in one transaction,
   * based on the order of `orderedChoiceIds`. The set of ids must exactly
   * match the question's existing choices (no partial reorders, no
   * creating/deleting choices through this endpoint).
   */
  async reorderChoices(
    questionId: string,
    orderedChoiceIds: unknown,
  ): Promise<QuestionChoiceListResponse> {
    await this.assertQuestionEditable(questionId);

    if (!isUuidArray(orderedChoiceIds) || orderedChoiceIds.length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'orderedChoiceIds must be a non-empty array of choice ids',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM question_choices WHERE question_id = $1`,
      [questionId],
    );
    const existingIds = new Set(existing.rows.map((r) => r.id));
    const incomingIds = new Set(orderedChoiceIds);

    if (
      existingIds.size !== incomingIds.size ||
      [...existingIds].some((id) => !incomingIds.has(id))
    ) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'orderedChoiceIds must contain exactly the question\'s existing choice ids',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        // Two-pass update avoids transient unique-order collisions if a
        // unique constraint is ever added on (question_id, sort_order).
        for (let i = 0; i < orderedChoiceIds.length; i++) {
          await client.query(
            `UPDATE question_choices SET sort_order = $1 WHERE question_id = $2 AND id = $3`,
            [-(i + 1), questionId, orderedChoiceIds[i]],
          );
        }
        for (let i = 0; i < orderedChoiceIds.length; i++) {
          await client.query(
            `UPDATE question_choices SET sort_order = $1 WHERE question_id = $2 AND id = $3`,
            [i + 1, questionId, orderedChoiceIds[i]],
          );
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });

    return this.listChoices(questionId);
  }

  private async assertOrderAvailable(
    questionId: string,
    order: number,
    excludeChoiceId?: string,
  ): Promise<void> {
    const conflict = await this.db.query<{ id: string }>(
      excludeChoiceId
        ? `SELECT id FROM question_choices WHERE question_id = $1 AND sort_order = $2 AND id != $3 LIMIT 1`
        : `SELECT id FROM question_choices WHERE question_id = $1 AND sort_order = $2 LIMIT 1`,
      excludeChoiceId ? [questionId, order, excludeChoiceId] : [questionId, order],
    );

    if (conflict.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Choice order ${order} is already in use for this question`,
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }

  private async getChoiceRowOrThrow(
    questionId: string,
    choiceId: string,
  ): Promise<QuestionChoiceRow> {
    const result = await this.db.query<QuestionChoiceRow>(
      `SELECT id, question_id, text, rich_text, is_correct, sort_order, explanation, created_at, updated_at
         FROM question_choices
         WHERE question_id = $1 AND id = $2`,
      [questionId, choiceId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Choice not found: ${choiceId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  private async assertQuestionExists(questionId: string): Promise<QuestionForMutation> {
    const result = await this.db.query<QuestionForMutation>(
      `SELECT id, status FROM question_bank WHERE id = $1`,
      [questionId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  // Choices may only be authored while the parent question is in draft
  // status — mirrors QuestionBankService#updateQuestion, which enforces the
  // same rule for the question's own fields.
  private async assertQuestionEditable(questionId: string): Promise<QuestionForMutation> {
    const question = await this.assertQuestionExists(questionId);

    if (question.status !== 'draft') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Choices can only be modified while the question is in draft status',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    return question;
  }
}
