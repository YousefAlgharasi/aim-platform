import { AimAttemptBridgeService } from './aim-attempt-bridge.service';

function makeDb(existingSessionRowCount = 0) {
  const query = jest.fn().mockResolvedValue({ rowCount: existingSessionRowCount, rows: [] });
  return { query };
}

function makeLessonAttemptService() {
  return {
    recordAttempt: jest.fn().mockResolvedValue({
      attemptId: 'bridged-attempt-1',
      answerId: 'bridged-answer-1',
      attemptNumberForItem: 1,
      isCorrect: true,
      submittedAt: '2026-01-01T00:00:00Z',
    }),
  };
}

function makeOrchestrator() {
  return {
    trigger: jest.fn().mockResolvedValue({
      ok: true,
      backendRequestId: 'br-1',
      studentId: 'student-1',
      sessionId: 'bridge-session-1',
    }),
  };
}

const BASE_INPUT = {
  bridgeSessionId: 'bridge-session-1',
  studentId: 'student-1',
  levelContext: {
    currentLevel: 'intermediate',
    placementResultId: 'placement-result-1',
    placementCompletedAt: '2025-12-01T00:00:00Z',
    levelSetAt: '2025-12-01T00:00:00Z',
  },
  itemId: 'item-1',
  itemType: 'practice_question' as const,
  skillIds: ['skill.grammar.to_be'],
  presentedDifficulty: 2 as const,
  answerFormat: 'multiple_choice' as const,
  answerValue: 'B',
  optionsPresentedCount: 4,
  isCorrect: true,
  startedAt: '2026-01-01T00:00:00Z',
  submittedAt: '2026-01-01T00:00:00Z',
  xRequestId: 'req-1',
};

describe('AimAttemptBridgeService', () => {
  it('creates the bridging learning_sessions row on first use', async () => {
    const db = makeDb(0);
    const lessonAttemptService = makeLessonAttemptService();
    const orchestrator = makeOrchestrator();
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await service.recordAndTrigger(BASE_INPUT);

    const insertCall = db.query.mock.calls.find((call) => call[0].includes('INSERT INTO learning_sessions'));
    expect(insertCall).toBeDefined();
    expect(insertCall![1]).toEqual([
      'bridge-session-1',
      'student-1',
      'intermediate',
      '2025-12-01T00:00:00Z',
      'placement-result-1',
      '2025-12-01T00:00:00Z',
      '1.0',
    ]);
  });

  it('skips creating a session row when one already exists for this bridgeSessionId', async () => {
    const db = makeDb(1);
    const lessonAttemptService = makeLessonAttemptService();
    const orchestrator = makeOrchestrator();
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await service.recordAndTrigger(BASE_INPUT);

    const insertCall = db.query.mock.calls.find((call) => call[0].includes('INSERT INTO learning_sessions'));
    expect(insertCall).toBeUndefined();
  });

  it('records the attempt via LessonAttemptService with the bridged fields', async () => {
    const db = makeDb(1);
    const lessonAttemptService = makeLessonAttemptService();
    const orchestrator = makeOrchestrator();
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await service.recordAndTrigger(BASE_INPUT);

    expect(lessonAttemptService.recordAttempt).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-1',
        learningSessionId: 'bridge-session-1',
        itemId: 'item-1',
        isCorrect: true,
      }),
    );
  });

  it('triggers the AIM orchestrator with the recorded attempt id', async () => {
    const db = makeDb(1);
    const lessonAttemptService = makeLessonAttemptService();
    const orchestrator = makeOrchestrator();
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await service.recordAndTrigger(BASE_INPUT);

    expect(orchestrator.trigger).toHaveBeenCalledWith({
      studentId: 'student-1',
      sessionId: 'bridge-session-1',
      attemptId: 'bridged-attempt-1',
      xRequestId: 'req-1',
    });
  });

  it('never throws — logs and returns when recordAttempt fails', async () => {
    const db = makeDb(1);
    const lessonAttemptService = {
      recordAttempt: jest.fn().mockRejectedValue(new Error('boom')),
    };
    const orchestrator = makeOrchestrator();
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await expect(service.recordAndTrigger(BASE_INPUT)).resolves.toBeUndefined();
    expect(orchestrator.trigger).not.toHaveBeenCalled();
  });

  it('never throws — logs and returns when the orchestrator fails', async () => {
    const db = makeDb(1);
    const lessonAttemptService = makeLessonAttemptService();
    const orchestrator = { trigger: jest.fn().mockRejectedValue(new Error('engine down')) };
    const service = new AimAttemptBridgeService(db as never, lessonAttemptService as never, orchestrator as never);

    await expect(service.recordAndTrigger(BASE_INPUT)).resolves.toBeUndefined();
  });
});
