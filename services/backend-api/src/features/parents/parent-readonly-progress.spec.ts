// P12-044: Add Parent Read-Only Progress Tests
// Verifies that ParentChildProgressService and ParentActivitySummaryService
// (the parent dashboard's progress/skill/weakness/recommendation/activity
// surface) never call a write/mutate operation on the underlying AIM read
// services, and never persist any value back. Parent dashboard access is
// strictly read-only — mastery, weaknesses, recommendations, review
// schedules, and AIM outputs are computed and owned exclusively by the
// Phase 5 AIM pipeline.

import { ParentChildProgressService } from './parent-child-progress.service';
import { ParentActivitySummaryService } from './parent-activity-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

/**
 * Wraps a plain object in a Proxy that only permits invoking methods whose
 * names are in `allowedMethods`. Any other method call (e.g. an `update*`,
 * `save*`, `set*`, `delete*`, or `write*` call accidentally introduced into
 * a parent-facing service) throws immediately, failing the test.
 */
function readOnlyProxy<T extends object>(target: T, allowedMethods: readonly string[]): T {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);

      if (typeof value !== 'function') {
        return value;
      }

      if (!allowedMethods.includes(prop as string)) {
        throw new Error(`Unexpected mutating/unlisted call: ${String(prop)}`);
      }

      return value;
    },
  });
}

describe('Parent dashboard progress/activity surface is strictly read-only', () => {
  describe('ParentChildProgressService', () => {
    function buildService() {
      const parentAccessPolicyService = readOnlyProxy(
        { assertAccess: jest.fn().mockResolvedValue(undefined) },
        ['assertAccess'],
      );
      const studentSkillStateReadService = readOnlyProxy(
        {
          getSkillStatesForStudent: jest.fn().mockResolvedValue({ studentId: CHILD_ID, skillStates: [] }),
        },
        ['getSkillStatesForStudent'],
      );
      const weaknessRecordsReadService = readOnlyProxy(
        {
          getWeaknessRecordsForStudent: jest
            .fn()
            .mockResolvedValue({ studentId: CHILD_ID, weaknessRecords: [] }),
        },
        ['getWeaknessRecordsForStudent'],
      );
      const recommendationReadService = readOnlyProxy(
        {
          getActiveForStudent: jest.fn().mockResolvedValue({ studentId: CHILD_ID, recommendations: [] }),
        },
        ['getActiveForStudent'],
      );
      const reviewScheduleReadService = readOnlyProxy(
        {
          getReviewSchedulesForStudent: jest
            .fn()
            .mockResolvedValue({ studentId: CHILD_ID, reviewSchedules: [] }),
        },
        ['getReviewSchedulesForStudent'],
      );

      return new ParentChildProgressService(
        parentAccessPolicyService as never,
        studentSkillStateReadService as never,
        weaknessRecordsReadService as never,
        recommendationReadService as never,
        reviewScheduleReadService as never,
      );
    }

    it('only ever calls read-prefixed accessors on the AIM result services', async () => {
      const service = buildService();

      await expect(service.getProgressForParent(PARENT_ID, CHILD_ID)).resolves.toBeDefined();
    });

    it('produces a result that is plain serializable data with no mutator methods attached', async () => {
      const service = buildService();

      const progress = await service.getProgressForParent(PARENT_ID, CHILD_ID);
      const roundTripped = JSON.parse(JSON.stringify(progress));

      expect(roundTripped).toEqual(progress);
      expect(Object.values(progress).every((value) => typeof value !== 'function')).toBe(true);
    });

    it('returns an identical, non-mutated snapshot across repeated calls (no hidden state)', async () => {
      const service = buildService();

      const first = await service.getProgressForParent(PARENT_ID, CHILD_ID);
      const second = await service.getProgressForParent(PARENT_ID, CHILD_ID);

      expect(first.skillStates).toEqual(second.skillStates);
      expect(first.weaknesses).toEqual(second.weaknesses);
      expect(first.recommendations).toEqual(second.recommendations);
      expect(first.reviewSchedules).toEqual(second.reviewSchedules);
    });
  });

  describe('ParentActivitySummaryService', () => {
    function buildService() {
      const parentAccessPolicyService = readOnlyProxy(
        { assertAccess: jest.fn().mockResolvedValue(undefined) },
        ['assertAccess'],
      );
      const sessionStateReadService = readOnlyProxy(
        {
          getRecentSessionsForStudent: jest.fn().mockResolvedValue({ studentId: CHILD_ID, sessions: [] }),
        },
        ['getRecentSessionsForStudent'],
      );

      return new ParentActivitySummaryService(
        parentAccessPolicyService as never,
        sessionStateReadService as never,
      );
    }

    it('only ever calls the read accessor on the session state read service', async () => {
      const service = buildService();

      await expect(service.getActivitySummaryForParent(PARENT_ID, CHILD_ID)).resolves.toBeDefined();
    });

    it('produces a plain serializable result with no mutator methods attached', async () => {
      const service = buildService();

      const summary = await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);
      const roundTripped = JSON.parse(JSON.stringify(summary));

      expect(roundTripped).toEqual(summary);
    });
  });
});
