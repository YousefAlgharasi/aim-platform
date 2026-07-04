// P20-018 — DifficultyDecisionReadService.
//
// Scope: Read-only backend service exposing the student's most recent AIM
// difficulty decision from difficulty_decisions (P5-059), so the student
// (and, via a context adapter, the AI Teacher) can learn that their
// difficulty just changed and why.
//
// Security rules:
//   - studentId is always sourced from the verified JWT (controller/adapter
//     layer). Clients cannot supply a studentId to override ownership.
//   - Read-only. No AIM-owned value may be written through this path.
//   - This service never proxies a live AIM Engine call; it returns only
//     the last-validated-persisted decision.
//   - No secrets, service-role keys, database credentials, or AI provider
//     keys are stored or logged here.

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface DifficultyDecisionEntry {
  readonly skillId: string;
  readonly currentDifficulty: number;
  readonly previousDifficulty: number;
  readonly rationale: string;
  readonly basedOnAttemptIds: string[];
  readonly decidedAt: string;
  readonly updatedAt: string;
}

export interface DifficultyDecisionReadResponse {
  readonly studentId: string;
  readonly found: boolean;
  readonly difficultyDecision: DifficultyDecisionEntry | null;
}

// ---------------------------------------------------------------------------
// Internal DB row shape
// ---------------------------------------------------------------------------

interface DifficultyDecisionRow {
  readonly skill_id: string;
  readonly current_difficulty: number;
  readonly previous_difficulty: number;
  readonly rationale: string;
  readonly based_on_attempt_ids: string[];
  readonly decided_at: string;
  readonly updated_at: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class DifficultyDecisionReadService {
  private readonly logger = new Logger(DifficultyDecisionReadService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Return the student's most recent persisted difficulty decision,
   * optionally filtered to a specific skill.
   *
   * Returns found: false (difficultyDecision: null) when no decision has
   * been persisted yet for this student (or skill). No AIM Engine call is
   * made. studentId must be JWT-resolved by the caller — never accepted
   * from a client payload.
   */
  async getLatestForStudent(
    studentId: string,
    skillId?: string,
  ): Promise<DifficultyDecisionReadResponse> {
    const params: unknown[] = [studentId];
    let skillFilter = '';
    if (skillId) {
      params.push(skillId);
      skillFilter = ` AND skill_id = $${params.length}`;
    }

    const result = await this.db.query<DifficultyDecisionRow>(
      `SELECT
         skill_id,
         current_difficulty,
         previous_difficulty,
         rationale,
         based_on_attempt_ids,
         decided_at,
         updated_at
       FROM difficulty_decisions
       WHERE student_id = $1${skillFilter}
       ORDER BY decided_at DESC
       LIMIT 1`,
      params,
    );

    const row = result.rows[0];

    this.logger.debug('difficulty_decision_read', {
      studentId,
      skillId,
      found: !!row,
    });

    if (!row) {
      return { studentId, found: false, difficultyDecision: null };
    }

    return {
      studentId,
      found: true,
      difficultyDecision: {
        skillId: row.skill_id,
        currentDifficulty: row.current_difficulty,
        previousDifficulty: row.previous_difficulty,
        rationale: row.rationale,
        basedOnAttemptIds: row.based_on_attempt_ids,
        decidedAt: row.decided_at,
        updatedAt: row.updated_at,
      },
    };
  }
}
