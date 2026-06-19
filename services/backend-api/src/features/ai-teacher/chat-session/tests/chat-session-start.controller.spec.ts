// P8-071: Create Start Chat API
// ChatSessionStartController + StartChatSessionRequestDto tests.

import { ChatSessionStartController } from '../chat-session-start.controller';
import { ChatSessionStartService } from '../chat-session-start.service';
import { StartChatSessionRequestDto } from '../chat-session-start.dto';
import { StartChatSessionResult } from '../chat-session-start.types';
import { AppError } from '../../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeResult(overrides: Partial<StartChatSessionResult> = {}): StartChatSessionResult {
  return {
    sessionId: 'session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    status: 'active',
    createdAt: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('StartChatSessionRequestDto.fromBody', () => {
  it('returns a trimmed contextRef when present and non-blank', () => {
    expect(StartChatSessionRequestDto.fromBody({ contextRef: '  lesson:fractions  ' })).toEqual({
      contextRef: 'lesson:fractions',
    });
  });

  it.each([{ contextRef: '' }, { contextRef: '   ' }, {}, null, undefined, 'string-body', 42])(
    'throws an AppError VALIDATION_ERROR for invalid body %p',
    (body) => {
      expect(() => StartChatSessionRequestDto.fromBody(body)).toThrow(AppError);
    },
  );

  it('ignores any client-supplied studentId field', () => {
    const dto = StartChatSessionRequestDto.fromBody({
      contextRef: 'lesson:fractions',
      studentId: 'attacker-supplied-id',
    });
    expect(dto).toEqual({ contextRef: 'lesson:fractions' });
    expect((dto as unknown as Record<string, unknown>).studentId).toBeUndefined();
  });
});

describe('ChatSessionStartController', () => {
  function makeController(result: StartChatSessionResult = makeResult()) {
    const service = {
      startSession: jest.fn().mockResolvedValue(result),
    } as unknown as ChatSessionStartService;
    const controller = new ChatSessionStartController(service);
    return { controller, service };
  }

  it('resolves studentId from the authenticated user, never from the body', async () => {
    const { controller, service } = makeController();
    const user = makeUser({ id: 'student-1' });

    await controller.startSession(user, {
      contextRef: 'lesson:fractions',
      studentId: 'attacker-supplied-id',
    });

    expect(service.startSession).toHaveBeenCalledWith({
      studentId: 'student-1',
      contextRef: 'lesson:fractions',
    });
  });

  it('returns the service result unchanged', async () => {
    const result = makeResult({ sessionId: 'session-42' });
    const { controller } = makeController(result);

    await expect(
      controller.startSession(makeUser(), { contextRef: 'lesson:fractions' }),
    ).resolves.toEqual(result);
  });

  it('rejects before calling the service when contextRef is missing', async () => {
    const { controller, service } = makeController();

    await expect(controller.startSession(makeUser(), {})).rejects.toThrow(AppError);
    expect(service.startSession).not.toHaveBeenCalled();
  });
});
