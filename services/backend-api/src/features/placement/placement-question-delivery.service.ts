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
import { PlacementErrorCode } from './placement-error-codes';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import {
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
    studentId?: string,
  ): Promise<PlacementQuestionSafeResponse[]> {
    // Verify section exists.
    const sectionCheck = await this.db.query<{ id: string }>(
      `SELECT id FROM placement_sections WHERE id = $1 LIMIT 1`,
      [sectionId],
    );

    if (sectionCheck.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.SECTION_NOT_FOUND,
        message: `Placement section not found: ${sectionId}`,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    // Fetch questions for the section. Join skills to get skill_code for
    // internal use only — it is NOT included in the response sent to the student.
    //
    // SECURITY: correct_answer is selected here for the type assertion but is
    // purposely excluded from the safe response shape built in toSafeResponse().
    // When the student has an active attempt with a drawn question set, deliver ONLY that
    // student's random questions (in the drawn order). Otherwise (admin preview / legacy
    // attempt) deliver the whole active section.
    const attemptId = studentId ? await this.findActiveAttemptWithDraw(studentId) : null;
    const result = attemptId
      ? await this.db.query<PlacementQuestionWithSkillRow>(
          `SELECT pq.id, pq.placement_section_id, pq.question_type, pq.prompt, pq.media_url,
                  pq.listening_script, paq.position AS order_index, pq.correct_answer,
                  pq.created_at, pq.updated_at, ps.skill_code
             FROM placement_attempt_questions paq
             JOIN placement_questions pq ON pq.id = paq.placement_question_id
             JOIN placement_sections ps ON ps.id = pq.placement_section_id
            WHERE paq.placement_attempt_id = $1 AND paq.placement_section_id = $2
            ORDER BY paq.position ASC`,
          [attemptId, sectionId],
        )
      : await this.db.query<PlacementQuestionWithSkillRow>(
      `SELECT
         pq.id,
         pq.placement_section_id,
         pq.question_type,
         pq.prompt,
         pq.media_url,
         pq.listening_script,
         pq.order_index,
         pq.correct_answer,
         pq.created_at,
         pq.updated_at,
         ps.skill_code
       FROM placement_questions pq
       JOIN placement_sections ps
         ON ps.id = pq.placement_section_id
       WHERE pq.placement_section_id = $1 AND pq.is_active = true
       ORDER BY pq.difficulty ASC, pq.order_index ASC`,
      [sectionId],
    );

    return result.rows.map((row, index) => this.toSafeResponse({ ...row, order_index: index + 1 }));
  }

  /** The student's newest active attempt, if it has a drawn question set. */
  private async findActiveAttemptWithDraw(studentId: string): Promise<string | null> {
    const r = await this.db.query<{ id: string }>(
      `SELECT pa.id
         FROM placement_attempts pa
        WHERE pa.student_id = $1 AND pa.status = 'active'
          AND EXISTS (SELECT 1 FROM placement_attempt_questions q WHERE q.placement_attempt_id = pa.id)
        ORDER BY pa.started_at DESC
        LIMIT 1`,
      [studentId],
    );
    return r.rows[0]?.id ?? null;
  }

  /**
   * Parse a prompt string into a question stem and options array.
   *
   * Handles two option formats found in seed/DB data:
   *   1. "(A) go (B) goes (C) going (D) gone"
   *   2. "A) am\nB) is\nC) are\nD) be"
   *
   * Also normalises literal two-char "\n" sequences into real newlines
   * before parsing, so prompts stored with escaped newlines work correctly.
   */
  private parsePrompt(prompt: string): { text: string; options: Array<{ id: string; text: string }> } {
    // Normalise literal "\n" (two chars) into real newlines.
    const normalised = prompt.replace(/\\n/g, '\n');

    // Try format 1: (A) text (B) text ...
    const parenRegex = /\(([A-D])\)\s*([^(]*)/g;
    const options: Array<{ id: string; text: string }> = [];
    let match: RegExpExecArray | null;

    while ((match = parenRegex.exec(normalised)) !== null) {
      options.push({ id: match[1], text: match[2].trim() });
    }

    if (options.length > 0) {
      const stemEnd = normalised.search(/\([A-D]\)/);
      const text = stemEnd > 0 ? normalised.substring(0, stemEnd).trim() : normalised.trim();
      return { text, options };
    }

    // Try format 2: A) text (newline-separated or inline)
    // Each option runs to end-of-line or to the next option marker.
    const bareRegex = /(?:^|[\n])([A-D])\)\s*(.+?)(?=\n[A-D]\)|$)/gs;
    while ((match = bareRegex.exec(normalised)) !== null) {
      options.push({ id: match[1], text: match[2].trim() });
    }

    if (options.length > 0) {
      const stemEnd = normalised.search(/(?:^|\n)[A-D]\)/m);
      const text = stemEnd > 0 ? normalised.substring(0, stemEnd).trim() : normalised.trim();
      return { text, options };
    }

    return { text: normalised.trim(), options };
  }

  /**
   * Convert a raw DB row to the student-safe response shape.
   *
   * SECURITY: correct_answer and skill_code are intentionally excluded here.
   * This is the enforcement point — correct_answer must never leave the backend.
   *
   * Field names use snake_case to match the Flutter PlacementQuestionModel.fromJson() contract.
   */
  private toSafeResponse(
    row: PlacementQuestionWithSkillRow,
  ): PlacementQuestionSafeResponse {
    const parsed = this.parsePrompt(row.prompt);
    return {
      id: row.id,
      section_id: row.placement_section_id,
      text: parsed.text,
      options: parsed.options,
      type: row.question_type,
      media_url: row.media_url,
      has_listening_audio: Boolean(row.listening_script && row.listening_script.trim().length > 0),
      ordinal: row.order_index,
      // correct_answer: intentionally omitted
      // skill_code: intentionally omitted
    };
  }
}
