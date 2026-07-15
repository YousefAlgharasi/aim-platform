// P4-052: PlacementAttemptTimerService unit tests.
//
// Coverage:
//   - No expires_at (legacy/untimed) -> no-op.
//   - expires_at in the future -> no-op.
//   - expires_at in the past -> auto-submits the attempt and throws
//     ATTEMPT_EXPIRED.

import { HttpStatus } from '@nestjs/common';
import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { PlacementAttemptTimerService } from './placement-attempt-timer.service';
import { PlacementErrorCode } from './placement-error-codes';

function makeDb(): jest.Mocked<Pick<DatabaseService, 'query'>> {
  return {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 } as unknown as QueryResult),
  };
}

describe('PlacementAttemptTimerService', () => {
  it('does nothing when expiresAt is null', async () => {
    const db = makeDb();
    const svc = new PlacementAttemptTimerService(db as unknown as DatabaseService);
    await expect(svc.assertNotExpired('attempt-1', null)).resolves.toBeUndefined();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('does nothing when expiresAt is in the future', async () => {
    const db = makeDb();
    const svc = new PlacementAttemptTimerService(db as unknown as DatabaseService);
    const future = new Date(Date.now() + 60_000).toISOString();
    await expect(svc.assertNotExpired('attempt-1', future)).resolves.toBeUndefined();
    expect(db.query).not.toHaveBeenCalled();
  });

  it('auto-submits and throws ATTEMPT_EXPIRED when expiresAt has passed', async () => {
    const db = makeDb();
    const svc = new PlacementAttemptTimerService(db as unknown as DatabaseService);
    const past = new Date(Date.now() - 60_000).toISOString();

    await expect(svc.assertNotExpired('attempt-1', past)).rejects.toMatchObject({
      code: PlacementErrorCode.ATTEMPT_EXPIRED,
      statusCode: HttpStatus.CONFLICT,
    } satisfies Partial<AppError>);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("SET status = 'submitted'"),
      ['attempt-1'],
    );
  });
});
