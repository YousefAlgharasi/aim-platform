import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { CurriculumAuditLogService } from '../curriculum-audit-log/curriculum-audit-log.service';
import {
  AddSkillToLessonInput,
  LessonSkillLink,
  LessonSkillListResponse,
  LessonSkillRow,
} from './lesson-skills.types';

function toLessonSkillLink(row: LessonSkillRow): LessonSkillLink {
  return {
    lessonId: row.lesson_id,
    skillId: row.skill_id,
    createdAt: row.created_at,
  };
}

@Injectable()
export class LessonSkillsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditLog: CurriculumAuditLogService,
  ) {}

  async listSkillsForLesson(lessonId: string): Promise<LessonSkillListResponse> {
    await this.assertLessonExists(lessonId);

    const result = await this.db.query<LessonSkillRow>(
      `SELECT lesson_id, skill_id, created_at
         FROM lesson_skills
         WHERE lesson_id = $1
         ORDER BY created_at ASC`,
      [lessonId],
    );

    return {
      links: result.rows.map(toLessonSkillLink),
      total: result.rows.length,
    };
  }

  async addSkillToLesson(
    lessonId: string,
    input: AddSkillToLessonInput,
    actorUserId?: string | null,
  ): Promise<LessonSkillLink> {
    const { skillId } = input;

    await this.assertLessonExists(lessonId);
    await this.assertSkillExists(skillId);

    const existing = await this.db.query<{ lesson_id: string }>(
      `SELECT lesson_id FROM lesson_skills WHERE lesson_id = $1 AND skill_id = $2 LIMIT 1`,
      [lessonId, skillId],
    );
    if (existing.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Skill ${skillId} is already linked to lesson ${lessonId}`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<LessonSkillRow>(
      `INSERT INTO lesson_skills (lesson_id, skill_id)
         VALUES ($1, $2)
         RETURNING lesson_id, skill_id, created_at`,
      [lessonId, skillId],
    );

    await this.auditLog.log({
      entityType: 'lesson_skill_mapping',
      entityId: lessonId,
      eventType: 'skill_linked',
      actorUserId: actorUserId ?? null,
      metadata: { skillId },
    });

    return toLessonSkillLink(result.rows[0]);
  }

  async removeSkillFromLesson(
    lessonId: string,
    skillId: string,
    actorUserId?: string | null,
  ): Promise<void> {
    await this.assertLessonExists(lessonId);

    const lessonStatus = await this.getLessonStatus(lessonId);

    if (lessonStatus === 'published') {
      const currentCount = await this.countSkillLinksForLesson(lessonId);
      if (currentCount <= 1) {
        throw new AppError({
          code: ApiErrorCode.VALIDATION_ERROR,
          message: `Cannot remove the last skill from published lesson ${lessonId}. A published lesson must have at least one linked skill.`,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      }
    }

    const result = await this.db.query<{ lesson_id: string }>(
      `DELETE FROM lesson_skills
         WHERE lesson_id = $1 AND skill_id = $2
         RETURNING lesson_id`,
      [lessonId, skillId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Skill ${skillId} is not linked to lesson ${lessonId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.auditLog.log({
      entityType: 'lesson_skill_mapping',
      entityId: lessonId,
      eventType: 'skill_unlinked',
      actorUserId: actorUserId ?? null,
      metadata: { skillId },
    });
  }

  private async getLessonStatus(lessonId: string): Promise<string> {
    const result = await this.db.query<{ status: string }>(
      `SELECT status FROM lessons WHERE id = $1 LIMIT 1`,
      [lessonId],
    );
    return result.rows[0]?.status ?? 'draft';
  }

  private async countSkillLinksForLesson(lessonId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM lesson_skills WHERE lesson_id = $1`,
      [lessonId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  async countPublishedSkillsForLesson(lessonId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM lesson_skills ls
         JOIN skills s ON s.id = ls.skill_id
         WHERE ls.lesson_id = $1
           AND s.status = 'published'`,
      [lessonId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  private async assertLessonExists(lessonId: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM lessons WHERE id = $1 LIMIT 1`,
      [lessonId],
    );
    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Lesson not found: ${lessonId}`,
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
