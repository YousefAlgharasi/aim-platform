// P12-027: Create Parent Child Progress Service
// ParentChildProgressService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentChildProgressService } from './parent-child-progress.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertAccess?: jest.Mock;
  skillStates?: Array<Record<string, unknown>>;
  weaknessRecords?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  reviewSchedules?: Array<Record<string, unknown>>;
} = {}) {
  const parentAccessPolicyService = {
    assertAccess: overrides.assertAccess ?? jest.fn().mockResolvedValue(undefined),
  };
  const studentSkillStateReadService = {
    getSkillStatesForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      skillStates: overrides.skillStates ?? [],
    }),
  };
  const weaknessRecordsReadService = {
    getWeaknessRecordsForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      weaknessRecords: overrides.weaknessRecords ?? [],
    }),
  };
  const recommendationReadService = {
    getActiveForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      recommendations: overrides.recommendations ?? [],
    }),
  };
  const reviewScheduleReadService = {
    getReviewSchedulesForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      reviewSchedules: overrides.reviewSchedules ?? [],
    }),
  };

  const service = new ParentChildProgressService(
    parentAccessPolicyService as never,
    studentSkillStateReadService as never,
    weaknessRecordsReadService as never,
    recommendationReadService as never,
    reviewScheduleReadService as never,
  );

  return {
    service,
    parentAccessPolicyService,
    studentSkillStateReadService,
    weaknessRecordsReadService,
    recommendationReadService,
    reviewScheduleReadService,
  };
}

describe('ParentChildProgressService', () => {
  it('verifies progress_view access before reading any progress data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getProgressForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'progress_view',
    );
  });

  it('propagates ForbiddenException from the access policy and never queries read services', async () => {
    const { service, studentSkillStateReadService } = buildService({
      assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')),
    });

    await expect(service.getProgressForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(studentSkillStateReadService.getSkillStatesForStudent).not.toHaveBeenCalled();
  });

  it('maps skill states, weaknesses, recommendations, and review schedules into the progress entity', async () => {
    const { service } = buildService({
      skillStates: [
        {
          skillId: 'skill-1',
          masteryScore: 0.8,
          masteryConfidence: 0.9,
          masteryTrend: 'improving',
          lastEvaluatedAt: '2026-06-01T00:00:00.000Z',
        },
      ],
      weaknessRecords: [
        {
          weaknessId: 'weak-1',
          skillId: 'skill-1',
          severity: 'medium',
          status: 'open',
          detectedAt: '2026-05-01T00:00:00.000Z',
          resolvedAt: null,
        },
      ],
      recommendations: [
        {
          id: 'rec-1',
          kind: 'lesson',
          targetSkillId: 'skill-1',
          rank: 1,
          reason: 'low mastery',
          generatedAt: '2026-06-01T00:00:00.000Z',
          status: 'active',
        },
      ],
      reviewSchedules: [
        {
          scheduleId: 'rs-1',
          skillId: 'skill-1',
          dueAt: '2026-07-01T00:00:00.000Z',
          status: 'pending',
        },
      ],
    });

    const progress = await service.getProgressForParent(PARENT_ID, CHILD_ID);

    expect(progress.childId).toBe(CHILD_ID);
    expect(progress.skillStates).toEqual([
      {
        skillId: 'skill-1',
        masteryScore: 0.8,
        masteryConfidence: 0.9,
        masteryTrend: 'improving',
        lastEvaluatedAt: '2026-06-01T00:00:00.000Z',
      },
    ]);
    expect(progress.weaknesses).toEqual([
      {
        weaknessId: 'weak-1',
        skillId: 'skill-1',
        severity: 'medium',
        status: 'open',
        detectedAt: '2026-05-01T00:00:00.000Z',
        resolvedAt: null,
      },
    ]);
    expect(progress.recommendations).toEqual([
      {
        id: 'rec-1',
        kind: 'lesson',
        targetSkillId: 'skill-1',
        rank: 1,
        reason: 'low mastery',
        generatedAt: '2026-06-01T00:00:00.000Z',
        status: 'active',
      },
    ]);
    expect(progress.reviewSchedules).toEqual([
      {
        scheduleId: 'rs-1',
        skillId: 'skill-1',
        dueAt: '2026-07-01T00:00:00.000Z',
        status: 'pending',
      },
    ]);
    expect(typeof progress.retrievedAt).toBe('string');
  });

  it('returns empty arrays when no progress data exists', async () => {
    const { service } = buildService();

    const progress = await service.getProgressForParent(PARENT_ID, CHILD_ID);

    expect(progress.skillStates).toEqual([]);
    expect(progress.weaknesses).toEqual([]);
    expect(progress.recommendations).toEqual([]);
    expect(progress.reviewSchedules).toEqual([]);
  });
});
