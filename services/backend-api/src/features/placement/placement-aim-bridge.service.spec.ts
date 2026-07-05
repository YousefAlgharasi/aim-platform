import { PlacementAimBridgeService } from './placement-aim-bridge.service';

function makeDb(rows: unknown[] = []) {
  return { query: jest.fn().mockResolvedValue({ rows }) };
}

function makeAimAttemptBridge() {
  return { recordAndTrigger: jest.fn().mockResolvedValue(undefined) };
}

const BASE_INPUT = {
  placementAttemptId: 'placement-attempt-1',
  studentId: 'student-1',
  estimatedLevel: 'elementary',
  placementResultId: 'placement-result-1',
  resultCreatedAt: '2026-01-01T00:00:00Z',
  xRequestId: 'req-1',
};

const ANSWER_ROWS = [
  {
    id: 'answer-1',
    placement_question_id: 'question-1',
    answer_value: 'A',
    is_correct: true,
    question_type: 'multiple_choice',
    skill_keys: ['skill.grammar.to_be'],
  },
  {
    id: 'answer-2',
    placement_question_id: 'question-2',
    answer_value: null,
    is_correct: null,
    question_type: 'fill_blank',
    skill_keys: null,
  },
];

describe('PlacementAimBridgeService', () => {
  it('bridges every scored (non-null is_correct) answer to AIM', async () => {
    const db = makeDb(ANSWER_ROWS);
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new PlacementAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeScoredAttempt(BASE_INPUT);

    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenCalledTimes(1);
    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        bridgeSessionId: 'placement-attempt-1',
        studentId: 'student-1',
        itemId: 'question-1',
        itemType: 'drill_question',
        skillIds: ['skill.grammar.to_be'],
        answerFormat: 'multiple_choice',
        answerValue: 'A',
        isCorrect: true,
        xRequestId: 'req-1',
      }),
    );
  });

  it('skips unanswered questions (is_correct null)', async () => {
    const db = makeDb(ANSWER_ROWS);
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new PlacementAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeScoredAttempt(BASE_INPUT);

    const calledItemIds = aimAttemptBridge.recordAndTrigger.mock.calls.map((call) => call[0].itemId);
    expect(calledItemIds).not.toContain('question-2');
  });

  it('uses the caller-supplied estimatedLevel for level context (no DB lookup)', async () => {
    const db = makeDb(ANSWER_ROWS);
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new PlacementAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeScoredAttempt(BASE_INPUT);

    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        levelContext: {
          currentLevel: 'elementary',
          placementResultId: 'placement-result-1',
          placementCompletedAt: '2026-01-01T00:00:00Z',
          levelSetAt: '2026-01-01T00:00:00Z',
        },
      }),
    );
    // No placement_results lookup — the bridge must not query for a prior
    // result (this placement IS the first result for this student).
    const placementLookupCall = db.query.mock.calls.find((call) =>
      call[0].includes('FROM placement_results'),
    );
    expect(placementLookupCall).toBeUndefined();
  });

  it('never throws when the query fails', async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error('db down')) };
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new PlacementAimBridgeService(db as never, aimAttemptBridge as never);

    await expect(service.bridgeScoredAttempt(BASE_INPUT)).resolves.toBeUndefined();
    expect(aimAttemptBridge.recordAndTrigger).not.toHaveBeenCalled();
  });

  it('never recomputes is_correct — always uses the value already set by answer validation', async () => {
    const db = makeDb(ANSWER_ROWS);
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new PlacementAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeScoredAttempt(BASE_INPUT);

    expect(aimAttemptBridge.recordAndTrigger.mock.calls[0][0].isCorrect).toBe(true);
  });
});
