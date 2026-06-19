// P8-037: Add Recent Mistakes Context
// RecentMistakesContextAdapter tests.

import { RecentMistakesContextAdapter } from '../adapters/recent-mistakes-context.adapter';
import { ErrorPatternsReadService } from '../../../aim/result/error-patterns-read.service';

function makeMockErrorPatternsRead(
  getActiveErrorPatternsForStudent: ErrorPatternsReadService['getActiveErrorPatternsForStudent'],
) {
  return { getActiveErrorPatternsForStudent } as unknown as ErrorPatternsReadService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('RecentMistakesContextAdapter', () => {
  it('maps active error patterns to skillId, patternType, patternCode, occurrenceCount only', async () => {
    const errorPatternsRead = makeMockErrorPatternsRead(async () => ({
      studentId: STUDENT_ID,
      errorPatterns: [
        {
          patternId: 'pattern-1',
          skillId: 'skill-1',
          patternType: 'grammar_rule_misapplication',
          patternCode: 'past_tense_overgeneralization',
          occurrenceCount: 4,
          confidence: 0.75,
          lastSeenAt: '2026-06-01T00:00:00Z',
        },
      ],
    }));
    const adapter = new RecentMistakesContextAdapter(errorPatternsRead);
    const context = await adapter.getRecentMistakesContext(STUDENT_ID);

    expect(context).toEqual([
      {
        skillId: 'skill-1',
        patternType: 'grammar_rule_misapplication',
        patternCode: 'past_tense_overgeneralization',
        occurrenceCount: 4,
      },
    ]);
    expect(context[0]).not.toHaveProperty('patternId');
    expect(context[0]).not.toHaveProperty('confidence');
    expect(context[0]).not.toHaveProperty('lastSeenAt');
  });

  it('returns an empty array when the student has no active error patterns', async () => {
    const errorPatternsRead = makeMockErrorPatternsRead(async () => ({
      studentId: STUDENT_ID,
      errorPatterns: [],
    }));
    const adapter = new RecentMistakesContextAdapter(errorPatternsRead);
    const context = await adapter.getRecentMistakesContext(STUDENT_ID);
    expect(context).toEqual([]);
  });

  it('passes studentId through to ErrorPatternsReadService.getActiveErrorPatternsForStudent unchanged', async () => {
    const calls: string[] = [];
    const errorPatternsRead = makeMockErrorPatternsRead(async (id) => {
      calls.push(id);
      return { studentId: id, errorPatterns: [] };
    });
    const adapter = new RecentMistakesContextAdapter(errorPatternsRead);
    await adapter.getRecentMistakesContext(STUDENT_ID);
    expect(calls).toEqual([STUDENT_ID]);
  });
});
