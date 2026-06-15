import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { CURRICULUM_CONTENT_STATUSES, CurriculumContentStatus } from '../courses/courses.types';
import {
  CreateSkillInput,
  SKILL_DOMAINS,
  SKILL_KEY_PATTERN,
  SkillDomain,
  SkillListResponse,
  SkillRow,
  SkillSummary,
  UpdateSkillInput,
} from './skills.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toSkillSummary(row: SkillRow): SkillSummary {
  return {
    id: row.id,
    key: row.key,
    title: row.title,
    description: row.description,
    domain: row.domain,
    parentSkillId: row.parent_skill_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateDomain(domain: string): asserts domain is SkillDomain {
  if (!(SKILL_DOMAINS as readonly string[]).includes(domain)) {
    throw new AppError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message: `Invalid skill domain: ${domain}. Must be one of: ${SKILL_DOMAINS.join(', ')}`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
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

function validateSkillKey(key: string): void {
  if (!SKILL_KEY_PATTERN.test(key)) {
    throw new AppError({
      code: ApiErrorCode.VALIDATION_ERROR,
      message: `Invalid skill key format: "${key}". Must be lowercase dot-delimited (e.g. grammar.past_simple.forms)`,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }
}

@Injectable()
export class SkillsService {
  constructor(private readonly db: DatabaseService) {}

  async listSkills(
    page: number,
    limit: number,
    domain?: string,
    status?: string,
    q?: string,
  ): Promise<SkillListResponse> {
    const safePage = Math.max(page, DEFAULT_PAGE);
    const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
    const offset = (safePage - 1) * safeLimit;

    if (domain !== undefined) validateDomain(domain);
    if (status !== undefined) validateStatus(status);

    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (domain !== undefined) {
      conditions.push(`domain = $${idx++}`);
      values.push(domain);
    }
    if (status !== undefined) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }

    const search = q?.trim();
    if (search) {
      conditions.push(
        `(key ILIKE $${idx} OR title ILIKE $${idx} OR COALESCE(description, '') ILIKE $${idx})`,
      );
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM skills ${where}`,
      values,
    );

    const total = parseInt(countResult.rows[0]?.total ?? '0', 10);

    const dataResult = await this.db.query<SkillRow>(
      `SELECT id, key, title, description, domain, parent_skill_id, status, created_at, updated_at
         FROM skills
         ${where}
         ORDER BY domain ASC, key ASC
         LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, safeLimit, offset],
    );

    return {
      skills: dataResult.rows.map(toSkillSummary),
      total,
      page: safePage,
      limit: safeLimit,
    };
  }

  async getSkill(id: string): Promise<SkillSummary> {
    const result = await this.db.query<SkillRow>(
      `SELECT id, key, title, description, domain, parent_skill_id, status, created_at, updated_at
         FROM skills WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill not found: ${id}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toSkillSummary(result.rows[0]);
  }

  async getSkillByKey(key: string): Promise<SkillSummary> {
    const result = await this.db.query<SkillRow>(
      `SELECT id, key, title, description, domain, parent_skill_id, status, created_at, updated_at
         FROM skills WHERE key = $1`,
      [key],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill not found for key: ${key}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return toSkillSummary(result.rows[0]);
  }

  async createSkill(input: CreateSkillInput): Promise<SkillSummary> {
    const { key, title, description, domain, parentSkillId } = input;

    validateSkillKey(key);
    validateDomain(domain);

    if (!title || title.trim().length === 0) {
      throw new AppError({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Skill title is required',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM skills WHERE key = $1 LIMIT 1`,
      [key],
    );
    if (existing.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Skill key already exists: ${key}`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (parentSkillId !== undefined && parentSkillId !== null) {
      const parent = await this.db.query<{ id: string }>(
        `SELECT id FROM skills WHERE id = $1 LIMIT 1`,
        [parentSkillId],
      );
      if (parent.rows.length === 0) {
        throw new AppError({
          code: ApiErrorCode.NOT_FOUND,
          message: `Parent skill not found: ${parentSkillId}`,
          statusCode: HttpStatus.NOT_FOUND,
        });
      }
    }

    const result = await this.db.query<SkillRow>(
      `INSERT INTO skills (key, title, description, domain, parent_skill_id, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')
         RETURNING id, key, title, description, domain, parent_skill_id, status, created_at, updated_at`,
      [key, title.trim(), description?.trim() ?? null, domain, parentSkillId ?? null],
    );

    return toSkillSummary(result.rows[0]);
  }

  async updateSkill(id: string, input: UpdateSkillInput): Promise<SkillSummary> {
    await this.getSkill(id);

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      if (input.title.trim().length === 0) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: 'Skill title cannot be empty',
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

    if (setClauses.length === 0) {
      return this.getSkill(id);
    }

    values.push(id);

    const result = await this.db.query<SkillRow>(
      `UPDATE skills
         SET ${setClauses.join(', ')}
         WHERE id = $${idx}
         RETURNING id, key, title, description, domain, parent_skill_id, status, created_at, updated_at`,
      values,
    );

    return toSkillSummary(result.rows[0]);
  }
}
