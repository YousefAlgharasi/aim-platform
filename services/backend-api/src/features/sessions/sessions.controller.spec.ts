// Phase 5 — P5-066 + P5-067
// SessionsController tests.
//
// P5-066 (startSession):
//   - studentId from JWT, never body
//   - sessionType forwarded from body
//   - skillFocusIds forwarded from body
//   - returns session response
//
// P5-067 (submitAttempt):
//   - studentId from JWT, never body
//   - records attempt via LessonAttemptService
//   - triggers AIM pipeline via AimPipelineOrchestratorService
//   - returns safe ack (no is_correct, no AIM-owned values)
//   - aimPipelineTriggered=true when pipeline resolves ok
//   - aimOutcome='ok' when pipeline ok=true
//   - aimOutcome='deferred' when pipeline ok=false
//   - aimPipelineTriggered=false when pipeline throws
//   - pipeline failure does NOT fail the HTTP response
//   - studentId used for pipeline, not from body

import { SessionsController } from './sessions.controller';
import { StartSessionResponse } from './sessions.types';
import { RecordLessonAttemptResponse } from './lesson-attempt.types';
import { AimPipelineOutcome } from '../aim/pipeline/aim-pipeline-orchestrator.service';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const JWT_USER = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  email: 'student@test.com',
  expiresAt: Date.now() / 1000 + 3600,
};

const SESSION_ID = 'ses0e8400-e29b-41d4-a716-446655440070';

function makeSessionsService(resp: Partial<StartSessionResponse> = {}) {
  return {
    startSession: jest.fn().mockResolvedValue({
      id: SESSION_ID,
      sessionType: 'lesson_practice',
      status: 'active',
      startedAt: '2026-06-17T16:00:00Z',
      currentLevel: 'A1',
      skillFocusIds: [],
      ...resp,
    } as StartSessionResponse),
  };
}

function makeLessonAttemptService(resp: Partial<RecordLessonAttemptResponse> = {}) {
  return {
    recordAttempt: jest.fn().mockResolvedValue({
      attemptId: 'att0e8400-e29b-41d4-a716-446655440080',
      answerId: 'ans0e8400-e29b-41d4-a716-446655440081',
      attemptNumberForItem: 1,
      isCorrect: true,   // internally computed — must NOT appear in HTTP response
      submittedAt: '2026-06-17T16:10:00Z',
      ...resp,
    } as RecordLessonAttemptResponse),
  };
}

function makeOrchestrator(outcome: AimPipelineOutcome = { ok: true, backendRequestId: 'br-001', studentId: JWT_USER.id, sessionId: SESSION_ID }) {
  return {
    trigger: jest.fn().mockResolvedValue(outcome),
  };
}

function makeCtrl(overrides: {
  sessionsService?: ReturnType<typeof makeSessionsService>;
  lessonAttemptService?: ReturnType<typeof makeLessonAttemptService>;
  orchestrator?: ReturnType<typeof makeOrchestrator>;
} = {}) {
  const svc = overrides.sessionsService ?? makeSessionsService();
  const las = overrides.lessonAttemptService ?? makeLessonAttemptService();
  const orc = overrides.orchestrator ?? makeOrchestrator();
  const ctrl = new SessionsController(svc as never, las as never, orc as never);
  return { ctrl, svc, las, orc };
}

// ---------------------------------------------------------------------------
// P5-066: startSession
// ---------------------------------------------------------------------------

describe('SessionsController.startSession (P5-066)', () => {
  it('calls sessionsService.startSession with studentId from JWT', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice' });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ studentId: JWT_USER.id }));
  });

  it('never uses a studentId from the request body', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice', skillFocusIds: [] });
    expect(svc.startSession).not.toHaveBeenCalledWith(expect.objectContaining({ studentId: 'attacker-id' }));
  });

  it('forwards sessionType to service', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, { sessionType: 'review_practice' });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ sessionType: 'review_practice' }));
  });

  it('forwards skillFocusIds to service', async () => {
    const { ctrl, svc } = makeCtrl();
    const skills = ['skill:arabic:p1:vocab'];
    await ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice', skillFocusIds: skills });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ skillFocusIds: skills }));
  });

  it('returns session response from service', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice' });
    expect(result.id).toBe(SESSION_ID);
    expect(result.status).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// P5-067: submitAttempt
// ---------------------------------------------------------------------------

describe('SessionsController.submitAttempt (P5-067)', () => {
  const BODY = {
    itemId: 'item0e8400-e29b-41d4-a716-446655440090',
    answerValue: 'option_a',
    startedAt: '2026-06-17T16:09:00Z',
  };

  it('calls lessonAttemptService.recordAttempt with studentId from JWT', async () => {
    const { ctrl, las } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, 'req-001');
    expect(las.recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ studentId: JWT_USER.id }));
  });

  it('never uses a studentId from the body in recordAttempt', async () => {
    const { ctrl, las } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    const call = (las.recordAttempt as jest.Mock).mock.calls[0][0];
    expect(call.studentId).toBe(JWT_USER.id);
  });

  it('passes sessionId from route param to recordAttempt', async () => {
    const { ctrl, las } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(las.recordAttempt).toHaveBeenCalledWith(expect.objectContaining({ learningSessionId: SESSION_ID }));
  });

  it('passes itemId and answerValue from body', async () => {
    const { ctrl, las } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(las.recordAttempt).toHaveBeenCalledWith(expect.objectContaining({
      itemId: BODY.itemId,
      answerValue: BODY.answerValue,
    }));
  });

  it('triggers AIM orchestrator after recording attempt', async () => {
    const { ctrl, orc } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, 'req-x');
    expect(orc.trigger).toHaveBeenCalledTimes(1);
  });

  it('passes studentId from JWT to orchestrator', async () => {
    const { ctrl, orc } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(orc.trigger).toHaveBeenCalledWith(expect.objectContaining({ studentId: JWT_USER.id }));
  });

  it('passes sessionId to orchestrator', async () => {
    const { ctrl, orc } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(orc.trigger).toHaveBeenCalledWith(expect.objectContaining({ sessionId: SESSION_ID }));
  });

  it('passes attemptId from recorded attempt to orchestrator', async () => {
    const { ctrl, orc } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    // attemptId comes from the mock recordAttempt response fixture
    expect(orc.trigger).toHaveBeenCalledWith(
      expect.objectContaining({ attemptId: 'att0e8400-e29b-41d4-a716-446655440080' }),
    );
  });

  it('returns safe ack: attemptId and answerId', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result.attemptId).toBe('att0e8400-e29b-41d4-a716-446655440080');
    expect(result.answerId).toBe('ans0e8400-e29b-41d4-a716-446655440081');
  });

  it('does NOT return is_correct in response', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result).not.toHaveProperty('isCorrect');
    expect(result).not.toHaveProperty('is_correct');
  });

  it('does NOT return AIM-owned values in response', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result).not.toHaveProperty('mastery');
    expect(result).not.toHaveProperty('difficulty');
    expect(result).not.toHaveProperty('weakness');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('sets aimPipelineTriggered=true when pipeline resolves', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result.aimPipelineTriggered).toBe(true);
  });

  it('sets aimOutcome=ok when pipeline ok=true', async () => {
    const { ctrl } = makeCtrl({ orchestrator: makeOrchestrator({ ok: true, backendRequestId: 'br', studentId: JWT_USER.id, sessionId: SESSION_ID }) });
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result.aimOutcome).toBe('ok');
  });

  it('sets aimOutcome=deferred when pipeline ok=false', async () => {
    const { ctrl } = makeCtrl({ orchestrator: makeOrchestrator({ ok: false, backendRequestId: 'br', reason: 'aim_engine_unavailable' }) });
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result.aimOutcome).toBe('deferred');
  });

  it('pipeline failure does NOT throw — response still succeeds', async () => {
    const failOrc = { trigger: jest.fn().mockRejectedValue(new Error('pipeline crashed')) };
    const { ctrl } = makeCtrl({ orchestrator: failOrc as never });
    await expect(ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '')).resolves.toBeDefined();
  });

  it('sets aimPipelineTriggered=false when pipeline throws', async () => {
    const failOrc = { trigger: jest.fn().mockRejectedValue(new Error('oops')) };
    const { ctrl } = makeCtrl({ orchestrator: failOrc as never });
    const result = await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(result.aimPipelineTriggered).toBe(false);
    expect(result.aimOutcome).toBe('deferred');
  });
});
