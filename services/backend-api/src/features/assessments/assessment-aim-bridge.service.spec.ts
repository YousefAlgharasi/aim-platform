import { AssessmentAimBridgeService } from './assessment-aim-bridge.service';
import { AssessmentGradingResult } from './assessment-grading.types';

const GRADING_RESULT: AssessmentGradingResult = {
  attemptId: 'att-1',
  assessmentId: 'assess-1',
  studentId: 'student-1',
  score: 8,
  maxScore: 10,
  passed: true,
  latePenaltyApplied: false,
  gradedAt: new Date('2026-01-01T00:00:01Z'),
  outcomes: [
    { assessmentQuestionLinkId: 'link-1', isCorrect: true, pointsAwarded: 5, pointsPossible: 5 },
    { assessmentQuestionLinkId: 'link-2', isCorrect: false, pointsAwarded: 0, pointsPossible: 5 },
  ],
};

function makeDb({
  questionContextRows = [] as unknown[],
  placementRows = [] as unknown[],
} = {}) {
  const query = jest.fn().mockImplementation((sql: string) => {
    if (sql.includes('FROM assessment_attempt_answers')) {
      return Promise.resolve({ rows: questionContextRows });
    }
    if (sql.includes('FROM placement_results')) {
      return Promise.resolve({ rows: placementRows });
    }
    return Promise.resolve({ rows: [] });
  });
  return { query };
}

function makeAimAttemptBridge() {
  return { recordAndTrigger: jest.fn().mockResolvedValue(undefined) };
}

const PLACEMENT_ROW = {
  id: 'placement-result-1',
  estimated_level: 'intermediate',
  completed_at: '2025-12-01T00:00:00Z',
};

const QUESTION_ROWS = [
  {
    assessment_question_link_id: 'link-1',
    question_id: 'question-1',
    response_value: 'B',
    type: 'multiple_choice',
    difficulty: 'medium',
    options_count: 4,
    skill_keys: ['skill.grammar.to_be'],
  },
  {
    assessment_question_link_id: 'link-2',
    question_id: 'question-2',
    response_value: 'wrong',
    type: 'fill_blank',
    difficulty: 'hard',
    options_count: 0,
    skill_keys: null,
  },
];

describe('AssessmentAimBridgeService', () => {
  it('bridges every graded outcome to AIM with resolved item context', async () => {
    const db = makeDb({ questionContextRows: QUESTION_ROWS, placementRows: [PLACEMENT_ROW] });
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new AssessmentAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeGradedAttempt(GRADING_RESULT, 'req-1');

    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenCalledTimes(2);
    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        bridgeSessionId: 'att-1',
        studentId: 'student-1',
        itemId: 'question-1',
        itemType: 'practice_question',
        skillIds: ['skill.grammar.to_be'],
        answerFormat: 'multiple_choice',
        optionsPresentedCount: 4,
        isCorrect: true,
        xRequestId: 'req-1',
      }),
    );
    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        itemId: 'question-2',
        answerFormat: 'fill_blank',
        optionsPresentedCount: null,
        isCorrect: false,
        skillIds: [],
      }),
    );
  });

  it('uses the resolved placement result for level context', async () => {
    const db = makeDb({ questionContextRows: QUESTION_ROWS, placementRows: [PLACEMENT_ROW] });
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new AssessmentAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeGradedAttempt(GRADING_RESULT, 'req-1');

    expect(aimAttemptBridge.recordAndTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        levelContext: {
          currentLevel: 'intermediate',
          placementResultId: 'placement-result-1',
          placementCompletedAt: '2025-12-01T00:00:00Z',
          levelSetAt: '2025-12-01T00:00:00Z',
        },
      }),
    );
  });

  it('skips bridging entirely when the student has no completed placement result', async () => {
    const db = makeDb({ questionContextRows: QUESTION_ROWS, placementRows: [] });
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new AssessmentAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeGradedAttempt(GRADING_RESULT, 'req-1');

    expect(aimAttemptBridge.recordAndTrigger).not.toHaveBeenCalled();
  });

  it('never throws when the bridge query fails', async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error('db down')) };
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new AssessmentAimBridgeService(db as never, aimAttemptBridge as never);

    await expect(service.bridgeGradedAttempt(GRADING_RESULT, 'req-1')).resolves.toBeUndefined();
  });

  it('never recomputes isCorrect — always uses the value from the grading result', async () => {
    const db = makeDb({ questionContextRows: QUESTION_ROWS, placementRows: [PLACEMENT_ROW] });
    const aimAttemptBridge = makeAimAttemptBridge();
    const service = new AssessmentAimBridgeService(db as never, aimAttemptBridge as never);

    await service.bridgeGradedAttempt(GRADING_RESULT, 'req-1');

    const calls = aimAttemptBridge.recordAndTrigger.mock.calls;
    expect(calls[0][0].isCorrect).toBe(GRADING_RESULT.outcomes[0].isCorrect);
    expect(calls[1][0].isCorrect).toBe(GRADING_RESULT.outcomes[1].isCorrect);
  });
});
