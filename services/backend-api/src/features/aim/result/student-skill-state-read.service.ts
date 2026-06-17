// Phase 5 — P5-069
// StudentSkillStateReadService.
//
// Scope: Read-only backend service exposing persisted, backend-validated
//        student skill states from student_skill_states (P5-029/P5-057).
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller layer).
//     Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned value may be written through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     last-validated-persisted values.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types (safe, client-facing subset of student_skill_states)
// ---------------------------------------------------------------------------

export interface SkillStateEntry {
  readonly skillId: string;
  readonly masteryScore: number;
  readonly masteryConfidence: number;
  readonly masteryTrend: string;
  readonly previousMasteryScore: number | null;
  readonly lastAttemptId: string;
  readonly lastEvaluatedAt: string;
  readonly updatedAt: string;
}

export interface StudentSkillStateReadResponse {
  readonly studentId: string;
  readonly skillStates: SkillStateEntry[];
}

// ---------------------------------------------------------------------------
// Internal DB row shape
// ---------------------------------------------------------------------------

interface SkillStateRow {
  readonly skill_id: string;
  readonly mastery_score: string;
  readonly mastery_confidence: string;
  readonly mastery_trend: string;
  readonly previous_mastery_score: string | null;
  readonly last_attempt_id: string;
  readonly last_evaluated_at: string;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class StudentSkillStateReadService {
  private readonly logger = new Logger(StudentSkillStateReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return all persisted skill states for a student, ordered by skill_id.
   *
   * Returns only backend-validated, AIM-persisted values. No AIM Engine
   * call is made. If no rows exist for the student, returns an empty array.
   *
   * studentId must be JWT-resolved by the controller — never client-supplied.
   */
  async getSkillStatesForStudent(
    studentId: string,
  ): Promise<StudentSkillStateReadResponse> {
    const result = await this.db.query<SkillStateRow>(
      `SELECT
         skill_id,
         mastery_score,
         mastery_confidence,
         mastery_trend,
         previous_mastery_score,
         last_attempt_id,
         last_evaluated_at,
         updated_at
       FROM student_skill_states
       WHERE student_id = $1
       ORDER BY skill_id ASC`,
      [studentId],
    );

    const skillStates: SkillStateEntry[] = result.rows.map((row) => ({
      skillId: row.skill_id,
      masteryScore: parseFloat(row.mastery_score),
      masteryConfidence: parseFloat(row.mastery_confidence),
      masteryTrend: row.mastery_trend,
      previousMasteryScore:
        row.previous_mastery_score !== null
          ? parseFloat(row.previous_mastery_score)
          : null,
      lastAttemptId: row.last_attempt_id,
      lastEvaluatedAt: row.last_evaluated_at,
      updatedAt: row.updated_at,
    }));

    this.logger.debug('skill_states_read', {
      studentId,
      count: skillStates.length,
    });

    return { studentId, skillStates };
  }
}
