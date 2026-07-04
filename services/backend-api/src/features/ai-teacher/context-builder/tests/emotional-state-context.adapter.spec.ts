// P20-020: EmotionalStateContextAdapter tests.
//
// Verifies the fail-closed null pattern (same as the other adapters in this
// folder) and that only the coarse frustrationLevel/engagementLevel enum
// values are surfaced — never the raw numeric frustration_score, and never
// items_attempted/skills_touched/signal_basis or any other session_summaries
// field.

import { EmotionalStateContextAdapter } from '../adapters/emotional-state-context.adapter';
import { SessionStateReadService } from '../../../aim/result/session-state-read.service';

function makeReadService(
  result: Awaited<ReturnType<SessionStateReadService['getSessionState']>>,
) {
  return {
    getSessionState: jest.fn().mockResolvedValue(result),
  } as unknown as SessionStateReadService;
}

describe('EmotionalStateContextAdapter', () => {
  it('returns null when no session summary has been persisted yet for the session', async () => {
    const readService = makeReadService({
      studentId: 'student-1',
      sessionId: 'session-1',
      found: false,
      itemsAttempted: null,
      itemsCorrect: null,
      skillsTouched: null,
      overallMasteryShift: null,
      behavioralSignal: null,
      closedOutAt: null,
      updatedAt: null,
    });
    const adapter = new EmotionalStateContextAdapter(readService);

    const context = await adapter.getEmotionalStateContext('student-1', 'session-1');

    expect(context).toBeNull();
  });

  it('surfaces only frustrationLevel and engagementLevel, discarding signalBasis and other session fields', async () => {
    const readService = makeReadService({
      studentId: 'student-1',
      sessionId: 'session-1',
      found: true,
      itemsAttempted: 5,
      itemsCorrect: 2,
      skillsTouched: ['skill:english:a1:vocab.daily-routines'],
      overallMasteryShift: 'negative',
      behavioralSignal: {
        frustrationLevel: 'moderate',
        engagementLevel: 'typical',
        signalBasis: ['repeated_incorrect_streak'],
      },
      closedOutAt: '2026-06-17T10:00:00Z',
      updatedAt: '2026-06-17T10:00:00Z',
    });
    const adapter = new EmotionalStateContextAdapter(readService);

    const context = await adapter.getEmotionalStateContext('student-1', 'session-1');

    expect(context).toEqual({
      frustrationLevel: 'moderate',
      engagementLevel: 'typical',
    });
    expect(context).not.toHaveProperty('signalBasis');
    expect(context).not.toHaveProperty('itemsAttempted');
    expect(context).not.toHaveProperty('overallMasteryShift');
  });

  it('scopes the read to the given studentId and sessionId', async () => {
    const readService = makeReadService({
      studentId: 'student-42',
      sessionId: 'session-42',
      found: false,
      itemsAttempted: null,
      itemsCorrect: null,
      skillsTouched: null,
      overallMasteryShift: null,
      behavioralSignal: null,
      closedOutAt: null,
      updatedAt: null,
    });
    const adapter = new EmotionalStateContextAdapter(readService);

    await adapter.getEmotionalStateContext('student-42', 'session-42');

    expect(readService.getSessionState).toHaveBeenCalledWith('student-42', 'session-42');
  });
});
