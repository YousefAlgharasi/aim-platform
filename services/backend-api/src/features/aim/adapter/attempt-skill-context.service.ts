/**
 * AttemptSkillContextService — Phase 5, P5-055.
 *
 * Resolves backend-authoritative skill identifiers for a given lesson or
 * question item so the AIM Engine receives correct, curriculum-sourced
 * skillIds in every AimAttemptContextInput (P5-010).
 *
 * Backend-authority rules enforced here:
 * - skillIds are always resolved from curriculum tables (lesson_skills,
 *   question_skills) — never from a client-submitted field.
 * - This service never computes mastery, level, weakness, difficulty,
 *   recommendation, review schedule, retention, or frustration.
 * - No AIM Engine call is made here; only features/aim's adapter may call
 *   the AIM Engine.
 * - No secrets, service-role keys, database credentials, or AI provider
 *   keys are stored or logged here.
 *
 * Design:
 *   resolveForLesson(lessonId)   — fetches skill_ids from lesson_skills
 *   resolveForQuestion(itemId)   — fetches skill_ids from question_skills
 *   resolveForItem(itemId, itemType) — dispatches to the correct resolver
 *     based on item type; lesson_question → lesson table,
 *     all other types (practice_question, review_question, drill_question)
 *     → question_skills table.
 *
 * Sources:
 *   P3-023 — lesson_skills migration
 *   P3-027 — question_skills migration
 *   P5-010 — AIM attempt input contract (skillIds field)
 *   P5-047 — AIM request mapper (consumes AttemptSkillIds)
 */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { AimItemType } from './aim-request-mapper.types';

// ---------------------------------------------------------------------------
// Internal row shapes
// ---------------------------------------------------------------------------

interface LessonSkillIdRow {
  skill_id: string;
}

interface QuestionSkillIdRow {
  skill_id: string;
}

// ---------------------------------------------------------------------------
// Public output type consumed by the pipeline orchestrator (P5-056)
// ---------------------------------------------------------------------------

export interface AttemptSkillIds {
  /** Resolved skill keys, ordered by created_at ASC. Empty array if none. */
  readonly skillIds: string[];
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AttemptSkillContextService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Resolve skill IDs for a lesson item from the lesson_skills table.
   *
   * Returns an empty skillIds array when no skill mappings exist for the
   * lesson — the AIM Engine must accept an empty array per P5-010.
   */
  async resolveForLesson(lessonId: string): Promise<AttemptSkillIds> {
    const result = await this.db.query<LessonSkillIdRow>(
      `SELECT skill_id
         FROM lesson_skills
        WHERE lesson_id = $1
        ORDER BY created_at ASC`,
      [lessonId],
    );

    return { skillIds: result.rows.map((r) => r.skill_id) };
  }

  /**
   * Resolve skill IDs for a question item from the question_skills table.
   *
   * Primary skills are sorted first (is_primary DESC), then by created_at
   * ASC within each group — so the most important skill appears first in the
   * AIM request array, giving the engine a consistent ordering.
   *
   * Returns an empty skillIds array when no skill mappings exist.
   */
  async resolveForQuestion(itemId: string): Promise<AttemptSkillIds> {
    const result = await this.db.query<QuestionSkillIdRow>(
      `SELECT skill_id
         FROM question_skills
        WHERE question_id = $1
        ORDER BY is_primary DESC, created_at ASC`,
      [itemId],
    );

    return { skillIds: result.rows.map((r) => r.skill_id) };
  }

  /**
   * Dispatch to the correct resolver based on item type.
   *
   * - lesson_question   → lesson_skills table (keyed by itemId = lessonId)
   * - practice_question
   * - review_question   → question_skills table (keyed by itemId)
   * - drill_question
   *
   * This is the primary entry point for the pipeline orchestrator (P5-056).
   */
  async resolveForItem(
    itemId: string,
    itemType: AimItemType,
  ): Promise<AttemptSkillIds> {
    if (itemType === 'lesson_question') {
      return this.resolveForLesson(itemId);
    }
    return this.resolveForQuestion(itemId);
  }
}
