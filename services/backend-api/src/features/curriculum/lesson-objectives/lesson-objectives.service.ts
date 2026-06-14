import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import {
  AddObjectiveToLessonInput,
  LessonObjectiveLink,
  LessonObjectiveListResponse,
  LessonObjectiveRow,
} from './lesson-objectives.types';

function toLessonObjectiveLink(row: LessonObjectiveRow): LessonObjectiveLink {
  return {
    lessonId: row.lesson_id,
    objectiveId: row.objective_id,
    createdAt: row.created_at,
  };
}

@Injectable()
export class LessonObjectivesService {
  constructor(private readonly db: DatabaseService) {}

  async listObjectivesForLesson(lessonId: string): Promise<LessonObjectiveListResponse> {
    await this.assertLessonExists(lessonId);

    const result = await this.db.query<LessonObjectiveRow>(
      `SELECT lesson_id, objective_id, created_at
         FROM lesson_objectives
         WHERE lesson_id = $1
         ORDER BY created_at ASC`,
      [lessonId],
    );

    return {
      links: result.rows.map(toLessonObjectiveLink),
      total: result.rows.length,
    };
  }

  async addObjectiveToLesson(
    lessonId: string,
    input: AddObjectiveToLessonInput,
  ): Promise<LessonObjectiveLink> {
    const { objectiveId } = input;

    await this.assertLessonExists(lessonId);
    await this.assertObjectiveExists(objectiveId);

    const existing = await this.db.query<{ lesson_id: string }>(
      `SELECT lesson_id FROM lesson_objectives
         WHERE lesson_id = $1 AND objective_id = $2 LIMIT 1`,
      [lessonId, objectiveId],
    );
    if (existing.rows.length > 0) {
      throw new AppError({
        code: ApiErrorCode.CONFLICT,
        message: `Objective ${objectiveId} is already linked to lesson ${lessonId}`,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<LessonObjectiveRow>(
      `INSERT INTO lesson_objectives (lesson_id, objective_id)
         VALUES ($1, $2)
         RETURNING lesson_id, objective_id, created_at`,
      [lessonId, objectiveId],
    );

    return toLessonObjectiveLink(result.rows[0]);
  }

  async removeObjectiveFromLesson(lessonId: string, objectiveId: string): Promise<void> {
    await this.assertLessonExists(lessonId);

    const result = await this.db.query<{ lesson_id: string }>(
      `DELETE FROM lesson_objectives
         WHERE lesson_id = $1 AND objective_id = $2
         RETURNING lesson_id`,
      [lessonId, objectiveId],
    );

    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Objective ${objectiveId} is not linked to lesson ${lessonId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
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

  private async assertObjectiveExists(objectiveId: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(
      `SELECT id FROM objectives WHERE id = $1 LIMIT 1`,
      [objectiveId],
    );
    if (result.rows.length === 0) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: `Objective not found: ${objectiveId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
