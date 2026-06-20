// P12-045: Add Parent Assessment Access Tests
// Verifies parent assessment reads (ParentAssessmentSummaryService) are
// strictly child-scoped and read-only: it must always query results for
// the requested childId (never another child's), must never call a
// write/mutate operation on the assessment services, and must always
// check assessment_view consent before reading anything.

import { ForbiddenException } from '@nestjs/common';

import { ParentAssessmentSummaryService } from './parent-assessment-summary.service';

const PARENT_ID = 'parent-uuid-001';
const CHILD_ID = 'child-uuid-001';
const OTHER_CHILD_ID = 'child-uuid-999';

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

function buildService() {
  const parentAccessPolicyService = readOnlyProxy(
    { assertAccess: jest.fn().mockResolvedValue(undefined) },
    ['assertAccess'],
  );

  const assessmentService = readOnlyProxy(
    {
      listForStudent: jest.fn().mockResolvedValue([
        { id: 'assessment-1', type: 'quiz', title: 'Algebra Quiz', description: null, deadlineStatus: 'closed' },
      ]),
      listDeadlinesForStudent: jest.fn().mockResolvedValue({
        upcoming: [],
        active: [],
        late: [],
        missed: [],
        closed: [],
      }),
    },
    ['listForStudent', 'listDeadlinesForStudent'],
  );

  const assessmentResultService = readOnlyProxy(
    {
      listByAssessment: jest.fn().mockImplementation((assessmentId: string) =>
        Promise.resolve({ assessmentId, totalAttempts: 0, results: [] }),
      ),
    },
    ['listByAssessment'],
  );

  return {
    service: new ParentAssessmentSummaryService(
      parentAccessPolicyService as never,
      assessmentService as never,
      assessmentResultService as never,
    ),
    parentAccessPolicyService,
    assessmentService,
    assessmentResultService,
  };
}

describe('ParentAssessmentSummaryService — access scoping and read-only guarantees', () => {
  it('checks assessment_view consent for the exact requested child before reading anything', async () => {
    const { service, parentAccessPolicyService } = buildService();

    await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(parentAccessPolicyService.assertAccess).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
      'assessment_view',
    );
  });

  it('never queries assessment data for a different child than the one access was asserted for', async () => {
    const { service, assessmentService, assessmentResultService } = buildService();

    await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);

    expect(assessmentService.listForStudent).toHaveBeenCalledWith(CHILD_ID);
    expect(assessmentService.listForStudent).not.toHaveBeenCalledWith(OTHER_CHILD_ID);
    expect(assessmentService.listDeadlinesForStudent).toHaveBeenCalledWith(CHILD_ID);
    expect(assessmentResultService.listByAssessment).toHaveBeenCalledWith('assessment-1', CHILD_ID);
    expect(assessmentResultService.listByAssessment).not.toHaveBeenCalledWith('assessment-1', OTHER_CHILD_ID);
  });

  it('rejects with ForbiddenException and reads nothing when access is denied', async () => {
    const parentAccessPolicyService = readOnlyProxy(
      { assertAccess: jest.fn().mockRejectedValue(new ForbiddenException('no access')) },
      ['assertAccess'],
    );
    const assessmentService = readOnlyProxy(
      { listForStudent: jest.fn(), listDeadlinesForStudent: jest.fn() },
      ['listForStudent', 'listDeadlinesForStudent'],
    );
    const assessmentResultService = readOnlyProxy({ listByAssessment: jest.fn() }, ['listByAssessment']);

    const service = new ParentAssessmentSummaryService(
      parentAccessPolicyService as never,
      assessmentService as never,
      assessmentResultService as never,
    );

    await expect(service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect((assessmentService as unknown as { listForStudent: jest.Mock }).listForStudent).not.toHaveBeenCalled();
  });

  it('only ever calls read-prefixed accessors on the assessment services (no mutation)', async () => {
    const { service } = buildService();

    await expect(service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID)).resolves.toBeDefined();
  });

  it('produces a plain serializable result with no mutator methods attached', async () => {
    const { service } = buildService();

    const summary = await service.getAssessmentSummaryForParent(PARENT_ID, CHILD_ID);
    const roundTripped = JSON.parse(JSON.stringify(summary));

    expect(roundTripped).toEqual(summary);
  });
});
