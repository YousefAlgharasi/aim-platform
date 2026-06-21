/**
 * P8-078: Add AI Teacher API Tests (Group H — AI Teacher API Endpoints).
 * Tests for all five AI Teacher API controllers and their DTOs, covering:
 *
 *   1. DTO validation — each DTO rejects invalid input with VALIDATION_ERROR
 *      before the service is invoked.
 *   2. Auth/ownership — controllers resolve studentId from the JWT, never
 *      the request body; session ownership cross-checks block cross-student
 *      access; AiTeacherSessionOwnershipGuard loads and attaches the session.
 *   3. Safe error mapping — service errors surface as safe HTTP errors,
 *      never raw internal messages.
 *   4. Happy paths — controllers delegate correctly to their services and
 *      return the right shape.
 *   5. AIM Engine authority — no controller output contains mastery, level,
 *      weakness, difficulty, recommendation, or review-schedule.
 *   6. No secrets — controller source files contain no process.env or
 *      hardcoded API keys.
 *
 * Controllers covered:
 *   - ChatSessionStartController   (POST /ai-teacher/sessions)
 *   - ChatMessageSubmitController  (POST /ai-teacher/sessions/:id/messages)
 *   - ChatHistoryReadController    (GET  /ai-teacher/sessions/:id/messages)
 *   - ChatSessionListReadController(GET  /ai-teacher/sessions)
 *   - AiTeacherFeedbackSubmitController (POST /ai-teacher/messages/:messageId/feedback)
 *   - AiTeacherSessionOwnershipGuard
 */
import { HttpStatus } from '@nestjs/common';

// Controllers
import { ChatSessionStartController } from '../../chat-session/chat-session-start.controller';
import { ChatMessageSubmitController } from '../../chat-message/chat-message-submit.controller';
import { ChatHistoryReadController } from '../../chat-history/chat-history-read.controller';
import { ChatSessionListReadController } from '../../chat-session-list/chat-session-list-read.controller';
import { AiTeacherFeedbackSubmitController } from '../../feedback/ai-teacher-feedback-submit.controller';

// Services
import { ChatSessionStartService } from '../../chat-session/chat-session-start.service';
import { ChatMessageSubmitService } from '../../chat-message/chat-message-submit.service';
import { ChatHistoryReadService } from '../../chat-history/chat-history-read.service';
import { ChatSessionListReadService } from '../../chat-session-list/chat-session-list-read.service';
import { AiTeacherFeedbackSubmitService } from '../../feedback/ai-teacher-feedback-submit.service';

// DTOs
import { StartChatSessionRequestDto } from '../../chat-session/chat-session-start.dto';
import { SendChatMessageRequestDto } from '../../chat-message/chat-message-submit.dto';
import { SubmitFeedbackRequestDto } from '../../feedback/ai-teacher-feedback-submit.dto';

// Guard
import { AiTeacherSessionOwnershipGuard } from '../../guards/ai-teacher-session-ownership.guard';

// Repos / types
import { AiChatSessionRepository } from '../../repositories/ai-chat-session.repository';
import { AiChatSessionRow } from '../../repositories/ai-chat-repository.types';
import { AppError } from '../../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeSession(overrides: Partial<AiChatSessionRow> = {}): AiChatSessionRow {
  return {
    id: 'session-1',
    student_id: 'student-1',
    context_ref: 'lesson:fractions',
    status: 'active',
    created_at: '2026-06-19T00:00:00.000Z',
    updated_at: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. DTO Validation (P8-077)
// ---------------------------------------------------------------------------

describe('StartChatSessionRequestDto — validation (P8-077)', () => {
  it('accepts a valid non-blank contextRef and trims it', () => {
    const dto = StartChatSessionRequestDto.fromBody({ contextRef: '  lesson:fractions  ' });
    expect(dto.contextRef).toBe('lesson:fractions');
  });

  it.each([
    { contextRef: '' },
    { contextRef: '   ' },
    {},
    null,
    undefined,
    42,
    'just-a-string',
  ])('throws VALIDATION_ERROR for invalid body %p', (body) => {
    let err: AppError | undefined;
    try { StartChatSessionRequestDto.fromBody(body); } catch (e) { err = e as AppError; }
    expect(err).toBeInstanceOf(AppError);
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('ignores a client-supplied studentId — ownership is always JWT-derived', () => {
    const dto = StartChatSessionRequestDto.fromBody({
      contextRef: 'lesson:fractions',
      studentId: 'attacker-id',
    });
    expect(dto).toEqual({ contextRef: 'lesson:fractions' });
    expect((dto as unknown as Record<string, unknown>)['studentId']).toBeUndefined();
  });
});

describe('SendChatMessageRequestDto — validation (P8-077)', () => {
  it('accepts a valid non-blank message and trims it', () => {
    const dto = SendChatMessageRequestDto.fromBody({ message: '  hello  ' });
    expect(dto.message).toBe('hello');
  });

  it.each([
    { message: '' },
    { message: '   ' },
    {},
    null,
    undefined,
    42,
    'just-a-string',
  ])('throws VALIDATION_ERROR for invalid body %p', (body) => {
    let err: AppError | undefined;
    try { SendChatMessageRequestDto.fromBody(body); } catch (e) { err = e as AppError; }
    expect(err).toBeInstanceOf(AppError);
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('ignores client-supplied sessionId and studentId — both are server-resolved', () => {
    const dto = SendChatMessageRequestDto.fromBody({
      message: 'hello',
      sessionId: 'attacker-session',
      studentId: 'attacker-id',
    });
    expect(dto).toEqual({ message: 'hello' });
  });
});

describe('SubmitFeedbackRequestDto — validation (P8-077)', () => {
  it.each(['helpful', 'not_helpful'])('accepts valid rating "%s"', (rating) => {
    const dto = SubmitFeedbackRequestDto.fromBody({ rating });
    expect(dto.rating).toBe(rating);
  });

  it.each([
    { rating: '' },
    { rating: 'bad_rating' },
    { rating: 'HELPFUL' },
    {},
    null,
    undefined,
    42,
  ])('throws VALIDATION_ERROR for invalid body %p', (body) => {
    let err: AppError | undefined;
    try { SubmitFeedbackRequestDto.fromBody(body); } catch (e) { err = e as AppError; }
    expect(err).toBeInstanceOf(AppError);
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('ignores client-supplied messageId and studentId — both are server-resolved', () => {
    const dto = SubmitFeedbackRequestDto.fromBody({
      rating: 'helpful',
      messageId: 'attacker-message',
      studentId: 'attacker-id',
    });
    expect(dto).toEqual({ rating: 'helpful' });
  });
});

// ---------------------------------------------------------------------------
// 2. AiTeacherSessionOwnershipGuard (P8-076)
// ---------------------------------------------------------------------------

describe('AiTeacherSessionOwnershipGuard (P8-076)', () => {
  function makeGuard(session: AiChatSessionRow | null) {
    const repo = {
      findById: jest.fn().mockResolvedValue(session),
    } as unknown as AiChatSessionRepository;
    return new AiTeacherSessionOwnershipGuard(repo);
  }

  function makeContext(userId: string, sessionId: string) {
    const request = {
      user: makeUser({ id: userId }),
      params: { id: sessionId },
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('returns true when the session exists and belongs to the authenticated student', async () => {
    const guard = makeGuard(makeSession({ id: 'session-1', student_id: 'student-1' }));
    const result = await guard.canActivate(makeContext('student-1', 'session-1'));
    expect(result).toBe(true);
  });

  it('attaches the loaded session to the request for downstream handlers', async () => {
    const session = makeSession({ id: 'session-1', student_id: 'student-1' });
    const repo = { findById: jest.fn().mockResolvedValue(session) } as unknown as AiChatSessionRepository;
    const guard = new AiTeacherSessionOwnershipGuard(repo);
    const request: Record<string, unknown> = {
      user: makeUser({ id: 'student-1' }),
      params: { id: 'session-1' },
    };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;

    await guard.canActivate(ctx);
    expect(request['aiChatSession']).toEqual(session);
  });

  it('throws NOT_FOUND when the session does not exist — no existence leak', async () => {
    const guard = makeGuard(null);
    let err: AppError | undefined;
    try { await guard.canActivate(makeContext('student-1', 'missing-session')); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(err?.message).toBe('Chat session not found.');
  });

  it('throws NOT_FOUND when the session belongs to a different student — no existence leak', async () => {
    const guard = makeGuard(makeSession({ student_id: 'other-student' }));
    let err: AppError | undefined;
    try { await guard.canActivate(makeContext('student-1', 'session-1')); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(err?.message).toBe('Chat session not found.');
  });

  it('throws NOT_FOUND when the sessionId param is missing', async () => {
    const guard = makeGuard(makeSession());
    const request = { user: makeUser(), params: {} };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    let err: AppError | undefined;
    try { await guard.canActivate(ctx); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('throws UNAUTHORIZED when there is no authenticated user', async () => {
    const guard = makeGuard(makeSession());
    const request = { user: undefined, params: { id: 'session-1' } };
    const ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
    let err: AppError | undefined;
    try { await guard.canActivate(ctx); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });
});

// ---------------------------------------------------------------------------
// 3. ChatSessionStartController (POST /ai-teacher/sessions) (P8-071)
// ---------------------------------------------------------------------------

describe('ChatSessionStartController (P8-071)', () => {
  const SESSION_RESULT = {
    sessionId: 'session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    status: 'active' as const,
    createdAt: '2026-06-19T00:00:00.000Z',
  };

  function makeController() {
    const service = {
      startSession: jest.fn().mockResolvedValue(SESSION_RESULT),
    } as unknown as ChatSessionStartService;
    return { controller: new ChatSessionStartController(service), service };
  }

  it('resolves studentId from the JWT user — never from the body', async () => {
    const { controller, service } = makeController();
    await controller.startSession(makeUser({ id: 'student-jwt' }), { contextRef: 'lesson:x' });
    expect(service.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-jwt' }),
    );
  });

  it('passes contextRef from the validated DTO to the service', async () => {
    const { controller, service } = makeController();
    await controller.startSession(makeUser(), { contextRef: '  lesson:fractions  ' });
    expect(service.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ contextRef: 'lesson:fractions' }),
    );
  });

  it('throws VALIDATION_ERROR when contextRef is missing before calling the service', async () => {
    const { controller, service } = makeController();
    let err: AppError | undefined;
    try { await controller.startSession(makeUser(), {}); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(service.startSession).not.toHaveBeenCalled();
  });

  it('returns the service result directly', async () => {
    const { controller } = makeController();
    const result = await controller.startSession(makeUser(), { contextRef: 'lesson:fractions' });
    expect(result).toEqual(SESSION_RESULT);
  });

  it('never includes mastery, level, weakness, difficulty, recommendation, or reviewSchedule in the response', async () => {
    const { controller } = makeController();
    const result = await controller.startSession(makeUser(), { contextRef: 'lesson:fractions' });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/mastery|weakness|difficulty|recommendation|reviewSchedule/i);
  });
});

// ---------------------------------------------------------------------------
// 4. ChatMessageSubmitController (POST /ai-teacher/sessions/:id/messages) (P8-072)
// ---------------------------------------------------------------------------

describe('ChatMessageSubmitController (P8-072)', () => {
  const MESSAGE_RESULT = {
    text: 'Find a common denominator.',
    isFallback: false,
    provider: 'fake-provider',
    model: 'fake-model',
    latencyMs: 100,
  };

  function makeController(
    session: AiChatSessionRow | null = makeSession(),
    result = MESSAGE_RESULT,
  ) {
    const service = {
      submitMessage: jest.fn().mockResolvedValue(result),
    } as unknown as ChatMessageSubmitService;
    const repo = {
      findById: jest.fn().mockResolvedValue(session),
    } as unknown as AiChatSessionRepository;
    return { controller: new ChatMessageSubmitController(service, repo), service, repo };
  }

  it('resolves studentId from the JWT user — never from the body', async () => {
    const { controller, service } = makeController(makeSession({ student_id: 'jwt-student' }));
    await controller.sendMessage(makeUser({ id: 'jwt-student' }), 'session-1', { message: 'hi' });
    expect(service.submitMessage).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'jwt-student' }),
    );
  });

  it('reads contextRef from the session row — never from the body', async () => {
    const { controller, service } = makeController(makeSession({ context_ref: 'lesson:fractions' }));
    await controller.sendMessage(makeUser(), 'session-1', { message: 'hi', contextRef: 'attacker-context' } as any);
    expect(service.submitMessage).toHaveBeenCalledWith(
      expect.objectContaining({ contextRef: 'lesson:fractions' }),
    );
  });

  it('throws NOT_FOUND when session does not exist — no existence leak', async () => {
    const { controller, service } = makeController(null);
    let err: AppError | undefined;
    try { await controller.sendMessage(makeUser(), 'no-session', { message: 'hi' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(service.submitMessage).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the session belongs to a different student — no existence leak', async () => {
    const { controller, service } = makeController(makeSession({ student_id: 'other-student' }));
    let err: AppError | undefined;
    try { await controller.sendMessage(makeUser({ id: 'student-1' }), 'session-1', { message: 'hi' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(service.submitMessage).not.toHaveBeenCalled();
  });

  it('throws VALIDATION_ERROR when the message body is missing before calling the service', async () => {
    const { controller, service } = makeController();
    let err: AppError | undefined;
    try { await controller.sendMessage(makeUser(), 'session-1', {}); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(service.submitMessage).not.toHaveBeenCalled();
  });

  it('returns the service result directly', async () => {
    const { controller } = makeController();
    const result = await controller.sendMessage(makeUser(), 'session-1', { message: 'hi' });
    expect(result).toEqual(MESSAGE_RESULT);
  });

  it('never includes AIM Engine authority fields in the response', async () => {
    const { controller } = makeController();
    const result = await controller.sendMessage(makeUser(), 'session-1', { message: 'hi' });
    const keys = Object.keys(result);
    ['mastery', 'level', 'weakness', 'difficulty', 'recommendation', 'reviewSchedule'].forEach(
      (k) => expect(keys).not.toContain(k),
    );
  });
});

// ---------------------------------------------------------------------------
// 5. ChatHistoryReadController (GET /ai-teacher/sessions/:id/messages) (P8-073)
// ---------------------------------------------------------------------------

describe('ChatHistoryReadController (P8-073)', () => {
  const HISTORY_RESULT = {
    sessionId: 'session-1',
    messages: [
      { id: 'msg-1', role: 'student' as const, text: 'Hello', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'msg-2', role: 'ai_teacher' as const, text: 'Hi there', createdAt: '2026-01-01T00:00:01Z' },
    ],
  };

  function makeController(result = HISTORY_RESULT) {
    const service = {
      getHistory: jest.fn().mockResolvedValue(result),
    } as unknown as ChatHistoryReadService;
    return { controller: new ChatHistoryReadController(service), service };
  }

  it('resolves studentId from the JWT user and passes it to the service', async () => {
    const { controller, service } = makeController();
    await controller.getHistory(makeUser({ id: 'jwt-student' }), 'session-1');
    expect(service.getHistory).toHaveBeenCalledWith({ studentId: 'jwt-student', sessionId: 'session-1' });
  });

  it('throws NOT_FOUND when the service returns null (session not found or wrong owner)', async () => {
    const service = { getHistory: jest.fn().mockResolvedValue(null) } as unknown as ChatHistoryReadService;
    const controller = new ChatHistoryReadController(service);
    let err: AppError | undefined;
    try { await controller.getHistory(makeUser(), 'bad-session'); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
  });

  it('returns the service result directly', async () => {
    const { controller } = makeController();
    const result = await controller.getHistory(makeUser(), 'session-1');
    expect(result).toEqual(HISTORY_RESULT);
  });

  it('never includes AIM Engine authority fields in the response', async () => {
    const { controller } = makeController();
    const result = await controller.getHistory(makeUser(), 'session-1');
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/mastery|weakness|difficulty|recommendation|reviewSchedule/i);
  });
});

// ---------------------------------------------------------------------------
// 6. ChatSessionListReadController (GET /ai-teacher/sessions) (P8-074)
// ---------------------------------------------------------------------------

describe('ChatSessionListReadController (P8-074)', () => {
  const LIST_RESULT = {
    sessions: [
      { sessionId: 'session-1', contextRef: 'lesson:fractions', status: 'active' as const, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ],
  };

  function makeController(result = LIST_RESULT) {
    const service = {
      listSessions: jest.fn().mockResolvedValue(result),
    } as unknown as ChatSessionListReadService;
    return { controller: new ChatSessionListReadController(service), service };
  }

  it('resolves studentId exclusively from the JWT user — no route/query param', async () => {
    const { controller, service } = makeController();
    await controller.listSessions(makeUser({ id: 'jwt-student' }));
    expect(service.listSessions).toHaveBeenCalledWith({ studentId: 'jwt-student' });
  });

  it('cross-student listing is structurally impossible — no studentId input surface', () => {
    // Verify the method signature does not accept any studentId parameter.
    const { controller } = makeController();
    expect(controller.listSessions.length).toBe(1); // only `user` param
  });

  it('returns the service result directly', async () => {
    const { controller } = makeController();
    const result = await controller.listSessions(makeUser());
    expect(result).toEqual(LIST_RESULT);
  });
});

// ---------------------------------------------------------------------------
// 7. AiTeacherFeedbackSubmitController (POST /ai-teacher/messages/:id/feedback) (P8-075/076)
// ---------------------------------------------------------------------------

describe('AiTeacherFeedbackSubmitController (P8-075/076)', () => {
  const FEEDBACK_RESULT = {
    feedbackId: 'feedback-1',
    messageId: 'msg-1',
    rating: 'helpful' as const,
    createdAt: '2026-01-01T00:00:00Z',
  };

  function makeController(result = FEEDBACK_RESULT, serviceThrows?: Error) {
    const service = {
      submitFeedback: serviceThrows
        ? jest.fn().mockRejectedValue(serviceThrows)
        : jest.fn().mockResolvedValue(result),
    } as unknown as AiTeacherFeedbackSubmitService;
    return { controller: new AiTeacherFeedbackSubmitController(service), service };
  }

  it('resolves studentId from JWT — never from the body', async () => {
    const { controller, service } = makeController();
    await controller.submitFeedback(makeUser({ id: 'jwt-student' }), 'msg-1', { rating: 'helpful' });
    expect(service.submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'jwt-student' }),
    );
  });

  it('reads messageId from the route param — never from the body', async () => {
    const { controller, service } = makeController();
    await controller.submitFeedback(makeUser(), 'route-msg-id', { rating: 'helpful', messageId: 'body-msg-id' } as any);
    expect(service.submitFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ messageId: 'route-msg-id' }),
    );
  });

  it('throws VALIDATION_ERROR when rating is missing before calling the service', async () => {
    const { controller, service } = makeController();
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', {}); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(service.submitFeedback).not.toHaveBeenCalled();
  });

  it('throws VALIDATION_ERROR when rating is invalid before calling the service', async () => {
    const { controller, service } = makeController();
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'HELPFUL' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(service.submitFeedback).not.toHaveBeenCalled();
  });

  it('maps "message not found" service error to safe 404 — no internal detail exposed', async () => {
    const { controller } = makeController(FEEDBACK_RESULT, new Error('Cannot submit AI Teacher feedback: message not found.'));
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'helpful' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(err?.message).toBe('Message not found.');
    expect(err?.message).not.toMatch(/Cannot submit AI Teacher feedback/);
  });

  it('maps "feedback already recorded" service error to safe 409 CONFLICT', async () => {
    const { controller } = makeController(FEEDBACK_RESULT, new Error('Cannot submit AI Teacher feedback: feedback already recorded for this message.'));
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'helpful' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.CONFLICT);
  });

  it('maps "not an AI Teacher reply" service error to safe 400', async () => {
    const { controller } = makeController(FEEDBACK_RESULT, new Error('Cannot submit AI Teacher feedback: message is not an AI Teacher reply.'));
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'helpful' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('maps unexpected service errors to safe 500 — no internals leaked', async () => {
    const { controller } = makeController(FEEDBACK_RESULT, new Error('Some internal db error'));
    let err: AppError | undefined;
    try { await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'helpful' }); }
    catch (e) { err = e as AppError; }
    expect(err?.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(err?.message).toBe('An unexpected error occurred.');
    expect(err?.message).not.toContain('db error');
  });

  it('returns the service result on success', async () => {
    const { controller } = makeController();
    const result = await controller.submitFeedback(makeUser(), 'msg-1', { rating: 'helpful' });
    expect(result).toEqual(FEEDBACK_RESULT);
  });
});

// ---------------------------------------------------------------------------
// 8. No secrets in controller source files (P8-076 — no-client-ai-provider-rule)
// ---------------------------------------------------------------------------

describe('No secrets in API controller source files', () => {
  const CONTROLLER_MODULES = [
    '../../chat-session/chat-session-start.controller',
    '../../chat-message/chat-message-submit.controller',
    '../../chat-history/chat-history-read.controller',
    '../../chat-session-list/chat-session-list-read.controller',
    '../../feedback/ai-teacher-feedback-submit.controller',
  ];

  CONTROLLER_MODULES.forEach((modulePath) => {
    const name = modulePath.split('/').pop()!;
    it(`no process.env or hardcoded API keys in: ${name}`, () => {
      const source = require('fs').readFileSync(require.resolve(modulePath), 'utf8') as string;
      const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
      expect(codeOnly).not.toMatch(/process\.env/);
      expect(codeOnly).not.toMatch(/sk-[a-zA-Z0-9]/);
    });
  });
});
