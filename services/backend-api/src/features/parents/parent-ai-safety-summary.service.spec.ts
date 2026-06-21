// P18-071: Create Parent AI Safety Summary UI (backend)
// ParentAiSafetySummaryService unit tests.

import { ForbiddenException } from '@nestjs/common';

import { ParentAiSafetySummaryService } from './parent-ai-safety-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';

function buildService(overrides: {
  assertAccess?: jest.Mock;
  chatRejectedCount?: number;
  voiceRejectedCount?: number;
} = {}) {
  const parentAccessPolicyService = {
    assertAccess: overrides.assertAccess ?? jest.fn().mockResolvedValue(undefined),
  };

  const aiSafetyEventRepository = {
    countRejectedByStudentId: jest.fn().mockResolvedValue(overrides.chatRejectedCount ?? 0),
  };

  const voiceSafetyEventRepository = {
    countRejectedByStudentId: jest.fn().mockResolvedValue(overrides.voiceRejectedCount ?? 0),
  };

  const service = new ParentAiSafetySummaryService(
    parentAccessPolicyService as never,
    aiSafetyEventRepository as never,
    voiceSafetyEventRepository as never,
  );

  return { service, parentAccessPolicyService, aiSafetyEventRepository, voiceSafetyEventRepository };
}

describe('ParentAiSafetySummaryService', () => {
  it('verifies activity_view access before reading any safety event data', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getAiSafetySummaryForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'activity_view',
    );
  });

  it('propagates ForbiddenException from the access policy and never queries safety event data', async () => {
    const { service, aiSafetyEventRepository, voiceSafetyEventRepository } = buildService({
      assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')),
    });

    await expect(service.getAiSafetySummaryForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(aiSafetyEventRepository.countRejectedByStudentId).not.toHaveBeenCalled();
    expect(voiceSafetyEventRepository.countRejectedByStudentId).not.toHaveBeenCalled();
  });

  it('sums blocked text chat and voice interactions for the child', async () => {
    const { service } = buildService({ chatRejectedCount: 3, voiceRejectedCount: 2 });

    const summary = await service.getAiSafetySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.childId).toBe(CHILD_ID);
    expect(summary.blockedInteractionCount).toBe(5);
    expect(typeof summary.retrievedAt).toBe('string');
  });

  it('returns zero when there are no blocked interactions', async () => {
    const { service } = buildService();

    const summary = await service.getAiSafetySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary.blockedInteractionCount).toBe(0);
  });

  it('never includes the rejected raw content or reason-category taxonomy in the summary entity', async () => {
    const { service } = buildService({ chatRejectedCount: 1 });

    const summary = await service.getAiSafetySummaryForParent(PARENT_ID, CHILD_ID);

    expect(summary).not.toHaveProperty('reasonCategory');
    expect(summary).not.toHaveProperty('transcript');
    expect(summary).not.toHaveProperty('messages');
  });
});
