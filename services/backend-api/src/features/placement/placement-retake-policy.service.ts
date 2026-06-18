// Phase 4 — P4-049
// PlacementRetakePolicyService.
//
// Scope: Placement Test retake restriction only.
//
// Responsibility:
//   Enforce backend rules that prevent abusive or inconsistent repeated placement
//   attempts. This service is called by PlacementAttemptService (P4-041) during
//   the attempt-start flow, before a new attempt is created.
//
// Retake rules (Phase 4):
//
//   Rule 1 — No active attempt:
//     A student may not start a new attempt while they have an existing attempt
//     with status = 'active'. (Already enforced by P4-041 and the DB partial
//     unique index — restated here for clarity.)
//
//   Rule 2 — Cooldown after completion:
//     A student may not start a new attempt within RETAKE_COOLDOWN_HOURS after
//     their most recently completed attempt. This prevents rapid repeated testing
//     and ensures the initial learning path has time to be meaningful.
//
//     Default cooldown: 24 hours (backend config constant — not stored in DB,
//     not exposed to Flutter or any client).
//
//   Rule 3 — No abandoned attempt blocking:
//     An abandoned attempt (status = 'abandoned') does not block a new attempt.
//     Only completed attempts trigger the cooldown.
//
//   Rule 4 — Submitted attempts:
//     An attempt in 'submitted' status is being processed. A new attempt is not
//     allowed while a submission is pending — treated as active for blocking.
//
// Security rules:
//   - studentId is always from the verified JWT — never from client input.
//   - Cooldown duration is a backend constant — never stored in DB and never
//     returned to Flutter or any client.
//   - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';

/** Cooldown in hours after a completed attempt before a retake is allowed. */
const RETAKE_COOLDOWN_HOURS = 24;

/** Statuses that block starting a new attempt. */
const BLOCKING_STATUSES = ['active', 'submitted'] as const;

interface AttemptCheckRow {
  readonly id: string;
  readonly status: string;
  readonly completed_at: string | null;
}

/** Result of a retake eligibility check. */
export interface RetakeEligibilityResult {
  readonly allowed: boolean;
  /** ISO timestamp when the student is next eligible (only set when allowed = false due to cooldown). */
  readonly nextEligibleAt?: string;
  /** Error code to surface if not allowed. */
  readonly errorCode?: string;
}

@Injectable()
export class PlacementRetakePolicyService {
  private readonly logger = new Logger(PlacementRetakePolicyService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Check whether a student is eligible to start a new placement attempt.
   *
   * Enforced rules:
   *   1. No attempt with status 'active' or 'submitted' exists.
   *   2. No completed attempt within RETAKE_COOLDOWN_HOURS.
   *
   * @param studentId      Internal student ID — always from verified JWT.
   * @param placementTestId  UUID of the published placement test.
   * @throws AppError with code PLACEMENT_RETAKE_NOT_ALLOWED if blocked.
   */
  async enforceRetakePolicy(
    studentId: string,
    placementTestId: string,
  ): Promise<void> {
    const eligibility = await this.checkEligibility(studentId, placementTestId);

    if (!eligibility.allowed) {
      const detail =
        eligibility.nextEligibleAt
          ? ` You may retake after ${eligibility.nextEligibleAt}.`
          : '';

      throw new AppError({
        code: eligibility.errorCode ?? 'PLACEMENT_RETAKE_NOT_ALLOWED',
        message: `You are not eligible to start a new placement attempt.${detail}`,
        statusCode: HttpStatus.CONFLICT,
      });
    }
  }

  /**
   * Check retake eligibility without throwing — useful for status queries.
   *
   * @param studentId       Internal student ID from verified JWT.
   * @param placementTestId UUID of the published placement test.
   */
  async checkEligibility(
    studentId: string,
    placementTestId: string,
  ): Promise<RetakeEligibilityResult> {
    // -----------------------------------------------------------------------
    // Fetch the student's most recent non-abandoned attempt for this test.
    // -----------------------------------------------------------------------
    const attemptResult = await this.db.query<AttemptCheckRow>(
      `SELECT id, status, completed_at
       FROM placement_attempts
       WHERE student_id = $1
         AND placement_test_id = $2
         AND status != 'abandoned'
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId, placementTestId],
    );

    if ((attemptResult.rowCount ?? 0) === 0) {
      // No prior attempt — eligible.
      return { allowed: true };
    }

    const latest = attemptResult.rows[0];

    // -----------------------------------------------------------------------
    // Rule 1: Block if attempt is active or submitted.
    // -----------------------------------------------------------------------
    if ((BLOCKING_STATUSES as readonly string[]).includes(latest.status)) {
      this.logger.log(
        `RetakePolicyService: student ${studentId} blocked — attempt ${latest.id} is ${latest.status}`,
      );
      return {
        allowed: false,
        errorCode:
          latest.status === 'active'
            ? 'ACTIVE_ATTEMPT_EXISTS'
            : 'SUBMISSION_PENDING',
      };
    }

    // -----------------------------------------------------------------------
    // Rule 2: Cooldown after completion.
    //   Only 'completed' status triggers cooldown — 'abandoned' is ignored.
    // -----------------------------------------------------------------------
    if (latest.status === 'completed' && latest.completed_at) {
      const completedAt = new Date(latest.completed_at);
      const cooldownEnd = new Date(
        completedAt.getTime() + RETAKE_COOLDOWN_HOURS * 60 * 60 * 1000,
      );
      const now = new Date();

      if (now < cooldownEnd) {
        this.logger.log(
          `RetakePolicyService: student ${studentId} blocked — cooldown until ${cooldownEnd.toISOString()}`,
        );
        return {
          allowed: false,
          nextEligibleAt: cooldownEnd.toISOString(),
          errorCode: 'PLACEMENT_RETAKE_NOT_ALLOWED',
        };
      }
    }

    // Cooldown elapsed or no completed attempt — eligible.
    return { allowed: true };
  }
}
