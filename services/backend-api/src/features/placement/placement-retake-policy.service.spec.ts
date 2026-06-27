// Phase 4 — P4-052
// PlacementRetakePolicyService unit tests.
//
// Scope: Placement retake policy only.
//
// Coverage:
//   - No prior attempt → allowed
//   - Active attempt → blocked (ACTIVE_ATTEMPT_EXISTS)
//   - Submitted attempt → blocked (SUBMISSION_PENDING)
//   - Completed within cooldown → blocked (PLACEMENT_RETAKE_NOT_ALLOWED)
//   - Completed after cooldown → allowed
//   - Abandoned attempt → allowed (never blocks)
//   - enforceRetakePolicy throws AppError when blocked

import { HttpStatus } from '@nestjs/common';
import { QueryResult } from 'pg';
import { DatabaseService } from '../../database/database.service';
import { AppError } from '../../common/errors/app-error';
import { BackendConfigService } from '../../config/backend-config.service';
import { PlacementRetakePolicyService } from './placement-retake-policy.service';

const config = { placement: { retakeCooldownHours: 24 } };

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const STUDENT_ID = 'student-uuid-001';
const TEST_ID = 'test-uuid-001';

function makeDb(
  rows: Array<{ id: string; status: string; completed_at: string | null }>,
): jest.Mocked<Pick<DatabaseService, 'query'>> {
  return {
    query: jest.fn().mockResolvedValue({
      rows,
      rowCount: rows.length,
    } as unknown as QueryResult),
  };
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PlacementRetakePolicyService', () => {
  // -------------------------------------------------------------------------
  // checkEligibility
  // -------------------------------------------------------------------------

  describe('checkEligibility', () => {
    it('returns allowed=true when no prior attempt exists', async () => {
      const db = makeDb([]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(true);
    });

    it('returns allowed=false with ACTIVE_ATTEMPT_EXISTS when latest attempt is active', async () => {
      const db = makeDb([{ id: 'att-1', status: 'active', completed_at: null }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe('ACTIVE_ATTEMPT_EXISTS');
    });

    it('returns allowed=false with SUBMISSION_PENDING when latest attempt is submitted', async () => {
      const db = makeDb([{ id: 'att-2', status: 'submitted', completed_at: null }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe('SUBMISSION_PENDING');
    });

    it('returns allowed=false with cooldown error when completed within 24 hours', async () => {
      const completedAt = hoursAgo(12); // 12 hours ago — within 24h cooldown
      const db = makeDb([{ id: 'att-3', status: 'completed', completed_at: completedAt }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe('PLACEMENT_RETAKE_NOT_ALLOWED');
    });

    it('includes nextEligibleAt in result when blocked by cooldown', async () => {
      const completedAt = hoursAgo(12);
      const db = makeDb([{ id: 'att-4', status: 'completed', completed_at: completedAt }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.nextEligibleAt).toBeDefined();
      const nextEligible = new Date(result.nextEligibleAt!);
      expect(nextEligible.getTime()).toBeGreaterThan(Date.now());
    });

    it('returns allowed=true when completed more than 24 hours ago', async () => {
      const completedAt = hoursAgo(25); // 25 hours ago — cooldown elapsed
      const db = makeDb([{ id: 'att-5', status: 'completed', completed_at: completedAt }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(true);
    });

    it('returns allowed=true when latest attempt is abandoned', async () => {
      // Abandoned attempts must NOT block retakes (§Rule 3)
      // Note: abandoned is excluded by the query (status != 'abandoned'),
      // so the DB returns 0 rows — same as no prior attempt.
      const db = makeDb([]); // query excludes abandoned
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      const result = await svc.checkEligibility(STUDENT_ID, TEST_ID);
      expect(result.allowed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // enforceRetakePolicy
  // -------------------------------------------------------------------------

  describe('enforceRetakePolicy', () => {
    it('resolves without error when student is eligible', async () => {
      const db = makeDb([]); // no prior attempt
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      await expect(svc.enforceRetakePolicy(STUDENT_ID, TEST_ID)).resolves.toBeUndefined();
    });

    it('throws AppError when student has an active attempt', async () => {
      const db = makeDb([{ id: 'att-6', status: 'active', completed_at: null }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      await expect(svc.enforceRetakePolicy(STUDENT_ID, TEST_ID)).rejects.toMatchObject({
        statusCode: HttpStatus.CONFLICT,
      } satisfies Partial<AppError>);
    });

    it('throws AppError with CONFLICT status when blocked by cooldown', async () => {
      const db = makeDb([{ id: 'att-7', status: 'completed', completed_at: hoursAgo(2) }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      await expect(svc.enforceRetakePolicy(STUDENT_ID, TEST_ID)).rejects.toMatchObject({
        statusCode: HttpStatus.CONFLICT,
      } satisfies Partial<AppError>);
    });

    it('does not throw when completed attempt is outside cooldown', async () => {
      const db = makeDb([{ id: 'att-8', status: 'completed', completed_at: hoursAgo(26) }]);
      const svc = new PlacementRetakePolicyService(db as unknown as DatabaseService, config as unknown as BackendConfigService);
      await expect(svc.enforceRetakePolicy(STUDENT_ID, TEST_ID)).resolves.toBeUndefined();
    });
  });
});
