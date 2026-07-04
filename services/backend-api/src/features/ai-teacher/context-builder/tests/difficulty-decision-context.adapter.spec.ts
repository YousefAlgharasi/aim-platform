// P20-018: DifficultyDecisionContextAdapter tests.
//
// Verifies the fail-closed null pattern (same as the other adapters in this
// folder) and that only skillId/rationale are surfaced — no raw
// currentDifficulty/previousDifficulty/basedOnAttemptIds fields ever pass
// through.

import { DifficultyDecisionContextAdapter } from '../adapters/difficulty-decision-context.adapter';
import { DifficultyDecisionReadService } from '../../../aim/result/difficulty-decision-read.service';

function makeReadService(
  result: Awaited<ReturnType<DifficultyDecisionReadService['getLatestForStudent']>>,
) {
  return {
    getLatestForStudent: jest.fn().mockResolvedValue(result),
  } as unknown as DifficultyDecisionReadService;
}

describe('DifficultyDecisionContextAdapter', () => {
  it('returns null when the student has no persisted difficulty decision', async () => {
    const readService = makeReadService({
      studentId: 'student-1',
      found: false,
      difficultyDecision: null,
    });
    const adapter = new DifficultyDecisionContextAdapter(readService);

    const context = await adapter.getDifficultyDecisionContext('student-1');

    expect(context).toBeNull();
  });

  it('surfaces only skillId and rationale, discarding difficulty values and attempt ids', async () => {
    const readService = makeReadService({
      studentId: 'student-1',
      found: true,
      difficultyDecision: {
        skillId: 'skill:english:a1:vocab.daily-routines',
        currentDifficulty: 3,
        previousDifficulty: 2,
        rationale: 'consistent_performance',
        basedOnAttemptIds: ['attempt-1'],
        decidedAt: '2026-06-17T10:00:00Z',
        updatedAt: '2026-06-17T10:00:00Z',
      },
    });
    const adapter = new DifficultyDecisionContextAdapter(readService);

    const context = await adapter.getDifficultyDecisionContext('student-1');

    expect(context).toEqual({
      skillId: 'skill:english:a1:vocab.daily-routines',
      rationale: 'consistent_performance',
    });
    expect(context).not.toHaveProperty('currentDifficulty');
    expect(context).not.toHaveProperty('previousDifficulty');
    expect(context).not.toHaveProperty('basedOnAttemptIds');
  });

  it('scopes the read to the given studentId', async () => {
    const readService = makeReadService({
      studentId: 'student-42',
      found: false,
      difficultyDecision: null,
    });
    const adapter = new DifficultyDecisionContextAdapter(readService);

    await adapter.getDifficultyDecisionContext('student-42');

    expect(readService.getLatestForStudent).toHaveBeenCalledWith('student-42');
  });
});
