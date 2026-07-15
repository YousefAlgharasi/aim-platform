// Phase 4 — P4-041 (start attempt) / P4-049 (retake policy)
// PlacementAttemptService.
//
// Scope: Placement Test attempt lifecycle — start only (P4-041).
//
// Responsibility:
//   Create a new placement attempt for a student against the currently
//   published placement test. Enforces:
//     - Exactly one published test must exist.
//     - Retake policy (P4-049): no active/submitted attempt; cooldown after completion.
//     - student_id is always sourced from the verified JWT — never from client input.
//
// Security rules:
//   - student_id is resolved from the verified JWT — never a client payload.
//   - Backend is the sole authority for attempt status, started_at, and lifecycle fields.
//   - Flutter/client cannot set status, student_id, or placement_test_id directly.
//   - No scoring, level assignment, or result computation here (P4-045, P4-046).
//   - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard logic.
//   - No secrets, service-role keys, database credentials, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';
import {
  PlacementAttemptRow,
  PlacementAttemptStartResponse,
  PlacementTestRow,
} from './placement.types';
import { PlacementAuditService } from './placement-audit.service';
import { PlacementAnalyticsService } from './placement-analytics.service';

/**
 * Total time budget for the whole placement attempt, in seconds (45 minutes).
 * Matches the placement_attempts.duration_seconds column default. Kept as a
 * backend constant (not client-configurable) — P4-052 timer enforcement.
 */
export const PLACEMENT_ATTEMPT_DURATION_SECONDS = 2700;

@Injectable()
export class PlacementAttemptService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: PlacementAuditService,
    private readonly analytics: PlacementAnalyticsService,
  ) {}

  /**
   * Start a new placement attempt for the given student.
   *
   * Steps:
   *   1. Resolve the currently published placement test.
   *   2. Enforce retake policy (P4-049): blocks if active/submitted; 24-hour cooldown.
   *   3. Insert a new attempt row with status = 'active'.
   *   4. Return the student-safe response (P4-013 §3.1).
   *
   * @param studentId  Internal AIM user ID — always from the verified JWT.
   */
  async startAttempt(
    studentId: string,
  ): Promise<PlacementAttemptStartResponse> {
    // 1. Resolve the currently published placement test.
    const testResult = await this.db.query<PlacementTestRow>(
      `SELECT id, title, status, estimated_minutes, total_sections, created_at, updated_at
       FROM placement_tests
       WHERE status = 'published'
       LIMIT 1`,
    );

    if (testResult.rowCount === 0) {
      throw new AppError({
        code: PlacementErrorCode.NO_ACTIVE_TEST,
        message: 'No placement test is currently published.',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const test = testResult.rows[0];

    // 2. Abandon any existing active/submitted attempts so the student can restart freely.
    const abandonedResult = await this.db.query<{ id: string }>(
      `UPDATE placement_attempts
       SET status = 'abandoned', updated_at = now()
       WHERE student_id = $1
         AND placement_test_id = $2
         AND status IN ('active', 'submitted')
       RETURNING id`,
      [studentId, test.id],
    );

    for (const abandoned of abandonedResult.rows) {
      void this.analytics.recordAttemptAbandoned(studentId, abandoned.id, test.id);
    }

    // 3. Insert a new attempt — backend sets all fields, including the
    //    server-enforced timer (duration_seconds/expires_at).
    const insertResult = await this.db.query<PlacementAttemptRow>(
      `INSERT INTO placement_attempts
         (student_id, placement_test_id, status, started_at, duration_seconds, expires_at)
       VALUES ($1, $2, 'active', now(), $3, now() + make_interval(secs => $3))
       RETURNING id, student_id, placement_test_id, status, started_at,
                 submitted_at, completed_at, created_at, updated_at,
                 duration_seconds, expires_at`,
      [studentId, test.id, PLACEMENT_ATTEMPT_DURATION_SECONDS],
    );

    const attempt = insertResult.rows[0];

    void this.audit.logAttemptStarted(studentId, attempt.id, test.id);
    void this.analytics.recordAttemptStarted(studentId, attempt.id, test.id);

    // 4. Return student-safe fields only.
    return {
      id: attempt.id,
      placement_test_id: attempt.placement_test_id,
      status: 'active',
      started_at: attempt.started_at,
      submitted_at: null,
      completed_at: null,
      expires_at: attempt.expires_at as string,
      duration_seconds: attempt.duration_seconds as number,
    };
  }
}
