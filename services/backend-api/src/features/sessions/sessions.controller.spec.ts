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

import { Reflector } from '@nestjs/core';
import { SessionsController } from './sessions.controller';
import { StartSessionResponse } from './sessions.types';
import { RecordLessonAttemptResponse } from './lesson-attempt.types';
import { AimPipelineOutcome } from '../aim/pipeline/aim-pipeline-orchestrator.service';
import { STUDENT_OWNERSHIP_REQUIREMENT_KEY } from '../../auth/authorization/authorization.constants';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

const JWT_USER = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  email: 'student@test.com',
  expiresAt: Date.now() / 1000 + 3600,
};

// The internal users.id for the same student — deliberately different from
// JWT_USER.id (the raw Supabase auth UID) so tests catch any accidental mixup.
const INTERNAL_USER_ID = 'int0e8400-e29b-41d4-a716-446655440099';

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

const RESOLVED_ITEM = {
  itemType: 'lesson_question',
  answerFormat: 'multiple_choice',
  skillIds: ['skill.grammar.to_be'],
  presentedDifficulty: 1,
  optionsPresentedCount: 4,
  isCorrect: true, // internally computed — must NOT appear in HTTP response
};

function makeSessionQuestionsService(resolved: Partial<typeof RESOLVED_ITEM> = {}) {
  return {
    resolveItemForAttempt: jest.fn().mockResolvedValue({ ...RESOLVED_ITEM, ...resolved }),
    listQuestionsForLesson: jest.fn().mockResolvedValue({
      lessonId: 'les0e8400-e29b-41d4-a716-446655440060',
      questions: [
        {
          id: 'item0e8400-e29b-41d4-a716-446655440090',
          type: 'multiple_choice',
          stem: 'He _____ a teacher.',
          difficulty: 'easy',
          tags: ['a1', 'grammar'],
          options: [{ id: 'opt-1', text: 'is', order: 0 }],
        },
      ],
    }),
  };
}

function makeAimEngineClient() {
  return {
    checkHealth: jest.fn().mockResolvedValue({ reachable: true, checkedAt: '2026-06-17T16:00:00Z' }),
  };
}

function makeCtrl(overrides: {
  sessionsService?: ReturnType<typeof makeSessionsService>;
  lessonAttemptService?: ReturnType<typeof makeLessonAttemptService>;
  orchestrator?: ReturnType<typeof makeOrchestrator>;
  sessionQuestionsService?: ReturnType<typeof makeSessionQuestionsService>;
  aimEngineClient?: ReturnType<typeof makeAimEngineClient>;
} = {}) {
  const svc = overrides.sessionsService ?? makeSessionsService();
  const las = overrides.lessonAttemptService ?? makeLessonAttemptService();
  const orc = overrides.orchestrator ?? makeOrchestrator();
  const sqs = overrides.sessionQuestionsService ?? makeSessionQuestionsService();
  const aec = overrides.aimEngineClient ?? makeAimEngineClient();
  const questionAudio = { ensureAudio: jest.fn() };
  const lessonAssetAudio = { ensureAudio: jest.fn() };
  const audioStorage = { retrieveAudio: jest.fn() };
  const ctrl = new SessionsController(
    svc as never,
    las as never,
    orc as never,
    sqs as never,
    aec as never,
    questionAudio as never,
    lessonAssetAudio as never,
    audioStorage as never,
  );
  return { ctrl, svc, las, orc, sqs, aec };
}

// ---------------------------------------------------------------------------
// P5-066: startSession
// ---------------------------------------------------------------------------

describe('SessionsController.startSession (P5-066)', () => {
  it('calls sessionsService.startSession with studentId from JWT', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice' });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ studentId: JWT_USER.id }));
  });

  it('never uses a studentId from the request body', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice', skillFocusIds: [] });
    expect(svc.startSession).not.toHaveBeenCalledWith(expect.objectContaining({ studentId: 'attacker-id' }));
  });

  // Bugfix: analytics_events.actor_id has a real FK to users.id, not the raw
  // Supabase auth UID used elsewhere for this student (learning_sessions,
  // placement lookups). Passing the wrong id here crashed every real
  // session-start request with an unhandled FK-violation 500.
  it('passes the resolved internalUserId (not the raw JWT id) to the service', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice' });
    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ internalUserId: INTERNAL_USER_ID }),
    );
  });

  it('forwards sessionType to service', async () => {
    const { ctrl, svc } = makeCtrl();
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'review_practice' });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ sessionType: 'review_practice' }));
  });

  it('forwards skillFocusIds to service', async () => {
    const { ctrl, svc } = makeCtrl();
    const skills = ['skill:arabic:p1:vocab'];
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice', skillFocusIds: skills });
    expect(svc.startSession).toHaveBeenCalledWith(expect.objectContaining({ skillFocusIds: skills }));
  });

  it('returns session response from service', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice' });
    expect(result.id).toBe(SESSION_ID);
    expect(result.status).toBe('active');
  });

  // A free/idle-sleeping AIM Engine instance cold-starts on its next real
  // request, which can 502 the first attempt of a session. Warming it up as
  // soon as the session starts (well before the student answers) gives that
  // cold start a head start — fire-and-forget, must never block or fail
  // session creation even if the ping itself fails.
  it('fires a fire-and-forget warm-up ping to the AIM Engine health check', async () => {
    const { ctrl, aec } = makeCtrl();
    await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice' });
    expect(aec.checkHealth).toHaveBeenCalledTimes(1);
  });

  it('still returns the session response even if the warm-up ping rejects', async () => {
    const aec = makeAimEngineClient();
    aec.checkHealth.mockRejectedValue(new Error('engine unreachable'));
    const { ctrl } = makeCtrl({ aimEngineClient: aec });

    const result = await ctrl.startSession(JWT_USER, INTERNAL_USER_ID, { sessionType: 'lesson_practice' });
    expect(result.id).toBe(SESSION_ID);
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

  it('resolves item fields backend-side and passes them to recordAttempt', async () => {
    const { ctrl, las, sqs } = makeCtrl();
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, BODY, '');
    expect(sqs.resolveItemForAttempt).toHaveBeenCalledWith(BODY.itemId, BODY.answerValue);
    expect(las.recordAttempt).toHaveBeenCalledWith(expect.objectContaining({
      itemType: 'lesson_question',
      answerFormat: 'multiple_choice',
      skillIds: ['skill.grammar.to_be'],
      presentedDifficulty: 1,
      optionsPresentedCount: 4,
      isCorrect: true, // backend-evaluated — recorded, never returned
    }));
  });

  it('never trusts a client-supplied isCorrect/skillIds — resolver output wins', async () => {
    const { ctrl, las } = makeCtrl({
      sessionQuestionsService: makeSessionQuestionsService({ isCorrect: false, skillIds: [] }),
    });
    const attackBody = { ...BODY, isCorrect: true, skillIds: ['fake'] } as never;
    await ctrl.submitAttempt(JWT_USER, SESSION_ID, attackBody, '');
    const call = (las.recordAttempt as jest.Mock).mock.calls[0][0];
    expect(call.isCorrect).toBe(false);
    expect(call.skillIds).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GET /sessions/:sessionId/questions
// ---------------------------------------------------------------------------

describe('SessionsController.getSessionQuestions', () => {
  const LESSON_ID = 'les0e8400-e29b-41d4-a716-446655440060';

  it('passes JWT studentId, sessionId, and lessonId to the service', async () => {
    const { ctrl, sqs } = makeCtrl();
    await ctrl.getSessionQuestions(JWT_USER, SESSION_ID, LESSON_ID);
    expect(sqs.listQuestionsForLesson).toHaveBeenCalledWith(
      JWT_USER.id,
      SESSION_ID,
      LESSON_ID,
    );
  });

  it('rejects a missing lessonId with a validation error', async () => {
    const { ctrl, sqs } = makeCtrl();
    await expect(ctrl.getSessionQuestions(JWT_USER, SESSION_ID, undefined)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(sqs.listQuestionsForLesson).not.toHaveBeenCalled();
  });

  it('returns delivered questions without correctness data', async () => {
    const { ctrl } = makeCtrl();
    const result = await ctrl.getSessionQuestions(JWT_USER, SESSION_ID, LESSON_ID);
    expect(result.questions).toHaveLength(1);
    expect(JSON.stringify(result)).not.toContain('is_correct');
    expect(JSON.stringify(result)).not.toContain('isCorrect');
  });
});

// ---------------------------------------------------------------------------
// None of the routes below have a :studentId path param — studentId is
// always JWT-resolved, never client-supplied — so an
// @RequireStudentOwnership() decorator (default paramName 'studentId') has
// no matching route param to check against. StudentOwnershipGuard's lookup
// on an absent param always came back empty, so it unconditionally threw
// 403 "Student ownership target is missing" for every real student
// request, making POST /sessions/start, POST /sessions/:sessionId/attempt
// (the AIM pipeline's only trigger), and GET /sessions/:sessionId/questions
// completely unreachable in production. Real ownership for the latter two
// is enforced where it actually can be checked: a DB lookup inside
// LessonAttemptService / SessionQuestionsService.verifyActiveSessionOwnership
// comparing the session's stored student_id to the JWT-resolved id. Guard
// against reintroducing the route-level decorator on any of these handlers.
// ---------------------------------------------------------------------------

describe('SessionsController — no bogus ownership-guard metadata', () => {
  const reflector = new Reflector();

  it('startSession carries no @RequireStudentOwnership metadata', () => {
    expect(
      reflector.get(STUDENT_OWNERSHIP_REQUIREMENT_KEY, SessionsController.prototype.startSession),
    ).toBeUndefined();
  });

  it('submitAttempt carries no @RequireStudentOwnership metadata', () => {
    expect(
      reflector.get(STUDENT_OWNERSHIP_REQUIREMENT_KEY, SessionsController.prototype.submitAttempt),
    ).toBeUndefined();
  });

  it('getSessionQuestions carries no @RequireStudentOwnership metadata', () => {
    expect(
      reflector.get(STUDENT_OWNERSHIP_REQUIREMENT_KEY, SessionsController.prototype.getSessionQuestions),
    ).toBeUndefined();
  });
});
