import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  AddSkillToQuestionInput,
  QuestionSkillLink,
  QuestionSkillListResponse,
  QuestionSkillRow,
} from './question-skills.types';

function toQuestionSkillLink(row: QuestionSkillRow): QuestionSkillLink {
  return {
    questionId: row.question_id,
    skillId: row.skill_id,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

@Injectable()
export class QuestionSkillsService {
  constructor(private readonly db: DatabaseService) {}

  async listSkillsForQuestion(questionId: string): Promise<QuestionSkillListResponse> {
    await this.assertQuestionExists(questionId);

    const result = await this.db.query<QuestionSkillRow>(
      `SELECT question_id, skill_id, is_primary, created_at
         FROM question_skills
         WHERE question_id = $1
         ORDER BY is_primary DESC, created_at ASC`,
      [questionId],
    );

    return {
      links: result.rows.map(toQuestionSkillLink),
      total: result.rows.length,
    };
  }

  /**
   * Links a skill to a question. If `isPrimary` is true, any existing
   * primary mapping for this question is unset first (P3-014 Section 7.2:
   * exactly one mapping per question may have is_primary = true).
   */
  async addSkillToQuestion(
    questionId: string,
    input: AddSkillToQuestionInput,
  ): Promise<QuestionSkillLink> {
    const { skillId, isPrimary = false } = input;

    await this.assertQuestionExists(questionId);
    await this.assertSkillExists(skillId);

    const existing = await this.db.query<{ question_id: string }>(
      `SELECT question_id FROM question_skills WHERE question_id = $1 AND skill_id = $2 LIMIT 1`,
      [questionId, skillId],
    );
    if (existing.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Skill ${skillId} is already linked to question ${questionId}`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const row = await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        if (isPrimary) {
          await client.query(
            `UPDATE question_skills SET is_primary = false WHERE question_id = $1 AND is_primary = true`,
            [questionId],
          );
        }

        const result = await client.query<QuestionSkillRow>(
          `INSERT INTO question_skills (question_id, skill_id, is_primary)
             VALUES ($1, $2, $3)
             RETURNING question_id, skill_id, is_primary, created_at`,
          [questionId, skillId, isPrimary],
        );

        await client.query('COMMIT');
        return result.rows[0] ?? null;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });

    return toQuestionSkillLink(row);
  }

  /**
   * Sets `skillId` as the primary skill for `questionId`, unsetting any
   * previously-primary mapping. The skill must already be linked to the
   * question (use addSkillToQuestion first).
   */
  async setPrimarySkill(questionId: string, skillId: string): Promise<QuestionSkillLink> {
    await this.assertQuestionExists(questionId);

    const link = await this.db.query<{ question_id: string }>(
      `SELECT question_id FROM question_skills WHERE question_id = $1 AND skill_id = $2 LIMIT 1`,
      [questionId, skillId],
    );
    if (link.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill ${skillId} is not linked to question ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const row = await this.db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        await client.query(
          `UPDATE question_skills SET is_primary = false WHERE question_id = $1 AND is_primary = true`,
          [questionId],
        );

        const result = await client.query<QuestionSkillRow>(
          `UPDATE question_skills
             SET is_primary = true
             WHERE question_id = $1 AND skill_id = $2
             RETURNING question_id, skill_id, is_primary, created_at`,
          [questionId, skillId],
        );

        await client.query('COMMIT');
        return result.rows[0] ?? null;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    });

    return toQuestionSkillLink(row);
  }

  async removeSkillFromQuestion(questionId: string, skillId: string): Promise<void> {
    await this.assertQuestionExists(questionId);

    const result = await this.db.query<{ question_id: string }>(
      `DELETE FROM question_skills
         WHERE question_id = $1 AND skill_id = $2
         RETURNING question_id`,
      [questionId, skillId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill ${skillId} is not linked to question ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  /**
   * Returns true if the question has a primary skill mapping pointing to a
   * published skill. Used by publish validation to enforce the critical
   * "question must have a published primary skill" rule (P3-014 Section 7.2,
   * QUESTION_NO_PRIMARY_SKILL / QUESTION_SKILL_NOT_PUBLISHED).
   */
  async hasPublishedPrimarySkill(questionId: string): Promise<boolean> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM question_skills qs
         JOIN skills s ON s.id = qs.skill_id
         WHERE qs.question_id = $1
           AND qs.is_primary = true
           AND s.status = 'published'`,
      [questionId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
  }

  private async assertQuestionExists(questionId: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM question_bank WHERE id = $1 LIMIT 1`,
      [questionId],
    );
    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Question not found: ${questionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  private async assertSkillExists(skillId: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM skills WHERE id = $1 LIMIT 1`,
      [skillId],
    );
    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill not found: ${skillId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
