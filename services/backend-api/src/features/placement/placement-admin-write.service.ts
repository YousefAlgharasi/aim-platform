// P19-004 — PlacementAdminWriteService.
//
// Scope: Admin write API for placement tests, sections, questions, and skill links.
//
// Responsibility:
//   Implement create/update/delete/publish/archive operations for the placement
//   content hierarchy. Backend is the sole authority for status transitions,
//   total_sections/total_questions counters, and all timestamps.
//
// Security rules:
//   - Only one placement test may have status = 'published' at a time.
//   - A draft test may only be deleted if it has no attempts.
//   - A section/question may only be deleted if no answers reference it.
//   - correct_answer is never returned to students — only used here for admin
//     content management.
//   - No scoring logic, CEFR thresholds, or skill map computation here.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import {
  AddPlacementQuestionSkillDto,
  CreatePlacementQuestionDto,
  CreatePlacementSectionDto,
  CreatePlacementTestDto,
  UpdatePlacementQuestionDto,
  UpdatePlacementSectionDto,
  UpdatePlacementTestDto,
} from './placement-admin-write.dto';

interface PlacementTestRow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string;
  readonly estimated_minutes: number;
  readonly total_sections: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface PlacementSectionRow {
  readonly id: string;
  readonly placement_test_id: string;
  readonly title: string;
  readonly skill_code: string;
  readonly order_index: number;
  readonly total_questions: number;
  readonly created_at: string;
  readonly updated_at: string;
}

interface PlacementQuestionRow {
  readonly id: string;
  readonly placement_section_id: string;
  readonly question_type: string;
  readonly prompt: string;
  readonly media_url: string | null;
  readonly order_index: number;
  readonly correct_answer: string;
  readonly created_at: string;
  readonly updated_at: string;
}

interface PlacementQuestionSkillRow {
  readonly placement_question_id: string;
  readonly skill_id: string;
  readonly is_primary: boolean;
  readonly created_at: string;
}

export interface AdminPlacementTest {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string;
  readonly estimatedMinutes: number;
  readonly totalSections: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminPlacementSection {
  readonly id: string;
  readonly placementTestId: string;
  readonly title: string;
  readonly skillCode: string;
  readonly orderIndex: number;
  readonly totalQuestions: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminPlacementQuestion {
  readonly id: string;
  readonly placementSectionId: string;
  readonly questionType: string;
  readonly prompt: string;
  readonly mediaUrl: string | null;
  readonly orderIndex: number;
  readonly correctAnswer: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminPlacementQuestionSkillLink {
  readonly placementQuestionId: string;
  readonly skillId: string;
  readonly isPrimary: boolean;
  readonly createdAt: string;
}

function mapTest(row: PlacementTestRow): AdminPlacementTest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    estimatedMinutes: row.estimated_minutes,
    totalSections: row.total_sections,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSection(row: PlacementSectionRow): AdminPlacementSection {
  return {
    id: row.id,
    placementTestId: row.placement_test_id,
    title: row.title,
    skillCode: row.skill_code,
    orderIndex: row.order_index,
    totalQuestions: row.total_questions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapQuestion(row: PlacementQuestionRow): AdminPlacementQuestion {
  return {
    id: row.id,
    placementSectionId: row.placement_section_id,
    questionType: row.question_type,
    prompt: row.prompt,
    mediaUrl: row.media_url,
    orderIndex: row.order_index,
    correctAnswer: row.correct_answer,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSkillLink(
  row: PlacementQuestionSkillRow,
): AdminPlacementQuestionSkillLink {
  return {
    placementQuestionId: row.placement_question_id,
    skillId: row.skill_id,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

@Injectable()
export class PlacementAdminWriteService {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // Tests
  // -------------------------------------------------------------------------

  async createTest(dto: CreatePlacementTestDto): Promise<AdminPlacementTest> {
    const result = await this.db.query<PlacementTestRow>(
      `INSERT INTO placement_tests (title, description, estimated_minutes)
       VALUES ($1, $2, COALESCE($3, 20))
       RETURNING id, title, description, status, estimated_minutes, total_sections,
                 created_at, updated_at`,
      [dto.title, dto.description ?? null, dto.estimated_minutes ?? null],
    );

    return mapTest(result.rows[0]);
  }

  async updateTest(
    testId: string,
    dto: UpdatePlacementTestDto,
  ): Promise<AdminPlacementTest> {
    const existing = await this.findTestOrThrow(testId);

    const result = await this.db.query<PlacementTestRow>(
      `UPDATE placement_tests
          SET title = $1,
              description = $2,
              estimated_minutes = $3,
              updated_at = now()
        WHERE id = $4
        RETURNING id, title, description, status, estimated_minutes, total_sections,
                  created_at, updated_at`,
      [
        dto.title ?? existing.title,
        dto.description ?? existing.description,
        dto.estimated_minutes ?? existing.estimated_minutes,
        testId,
      ],
    );

    return mapTest(result.rows[0]);
  }

  async deleteTest(testId: string): Promise<void> {
    await this.findTestOrThrow(testId);

    const attempts = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM placement_attempts WHERE placement_test_id = $1`,
      [testId],
    );

    if (parseInt(attempts.rows[0]?.count ?? '0', 10) > 0) {
      throw new AppError({
        code: PlacementErrorCode.TEST_HAS_ATTEMPTS,
        message: 'Cannot delete a placement test that has attempts.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.db.query(`DELETE FROM placement_tests WHERE id = $1`, [testId]);
  }

  async publishTest(testId: string): Promise<AdminPlacementTest> {
    const test = await this.findTestOrThrow(testId);

    if (test.status !== 'draft') {
      throw new AppError({
        code: PlacementErrorCode.TEST_NOT_DRAFT,
        message: 'Only a draft test can be published.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const published = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM placement_tests WHERE status = 'published'`,
    );

    if (parseInt(published.rows[0]?.count ?? '0', 10) > 0) {
      throw new AppError({
        code: PlacementErrorCode.PUBLISHED_TEST_EXISTS,
        message: 'Another placement test is already published.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<PlacementTestRow>(
      `UPDATE placement_tests
          SET status = 'published',
              version = version + 1,
              published_at = now(),
              updated_at = now()
        WHERE id = $1
        RETURNING id, title, description, status, estimated_minutes, total_sections,
                  created_at, updated_at`,
      [testId],
    );

    return mapTest(result.rows[0]);
  }

  async archiveTest(testId: string): Promise<AdminPlacementTest> {
    const test = await this.findTestOrThrow(testId);

    if (test.status !== 'published') {
      throw new AppError({
        code: PlacementErrorCode.TEST_NOT_PUBLISHED,
        message: 'Only a published test can be archived.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<PlacementTestRow>(
      `UPDATE placement_tests
          SET status = 'archived',
              updated_at = now()
        WHERE id = $1
        RETURNING id, title, description, status, estimated_minutes, total_sections,
                  created_at, updated_at`,
      [testId],
    );

    return mapTest(result.rows[0]);
  }

  private async findTestOrThrow(testId: string): Promise<PlacementTestRow> {
    const result = await this.db.query<PlacementTestRow>(
      `SELECT id, title, description, status, estimated_minutes, total_sections,
              created_at, updated_at
         FROM placement_tests
        WHERE id = $1`,
      [testId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.TEST_NOT_FOUND,
        message: 'Placement test not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  // -------------------------------------------------------------------------
  // Sections
  // -------------------------------------------------------------------------

  async createSection(
    testId: string,
    dto: CreatePlacementSectionDto,
  ): Promise<AdminPlacementSection> {
    await this.findTestOrThrow(testId);

    return this.db.withClient(async (client) => {
      const insertResult = await client.query<PlacementSectionRow>(
        `INSERT INTO placement_sections (placement_test_id, title, skill_code, order_index)
         VALUES ($1, $2, $3, $4)
         RETURNING id, placement_test_id, title, skill_code, order_index, total_questions,
                   created_at, updated_at`,
        [testId, dto.title, dto.skill_code, dto.order_index],
      );

      await client.query(
        `UPDATE placement_tests
            SET total_sections = (SELECT COUNT(*) FROM placement_sections WHERE placement_test_id = $1),
                updated_at = now()
          WHERE id = $1`,
        [testId],
      );

      return mapSection(insertResult.rows[0]);
    });
  }

  async updateSection(
    sectionId: string,
    dto: UpdatePlacementSectionDto,
  ): Promise<AdminPlacementSection> {
    const existing = await this.findSectionOrThrow(sectionId);

    const result = await this.db.query<PlacementSectionRow>(
      `UPDATE placement_sections
          SET title = $1,
              skill_code = $2,
              order_index = $3,
              updated_at = now()
        WHERE id = $4
        RETURNING id, placement_test_id, title, skill_code, order_index, total_questions,
                  created_at, updated_at`,
      [
        dto.title ?? existing.title,
        dto.skill_code ?? existing.skill_code,
        dto.order_index ?? existing.order_index,
        sectionId,
      ],
    );

    return mapSection(result.rows[0]);
  }

  async deleteSection(sectionId: string): Promise<void> {
    const section = await this.findSectionOrThrow(sectionId);

    const answers = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
         FROM placement_answers pa
         JOIN placement_questions pq ON pq.id = pa.placement_question_id
        WHERE pq.placement_section_id = $1`,
      [sectionId],
    );

    if (parseInt(answers.rows[0]?.count ?? '0', 10) > 0) {
      throw new AppError({
        code: PlacementErrorCode.SECTION_HAS_ANSWERS,
        message: 'Cannot delete a section that has submitted answers.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.db.withClient(async (client) => {
      await client.query(`DELETE FROM placement_sections WHERE id = $1`, [
        sectionId,
      ]);

      await client.query(
        `UPDATE placement_tests
            SET total_sections = (SELECT COUNT(*) FROM placement_sections WHERE placement_test_id = $1),
                updated_at = now()
          WHERE id = $1`,
        [section.placement_test_id],
      );
    });
  }

  private async findSectionOrThrow(
    sectionId: string,
  ): Promise<PlacementSectionRow> {
    const result = await this.db.query<PlacementSectionRow>(
      `SELECT id, placement_test_id, title, skill_code, order_index, total_questions,
              created_at, updated_at
         FROM placement_sections
        WHERE id = $1`,
      [sectionId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.SECTION_NOT_FOUND_ADMIN,
        message: 'Placement section not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  // -------------------------------------------------------------------------
  // Questions
  // -------------------------------------------------------------------------

  async createQuestion(
    sectionId: string,
    dto: CreatePlacementQuestionDto,
  ): Promise<AdminPlacementQuestion> {
    await this.findSectionOrThrow(sectionId);

    return this.db.withClient(async (client) => {
      const insertResult = await client.query<PlacementQuestionRow>(
        `INSERT INTO placement_questions
           (placement_section_id, question_type, prompt, media_url, order_index, correct_answer)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, placement_section_id, question_type, prompt, media_url, order_index,
                   correct_answer, created_at, updated_at`,
        [
          sectionId,
          dto.question_type,
          dto.prompt,
          dto.media_url ?? null,
          dto.order_index,
          dto.correct_answer,
        ],
      );

      await client.query(
        `UPDATE placement_sections
            SET total_questions = (SELECT COUNT(*) FROM placement_questions WHERE placement_section_id = $1),
                updated_at = now()
          WHERE id = $1`,
        [sectionId],
      );

      return mapQuestion(insertResult.rows[0]);
    });
  }

  async updateQuestion(
    questionId: string,
    dto: UpdatePlacementQuestionDto,
  ): Promise<AdminPlacementQuestion> {
    const existing = await this.findQuestionOrThrow(questionId);

    const result = await this.db.query<PlacementQuestionRow>(
      `UPDATE placement_questions
          SET question_type = $1,
              prompt = $2,
              media_url = $3,
              order_index = $4,
              correct_answer = $5,
              updated_at = now()
        WHERE id = $6
        RETURNING id, placement_section_id, question_type, prompt, media_url, order_index,
                  correct_answer, created_at, updated_at`,
      [
        dto.question_type ?? existing.question_type,
        dto.prompt ?? existing.prompt,
        dto.media_url ?? existing.media_url,
        dto.order_index ?? existing.order_index,
        dto.correct_answer ?? existing.correct_answer,
        questionId,
      ],
    );

    return mapQuestion(result.rows[0]);
  }

  async deleteQuestion(questionId: string): Promise<void> {
    const question = await this.findQuestionOrThrow(questionId);

    const answers = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM placement_answers WHERE placement_question_id = $1`,
      [questionId],
    );

    if (parseInt(answers.rows[0]?.count ?? '0', 10) > 0) {
      throw new AppError({
        code: PlacementErrorCode.QUESTION_HAS_ANSWERS,
        message: 'Cannot delete a question that has submitted answers.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    await this.db.withClient(async (client) => {
      await client.query(`DELETE FROM placement_questions WHERE id = $1`, [
        questionId,
      ]);

      await client.query(
        `UPDATE placement_sections
            SET total_questions = (SELECT COUNT(*) FROM placement_questions WHERE placement_section_id = $1),
                updated_at = now()
          WHERE id = $1`,
        [question.placement_section_id],
      );
    });
  }

  private async findQuestionOrThrow(
    questionId: string,
  ): Promise<PlacementQuestionRow> {
    const result = await this.db.query<PlacementQuestionRow>(
      `SELECT id, placement_section_id, question_type, prompt, media_url, order_index,
              correct_answer, created_at, updated_at
         FROM placement_questions
        WHERE id = $1`,
      [questionId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.QUESTION_NOT_FOUND_ADMIN,
        message: 'Placement question not found.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return result.rows[0];
  }

  // -------------------------------------------------------------------------
  // Question-skill links
  // -------------------------------------------------------------------------

  async addQuestionSkillLink(
    questionId: string,
    dto: AddPlacementQuestionSkillDto,
  ): Promise<AdminPlacementQuestionSkillLink> {
    await this.findQuestionOrThrow(questionId);

    const existing = await this.db.query<PlacementQuestionSkillRow>(
      `SELECT placement_question_id, skill_id, is_primary, created_at
         FROM placement_question_skills
        WHERE placement_question_id = $1 AND skill_id = $2`,
      [questionId, dto.skill_id],
    );

    if ((existing.rowCount ?? 0) > 0) {
      throw new AppError({
        code: PlacementErrorCode.DUPLICATE_SKILL_LINK,
        message: 'This skill is already linked to the question.',
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const result = await this.db.query<PlacementQuestionSkillRow>(
      `INSERT INTO placement_question_skills (placement_question_id, skill_id, is_primary)
       VALUES ($1, $2, COALESCE($3, false))
       RETURNING placement_question_id, skill_id, is_primary, created_at`,
      [questionId, dto.skill_id, dto.is_primary ?? null],
    );

    return mapSkillLink(result.rows[0]);
  }

  async removeQuestionSkillLink(
    questionId: string,
    skillId: string,
  ): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM placement_question_skills
        WHERE placement_question_id = $1 AND skill_id = $2`,
      [questionId, skillId],
    );

    if (result.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.SKILL_LINK_NOT_FOUND,
        message: 'Skill link not found for this question.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }
}
