// P12-029: Create Parent Activity Summary Service
// ParentActivitySummaryService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentActivitySummaryService } from './parent-activity-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertAccess?: jest.Mock;
  sessions?: Array<Record<string, unknown>>;
} = {}) {
  const parentAccessPolicyService = {
    assertAccess: overrides.assertAccess ?? jest.fn().mockResolvedValue(undefined),
  };

  const sessionStateReadService = {
    getRecentSessionsForStudent: jest.fn().mockResolvedValue({
      studentId: CHILD_ID,
      sessions: overrides.sessions ?? [],
    }),
  };

  const service = new ParentActivitySummaryService(
    parentAccessPolicyService as never,
    sessionStateReadService as never,
  );

  return { service, parentAccessPolicyService, sessionStateReadService };
}

describe('ParentActivitySummaryService', () => {
  it('verifies progress_view access before reading any activity data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'progress_view',
    );
  });

  it('propagates ForbiddenException from the access policy and never queries session data', async () => {
    const { service, sessionStateReadService } = buildService({
      assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')),
    });

    await expect(service.getActivitySummaryForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(sessionStateReadService.getRecentSessionsForStudent).not.toHaveBeenCalled();
  });

  it('requests recent sessions for the child with the default limit', async () => {
    const { service, sessionStateReadService } = buildService();

    await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);

    expect(sessionStateReadService.getRecentSessionsForStudent).toHaveBeenCalledWith(CHILD_ID, 10);
  });

  it('maps recent sessions into the activity summary entity', async () => {
    const { service } = buildService({
      sessions: [
        {
          sessionId: 'session-1',
          itemsAttempted: 5,
          itemsCorrect: 4,
          skillsTouched: ['skill-1'],
          overallMasteryShift: 'positive',
          closedOutAt: '2026-06-17T10:30:05.000Z',
          updatedAt: '2026-06-17T10:30:05.000Z',
        },
      ],
    });

    const summary = await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.childId).toBe(CHILD_ID);
    expect(summary.recentSessions).toEqual([
      {
        sessionId: 'session-1',
        itemsAttempted: 5,
        itemsCorrect: 4,
        skillsTouched: ['skill-1'],
        overallMasteryShift: 'positive',
        closedOutAt: '2026-06-17T10:30:05.000Z',
        updatedAt: '2026-06-17T10:30:05.000Z',
      },
    ]);
    expect(typeof summary.retrievedAt).toBe('string');
  });

  it('sets lastActiveAt to the most recent session updatedAt', async () => {
    const { service } = buildService({
      sessions: [
        {
          sessionId: 'session-1',
          itemsAttempted: 5,
          itemsCorrect: 4,
          skillsTouched: ['skill-1'],
          overallMasteryShift: 'positive',
          closedOutAt: null,
          updatedAt: '2026-06-17T10:30:05.000Z',
        },
      ],
    });

    const summary = await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.lastActiveAt).toBe('2026-06-17T10:30:05.000Z');
  });

  it('returns empty sessions and null lastActiveAt when no activity exists', async () => {
    const { service } = buildService();

    const summary = await service.getActivitySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.recentSessions).toEqual([]);
    expect(summary.lastActiveAt).toBeNull();
  });
});
