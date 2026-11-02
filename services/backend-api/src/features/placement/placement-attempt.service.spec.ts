import { AppError } from '../../common/errors/app-error';
import { PlacementAttemptService } from './placement-attempt.service';
import { PlacementErrorCode } from './placement-error-codes';

function build(eligibility: { allowed: boolean; errorCode?: string; nextEligibleAt?: string }) {
  const attemptRow = {
    id: 'att-new', student_id: 's1', placement_test_id: 't1', status: 'active', started_at: 'now',
    submitted_at: null, completed_at: null, created_at: 'now', updated_at: 'now',
    duration_seconds: 2700, expires_at: 'later',
  };
  const db = {
    query: jest.fn(async (sql: string) => {
      if (sql.includes('FROM placement_tests')) return { rowCount: 1, rows: [{ id: 't1' }] };
      if (sql.includes("SET status = 'abandoned'")) return { rows: [{ id: 'att-old' }] };
      if (sql.includes('INSERT INTO placement_attempts')) return { rows: [attemptRow] };
      return { rows: [], rowCount: 0 };
    }),
  };
  const audit = { logAttemptStarted: jest.fn().mockResolvedValue(undefined) };
  const analytics = {
    recordAttemptStarted: jest.fn().mockResolvedValue(undefined),
    recordAttemptAbandoned: jest.fn().mockResolvedValue(undefined),
  };
  const retake = {
    checkEligibility: jest.fn().mockResolvedValue(eligibility),
    enforceRetakePolicy: jest.fn().mockRejectedValue(
      new AppError({ code: eligibility.errorCode ?? 'X', message: 'not eligible', statusCode: 409 }),
    ),
  };
  return { svc: new PlacementAttemptService(db as any, audit as any, analytics as any, retake as any), db, retake };
}

describe('PlacementAttemptService.startAttempt retake policy', () => {
  it('starts a first attempt', async () => {
    const { svc } = build({ allowed: true });
    await expect(svc.startAttempt('s1')).resolves.toMatchObject({ id: 'att-new', status: 'active' });
  });

  it('blocks a retake during the cooldown after a COMPLETED attempt', async () => {
    const { svc, db } = build({ allowed: false, errorCode: PlacementErrorCode.RETAKE_COOLDOWN_ACTIVE, nextEligibleAt: 'tomorrow' });
    await expect(svc.startAttempt('s1')).rejects.toMatchObject({ code: PlacementErrorCode.RETAKE_COOLDOWN_ACTIVE });
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO placement_attempts'))).toBe(false);
  });

  it('blocks starting while a submission is still being scored', async () => {
    const { svc } = build({ allowed: false, errorCode: PlacementErrorCode.SUBMISSION_PENDING });
    await expect(svc.startAttempt('s1')).rejects.toMatchObject({ code: PlacementErrorCode.SUBMISSION_PENDING });
  });

  it('still lets a student restart an attempt that is in progress', async () => {
    const { svc, retake } = build({ allowed: false, errorCode: PlacementErrorCode.ACTIVE_ATTEMPT_EXISTS });
    await expect(svc.startAttempt('s1')).resolves.toMatchObject({ id: 'att-new' });
    expect(retake.enforceRetakePolicy).not.toHaveBeenCalled();
  });
});
