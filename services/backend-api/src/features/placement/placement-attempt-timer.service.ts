// P4-052: PlacementAttemptTimerService.
//
// Scope: Server-side enforcement of the placement attempt countdown timer.
//
// Responsibility:
//   Every write path that touches an active attempt (answer submission,
//   writing/speaking submission, completion) must call
//   `assertNotExpired` first. If the attempt's `expires_at` has passed while
//   it is still 'active', this auto-completes it (status -> 'submitted',
//   submitted_at = now()) so a lingering client can never sneak in more
//   answers after time is up, then rejects the call with ATTEMPT_EXPIRED.
//
// Security rules:
//   - Backend is the sole authority for expiry — the client's countdown is
//     a display concern only and is never trusted for enforcement.
//   - No secrets, service-role keys, or privileged config here.

import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementErrorCode } from './placement-error-codes';

@Injectable()
export class PlacementAttemptTimerService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Throws ATTEMPT_EXPIRED (409) if the given active attempt's expires_at
   * has already passed. As a side effect, auto-completes (submits) the
   * attempt so it can no longer accept further answers.
   *
   * No-op (does not throw) if expires_at is null (legacy/untimed attempts)
   * or in the future.
   */
  async assertNotExpired(attemptId: string, expiresAt: string | null | undefined): Promise<void> {
    if (!expiresAt) {
      return;
    }

    if (new Date(expiresAt).getTime() > Date.now()) {
      return;
    }

    await this.db.query(
      `UPDATE placement_attempts
       SET status = 'submitted', submitted_at = now(), updated_at = now()
       WHERE id = $1 AND status = 'active'`,
      [attemptId],
    );

    throw new AppError({
      code: PlacementErrorCode.ATTEMPT_EXPIRED,
      message: 'Placement attempt time limit has been reached. The attempt was auto-submitted.',
      statusCode: HttpStatus.CONFLICT,
    });
  }
}
