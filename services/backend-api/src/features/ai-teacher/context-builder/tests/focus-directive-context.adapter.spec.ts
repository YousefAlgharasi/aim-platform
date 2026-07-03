// P20-013: FocusDirectiveContextAdapter tests.
//
// Verifies the fail-closed null pattern (same as the other three adapters
// in this folder) and that only directive_text/skillId are surfaced — no
// raw weakness/recommendation/difficulty fields ever pass through.

import { FocusDirectiveContextAdapter } from '../adapters/focus-directive-context.adapter';
import { FocusDirectiveReadService } from '../../../aim/result/focus-directive-read.service';

function makeReadService(
  result: Awaited<ReturnType<FocusDirectiveReadService['getActiveForStudent']>>,
) {
  return {
    getActiveForStudent: jest.fn().mockResolvedValue(result),
  } as unknown as FocusDirectiveReadService;
}

describe('FocusDirectiveContextAdapter', () => {
  it('returns null when the student has no active focus directive', async () => {
    const readService = makeReadService(null);
    const adapter = new FocusDirectiveContextAdapter(readService);

    const context = await adapter.getFocusDirectiveContext('student-1');

    expect(context).toBeNull();
  });

  it('surfaces only skillId and directiveText, discarding source/generatedAt', async () => {
    const readService = makeReadService({
      skillId: 'skill:english:a1:grammar.past-simple',
      directiveText: 'The student is showing difficulty with Past Simple (severity: critical).',
      source: 'weakness_record',
      generatedAt: '2026-06-17T10:00:00Z',
    });
    const adapter = new FocusDirectiveContextAdapter(readService);

    const context = await adapter.getFocusDirectiveContext('student-1');

    expect(context).toEqual({
      skillId: 'skill:english:a1:grammar.past-simple',
      directiveText: 'The student is showing difficulty with Past Simple (severity: critical).',
    });
    expect(context).not.toHaveProperty('source');
    expect(context).not.toHaveProperty('generatedAt');
  });

  it('scopes the read to the given studentId', async () => {
    const readService = makeReadService(null);
    const adapter = new FocusDirectiveContextAdapter(readService);

    await adapter.getFocusDirectiveContext('student-42');

    expect(readService.getActiveForStudent).toHaveBeenCalledWith('student-42');
  });
});
