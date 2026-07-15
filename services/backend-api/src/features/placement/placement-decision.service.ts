// P4-052: PlacementDecisionService.
//
// Scope: First-login placement gate only.
//
// Responsibility:
//   Determine whether a student who has never taken a placement test and
//   has no learning progress should be shown the "Take the placement test"
//   vs "Start from scratch" gate, and persist their one-time choice so it
//   only shows once (student_profiles.placement_decision).
//
// Security rules:
//   - studentId is always the internal user id resolved from the verified
//     JWT — never from client input.
//   - Backend is the sole authority for whether the gate should show —
//     the client never decides this itself from local state alone.
//   - No secrets, service-role keys, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';

export type PlacementDecision = 'take_placement' | 'start_from_scratch';

export interface PlacementGateStatusResponse {
  /** True only when the student has never decided AND has no placement/progress signal yet. */
  readonly should_show_gate: boolean;
  readonly decision: PlacementDecision | null;
}

@Injectable()
export class PlacementDecisionService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Compute whether the first-login placement gate should be shown.
   *
   * should_show_gate is true only when ALL of:
   *   - the student has not already recorded a placement_decision, AND
   *   - the student has never completed a placement attempt, AND
   *   - the student has no student_level_state row (no learning progress yet).
   */
  async getGateStatus(studentId: string): Promise<PlacementGateStatusResponse> {
    const profileResult = await this.db.query<{ placement_decision: PlacementDecision | null }>(
      `SELECT placement_decision FROM student_profiles WHERE user_id = $1 LIMIT 1`,
      [studentId],
    );

    const decision = profileResult.rows[0]?.placement_decision ?? null;
    if (decision) {
      return { should_show_gate: false, decision };
    }

    const completedAttempt = await this.db.query<{ id: string }>(
      `SELECT id FROM placement_attempts WHERE student_id = $1 AND status = 'completed' LIMIT 1`,
      [studentId],
    );
    if ((completedAttempt.rowCount ?? 0) > 0) {
      return { should_show_gate: false, decision: null };
    }

    const levelState = await this.db.query<{ student_id: string }>(
      `SELECT student_id FROM student_level_state WHERE student_id = $1 LIMIT 1`,
      [studentId],
    );
    if ((levelState.rowCount ?? 0) > 0) {
      return { should_show_gate: false, decision: null };
    }

    return { should_show_gate: true, decision: null };
  }

  /**
   * Persist the student's one-time placement gate choice. Idempotent: once
   * set, calling again overwrites it (e.g. support/admin correction) but the
   * gate itself will no longer be shown to the student regardless.
   */
  async setDecision(studentId: string, decision: PlacementDecision): Promise<PlacementGateStatusResponse> {
    if (decision !== 'take_placement' && decision !== 'start_from_scratch') {
      throw new AppError({
        code: PlacementErrorCode.INVALID_ANSWER_VALUE,
        message: `Invalid placement decision: "${decision}".`,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const updated = await this.db.query<{ placement_decision: PlacementDecision }>(
      `UPDATE student_profiles
       SET placement_decision = $2, updated_at = now()
       WHERE user_id = $1
       RETURNING placement_decision`,
      [studentId, decision],
    );

    if ((updated.rowCount ?? 0) === 0) {
      throw new AppError({
        code: PlacementErrorCode.ATTEMPT_NOT_FOUND,
        message: 'Student profile not found for the authenticated user.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    return { should_show_gate: false, decision: updated.rows[0].placement_decision };
  }
}
