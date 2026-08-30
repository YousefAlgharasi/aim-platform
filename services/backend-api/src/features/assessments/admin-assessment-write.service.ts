// AdminAssessmentWriteService.
//
// Scope: Admin metadata/lifecycle writes for assessments — title/description,
// course/chapter link, timing/attempt settings, and draft/published/archived
// status transitions. Grading, scoring, and pass/fail are decided entirely
// elsewhere (assessment-grading.service.ts, assessment-score-policy.service.ts)
// and are never touched here.

import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { DatabaseService } from '../../database/database.service';
import { CreateAssessmentDto, UpdateAssessmentDto } from './admin-assessment-write.dto';

interface PgError {
  code?: string;
}

function isPgError(err: unknown): err is PgError {
  return typeof err === 'object' && err !== null && 'code' in err;
}

interface AssessmentRow {
  id: string;
  title: string;
  type: string;
  status: string;
  question_count: number;
  course_id: string | null;
  chapter_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SettingsRow {
  time_limit_seconds: number | null;
  pass_threshold: string;
  randomize_questions: boolean;
}

@Injectable()
export class AdminAssessmentWriteService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateAssessmentDto, createdBy: string) {
    const result = await this.db.query<{ id: string }>(
      `INSERT INTO assessments (type, title, status, created_by)
       VALUES ($1, $2, 'draft', $3)
       RETURNING id`,
      [dto.type, dto.title, createdBy],
    );
    return this.getDetail(result.rows[0].id);
  }

  async update(id: string, dto: UpdateAssessmentDto) {
    await this.assertExists(id);

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (dto.title !== undefined) {
      setClauses.push(`title = $${idx++}`);
      params.push(dto.title);
    }
    if (dto.description !== undefined) {
      setClauses.push(`description = $${idx++}`);
      params.push(dto.description);
    }
    if (dto.status !== undefined) {
      setClauses.push(`status = $${idx++}`);
      params.push(dto.status);
    }
    if (dto.courseId !== undefined) {
      setClauses.push(`course_id = $${idx++}`);
      params.push(dto.courseId);
    }
    if (dto.chapterId !== undefined) {
      setClauses.push(`chapter_id = $${idx++}`);
      params.push(dto.chapterId);
    }

    if (setClauses.length > 0) {
      setClauses.push(`updated_at = now()`);
      params.push(id);
      await this.db.query(
        `UPDATE assessments SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        params,
      );
    }

    if (dto.settings) {
      await this.upsertSettings(id, dto.settings);
    }

    if (dto.questionIds !== undefined) {
      await this.replaceQuestions(id, dto.questionIds);
    }

    return this.getDetail(id);
  }

  private async replaceQuestions(assessmentId: string, questionIds: string[]): Promise<void> {
    try {
      await this.db.withClient(async (client) => {
        await client.query('BEGIN');
        try {
          await client.query(`DELETE FROM assessment_questions WHERE assessment_id = $1`, [assessmentId]);

          for (let i = 0; i < questionIds.length; i++) {
            await client.query(
              `INSERT INTO assessment_questions (assessment_id, question_id, "order")
               VALUES ($1, $2, $3)`,
              [assessmentId, questionIds[i], i + 1],
            );
          }

          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      });
    } catch (err) {
      // 23503: FK violation (question_id doesn't exist in questions table).
      if (isPgError(err) && err.code === '23503') {
        throw new BadRequestException('One or more question IDs do not exist in the question bank.');
      }
      throw err;
    }
  }

  async publish(id: string) {
    await this.assertExists(id);
    await this.db.query(`UPDATE assessments SET status = 'published', updated_at = now() WHERE id = $1`, [id]);
    return this.getDetail(id);
  }

  async unpublish(id: string) {
    await this.assertExists(id);
    await this.db.query(`UPDATE assessments SET status = 'draft', updated_at = now() WHERE id = $1`, [id]);
    return this.getDetail(id);
  }

  private async upsertSettings(
    assessmentId: string,
    settings: { timeLimitMinutes?: number | null; passMark?: number | null; shuffleQuestions?: boolean },
  ): Promise<void> {
    const timeLimitSeconds =
      settings.timeLimitMinutes === undefined
        ? null
        : settings.timeLimitMinutes === null
          ? null
          : settings.timeLimitMinutes * 60;

    const passThreshold = settings.passMark === undefined ? null : settings.passMark;

    await this.db.query(
      `INSERT INTO assessment_settings (assessment_id, time_limit_seconds, pass_threshold, randomize_questions)
       VALUES ($1, $2, COALESCE($3, 60.00), COALESCE($4, false))
       ON CONFLICT (assessment_id) DO UPDATE SET
         time_limit_seconds = COALESCE($2, assessment_settings.time_limit_seconds),
         pass_threshold = COALESCE($3, assessment_settings.pass_threshold),
         randomize_questions = COALESCE($4, assessment_settings.randomize_questions)`,
      [
        assessmentId,
        settings.timeLimitMinutes === undefined ? null : timeLimitSeconds,
        passThreshold,
        settings.shuffleQuestions === undefined ? null : settings.shuffleQuestions,
      ],
    );
  }

  private async assertExists(id: string): Promise<void> {
    const result = await this.db.query<{ id: string }>(`SELECT id FROM assessments WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      throw new NotFoundException('Assessment not found');
    }
  }

  private async getDetail(id: string) {
    const result = await this.db.query<AssessmentRow>(
      `SELECT a.id, a.title, a.type, a.status, a.course_id, a.chapter_id,
              (SELECT COUNT(*)::int FROM assessment_questions aq WHERE aq.assessment_id = a.id) AS question_count,
              a.created_at, a.updated_at
       FROM assessments a
       WHERE a.id = $1`,
      [id],
    );
    const row = result.rows[0];
    if (!row) {
      throw new AppError({
        code: ApiErrorCode.NOT_FOUND,
        message: 'Assessment not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const settingsResult = await this.db.query<SettingsRow>(
      `SELECT time_limit_seconds, pass_threshold, randomize_questions FROM assessment_settings WHERE assessment_id = $1`,
      [id],
    );
    const settingsRow = settingsResult.rows[0];

    const questionIdsResult = await this.db.query<{ question_id: string }>(
      `SELECT question_id FROM assessment_questions WHERE assessment_id = $1 ORDER BY "order"`,
      [id],
    );

    return {
      id: row.id,
      title: row.title,
      type: row.type,
      status: row.status,
      courseId: row.course_id,
      chapterId: row.chapter_id,
      questionCount: row.question_count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questionIds: questionIdsResult.rows.map((r) => r.question_id),
      settings: {
        timeLimitMinutes: settingsRow?.time_limit_seconds
          ? Math.round(settingsRow.time_limit_seconds / 60)
          : null,
        passMark: settingsRow ? Number(settingsRow.pass_threshold) : null,
        shuffleQuestions: settingsRow?.randomize_questions ?? false,
      },
    };
  }
}
