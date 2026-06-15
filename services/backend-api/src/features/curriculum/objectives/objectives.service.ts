import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus } from '../courses/courses.types';
import {
  CreateObjectiveInput,
  OBJECTIVE_KEY_PATTERN,
  ObjectiveListResponse,
  ObjectiveRow,
  ObjectiveSummary,
  UpdateObjectiveInput,
} from './objectives.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function validateStatus(status: string): asserts status is CurriculumContentStatus {
  if (!(CURRICULUM_CONTENT_STATUSES as readonly string[]).includes(status)) {
    throw new AppError({
      code: ApiErrorCode.BAD_REQUEST,
      message: `Invalid status value: ${status}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

function validateObjectiveKey(key: string): void {
  if (!OBJECTIVE_KEY_PATTERN.test(key)) {
    throw new AppError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message: `Invalid objective key format: "${key}". Must be lowercase dot-delimited`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class ObjectivesService {
  constructor(private readonly db: DatabaseService) {}

  async listObjectives(
    page: number,
    limit: number,
    status?: string,
  ): Promise<ObjectiveListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (status !== undefined) validateStatus(status);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (status !== undefined) {
      conditions.push(`o.status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM objectives o ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<{
      id: string;
      key: string | null;
      title: string;
      status: CurriculumContentStatus;
      created_at: Date;
      updated_at: Date;
      linked_skill_count: string;
    }>(
      `SELECT o.id, o.key, o.title, o.status, o.created_at, o.updated_at, 
              (SELECT COUNT(*) FROM objective_skills os WHERE os.objective_id = o.id)::text AS linked_skill_count
         FROM objectives o
         ${where}
         ORDER BY o.created_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      objectives: dataResult.rows.map(row => ({
        id: row.id,
        key: row.key,
        title: row.title,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        linkedSkillCount: parseInt(row.linked_skill_count, 10),
      })),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getObjective(id: string): Promise<ObjectiveSummary> {
    return this.getObjectiveInternal('id = $1', [id]);
  }

  async getObjectiveByKey(key: string): Promise<ObjectiveSummary> {
    return this.getObjectiveInternal('key = $1', [key]);
  }

  private async getObjectiveInternal(whereClause: string, values: unknown[]): Promise<ObjectiveSummary> {
    const result = await this.db.query<ObjectiveRow>(
      `SELECT id, key, title, description, status, created_at, updated_at
         FROM objectives WHERE ${whereClause}`,
      values,
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Objective not found`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const row = result.rows[0];

    const skillsResult = await this.db.query<{ skill_id: string }>(
      `SELECT skill_id FROM objective_skills WHERE objective_id = $1`,
      [row.id],
    );

    return {
      id: row.id,
      key: row.key,
      title: row.title,
      description: row.description,
      linkedSkillIds: skillsResult.rows.map(s => s.skill_id),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createObjective(input: CreateObjectiveInput): Promise<ObjectiveSummary> {
    const { key, title, description, linkedSkillIds } = input;

    if (key !== undefined && key !== null) {
      validateObjectiveKey(key);
      const existing = await this.db.query<{ id: string }>(
        `SELECT id FROM objectives WHERE key = $1 LIMIT 1`,
        [key],
      );
      if (existing.rows.length > 0) {
        throw new AppError({
          code: ApiErrorCode.CONFLICT,
          message: `Objective key already exists: ${key}`,
          statusCode: HttpStatus.CONFLICT,
        });
      }
    }

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Objective title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    let newId: string | undefined;

    await this.db.withClient(async (client) => {
      await client.query('BEGIN');

      try {
        if (linkedSkillIds && linkedSkillIds.length > 0) {
          const skillsCheck = await client.query<{ id: string; status: string }>(
            `SELECT id, status FROM skills WHERE id = ANY($1)`,
            [linkedSkillIds],
          );

          if (skillsCheck.rows.length !== linkedSkillIds.length) {
            throw new AppError({
              code: ApiErrorCode.NOT_FOUND,
              message: `One or more linked skills not found`,
              statusCode: HttpStatus.NOT_FOUND,
            });
          }

          const archivedSkills = skillsCheck.rows.filter((s: { id: string; status: string }) => s.status === 'archived');
          if (archivedSkills.length > 0) {
            throw new AppError({
              code: ApiErrorCode.VALIDATION_ERROR,
              message: `Cannot link to archived skills`,
              statusCode: HttpStatus.BAD_REQUEST,
            });
          }
        }

        const result = await client.query<ObjectiveRow>(
          `INSERT INTO objectives (key, title, description, status)
             VALUES ($1, $2, $3, 'draft')
             RETURNING id, key, title, description, status, created_at, updated_at`,
          [key ?? null, title.trim(), description?.trim() ?? null],
        );

        newId = result.rows[0].id;

        if (linkedSkillIds && linkedSkillIds.length > 0) {
          for (const skillId of linkedSkillIds) {
            await client.query(
              `INSERT INTO objective_skills (objective_id, skill_id) VALUES ($1, $2)`,
              [newId, skillId],
            );
          }
        }

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    });

    return this.getObjective(newId as string);
  }

  async updateObjective(id: string, input: UpdateObjectiveInput): Promise<ObjectiveSummary> {
    await this.getObjective(id);

    await this.db.withClient(async (client) => {
      await client.query('BEGIN');

      try {
        const setClauses: string[] = [];
        const values: unknown[] = [];
        let idx = 1;

        if (input.key !== undefined) {
          if (input.key !== null) validateObjectiveKey(input.key);
          if (input.key !== null) {
            const existing = await client.query<{ id: string }>(
              `SELECT id FROM objectives WHERE key = $1 AND id != $2 LIMIT 1`,
              [input.key, id],
            );
            if (existing.rows.length > 0) {
              throw new AppError({
                code: ApiErrorCode.CONFLICT,
                message: `Objective key already exists: ${input.key}`,
                statusCode: HttpStatus.CONFLICT,
              });
            }
          }
          setClauses.push(`key = $${idx++}`);
          values.push(input.key);
        }

        if (input.title !== undefined) {
          if (input.title.trim().length === 0) {
            throw new AppError({
              code: ApiErrorCode.VALIDATION_ERROR,
              message: 'Objective title cannot be empty',
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

        if (input.status !== undefined) {
          validateStatus(input.status);
          setClauses.push(`status = $${idx++}`);
          values.push(input.status);
        }

        if (setClauses.length > 0) {
          values.push(id);
          await client.query(
            `UPDATE objectives
               SET ${setClauses.join(', ')}
               WHERE id = $${idx}`,
            values,
          );
        }

        if (input.linkedSkillIds !== undefined) {
          const newSkillIds = [...new Set(input.linkedSkillIds)];

          if (newSkillIds.length > 0) {
            const skillsCheck = await client.query<{ id: string; status: string }>(
              `SELECT id, status FROM skills WHERE id = ANY($1)`,
              [newSkillIds],
            );

            if (skillsCheck.rows.length !== newSkillIds.length) {
              throw new AppError({
                code: ApiErrorCode.NOT_FOUND,
                message: `One or more linked skills not found`,
                statusCode: HttpStatus.NOT_FOUND,
              });
            }

            const archivedSkills = skillsCheck.rows.filter((s: { id: string; status: string }) => s.status === 'archived');
            if (archivedSkills.length > 0) {
              throw new AppError({
                code: ApiErrorCode.VALIDATION_ERROR,
                message: `Cannot link to archived skills`,
                statusCode: HttpStatus.BAD_REQUEST,
              });
            }
          }

          await client.query(`DELETE FROM objective_skills WHERE objective_id = $1`, [id]);

          if (newSkillIds.length > 0) {
            for (const skillId of newSkillIds) {
              await client.query(
                `INSERT INTO objective_skills (objective_id, skill_id) VALUES ($1, $2)`,
                [id, skillId],
              );
            }
          }
        }

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    });

    return this.getObjective(id);
  }
}
