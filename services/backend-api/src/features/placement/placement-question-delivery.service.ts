// Phase 4 — P4-040
// PlacementQuestionDeliveryService.
//
// Scope: Placement Test question delivery only.
//
// Responsibility:
//   Fetch placement questions for a given section, strip all server-side-only
//   fields, and return only the student-safe response shape.
//
// Security rules:
//   - correct_answer is read from the DB but NEVER included in the returned response.
//   - skill_code, skill_id, and scoring weight are not returned to the student.
//   - Backend is the sole authority for question content.
//   - Flutter/client must never receive correct_answer or any correctness signal.
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
  PlacementQuestionDeliveryResponse,
  PlacementQuestionSafeResponse,
  PlacementQuestionWithSkillRow,
} from './placement.types';

@Injectable()
export class PlacementQuestionDeliveryService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Deliver student-safe questions for a given placement section.
   *
   * - Verifies the section exists.
   * - Strips correct_answer and all internal fields before returning.
   * - Returns questions ordered by order_index ascending.
   *
   * @param sectionId  UUID of the target placement_section.
   * @returns          Student-safe question list.
   */
  async getQuestionsForSection(
    sectionId: string,
  ): Promise<PlacementQuestionDeliveryResponse> {
    // Verify section exists.
    const sectionCheck = await this.db.query<{ id: string }>(
      `SELECT id FROM placement_sections WHERE id = $1 LIMIT 1`,
      [sectionId],
    );

    if (sectionCheck.rowCount === 0) {
      throw new AppError({
        code: 'SECTION_NOT_FOUND',
        message: `Placement section not found: ${sectionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Fetch questions for the section. Join skills to get skill_code for
    // internal use only — it is NOT included in the response sent to the student.
    //
    // SECURITY: correct_answer is selected here for the type assertion but is
    // purposely excluded from the safe response shape built in toSafeResponse().
    const result = await this.db.query<PlacementQuestionWithSkillRow>(
      `SELECT
         pq.id,
         pq.placement_section_id,
         pq.question_type,
         pq.prompt,
         pq.media_url,
         pq.order_index,
         pq.correct_answer,
         pq.created_at,
         pq.updated_at,
         s.skill_code
       FROM placement_questions pq
       LEFT JOIN placement_question_skills pqs
         ON pqs.placement_question_id = pq.id AND pqs.is_primary = true
       LEFT JOIN skills s
         ON s.id = pqs.skill_id
       WHERE pq.placement_section_id = $1
       ORDER BY pq.order_index ASC`,
      [sectionId],
    );

    const questions: PlacementQuestionSafeResponse[] = result.rows.map(
      (row) => this.toSafeResponse(row),
    );

    return { questions };
  }

  /**
   * Convert a raw DB row to the student-safe response shape.
   *
   * SECURITY: correct_answer and skill_code are intentionally excluded here.
   * This is the enforcement point — correct_answer must never leave the backend.
   */
  private toSafeResponse(
    row: PlacementQuestionWithSkillRow,
  ): PlacementQuestionSafeResponse {
    return {
      id: row.id,
      questionType: row.question_type,
      prompt: row.prompt,
      mediaUrl: row.media_url,
      orderIndex: row.order_index,
      // correct_answer: intentionally omitted
      // skill_code: intentionally omitted
    };
  }
}
