// P18-070: Create Parent AI Read-Only Summary UI (backend)
// ParentAiUsageSummaryService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentAiUsageSummaryService } from './parent-ai-usage-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertAccess?: jest.Mock;
  textChatSessions?: Array<Record<string, unknown>>;
  voiceSessions?: Array<Record<string, unknown>>;
} = {}) {
  const parentAccessPolicyService = {
    assertAccess: overrides.assertAccess ?? jest.fn().mockResolvedValue(undefined),
  };

  const aiChatSessionRepository = {
    findByStudentId: jest.fn().mockResolvedValue(overrides.textChatSessions ?? []),
  };

  const voiceSessionRepository = {
    findByStudentId: jest.fn().mockResolvedValue(overrides.voiceSessions ?? []),
  };

  const service = new ParentAiUsageSummaryService(
    parentAccessPolicyService as never,
    aiChatSessionRepository as never,
    voiceSessionRepository as never,
  );

  return { service, parentAccessPolicyService, aiChatSessionRepository, voiceSessionRepository };
}

describe('ParentAiUsageSummaryService', () => {
  it('verifies activity_view access before reading any AI usage data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getAiUsageSummaryForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'activity_view',
    );
  });

  it('propagates ForbiddenException from the access policy and never queries session data', async () => {
    const { service, aiChatSessionRepository, voiceSessionRepository } = buildService({
      assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')),
    });

    await expect(service.getAiUsageSummaryForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(aiChatSessionRepository.findByStudentId).not.toHaveBeenCalled();
    expect(voiceSessionRepository.findByStudentId).not.toHaveBeenCalled();
  });

  it('counts text chat and voice sessions for the child', async () => {
    const { service } = buildService({
      textChatSessions: [
        { id: 's1', updated_at: '2026-06-17T10:00:00.000Z' },
        { id: 's2', updated_at: '2026-06-18T10:00:00.000Z' },
      ],
      voiceSessions: [{ id: 'v1', updated_at: '2026-06-19T10:00:00.000Z' }],
    });

    const summary = await service.getAiUsageSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.childId).toBe(CHILD_ID);
    expect(summary.textChatSessionCount).toBe(2);
    expect(summary.voiceSessionCount).toBe(1);
    expect(summary.lastActivityAt).toBe('2026-06-19T10:00:00.000Z');
    expect(typeof summary.retrievedAt).toBe('string');
  });

  it('returns zero counts and null lastActivityAt when there is no AI usage', async () => {
    const { service } = buildService();

    const summary = await service.getAiUsageSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.textChatSessionCount).toBe(0);
    expect(summary.voiceSessionCount).toBe(0);
    expect(summary.lastActivityAt).toBeNull();
  });

  it('never includes conversation/voice content or safety taxonomy in the summary entity', async () => {
    const { service } = buildService({
      textChatSessions: [{ id: 's1', updated_at: '2026-06-17T10:00:00.000Z' }],
    });

    const summary = await service.getAiUsageSummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary).not.toHaveProperty('transcript');
    expect(summary).not.toHaveProperty('messages');
    expect(summary).not.toHaveProperty('reasonCategory');
  });
});
