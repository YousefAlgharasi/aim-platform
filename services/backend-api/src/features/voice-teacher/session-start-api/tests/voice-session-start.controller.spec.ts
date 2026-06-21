// P9-068: Create Start Voice Session API
// VoiceSessionStartController + StartVoiceSessionRequestDto tests.

import { VoiceSessionStartController } from '../voice-session-start.controller';
import { VoiceSessionStartService } from '../../session-start/voice-session-start.service';
import { StartVoiceSessionRequestDto } from '../voice-session-start.dto';
import { StartVoiceSessionResult } from '../../session-start/voice-session-start.types';
import { AppError } from '../../../../common/errors/app-error';
import { AuthenticatedUser } from '../../../../auth/authenticated-user';

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return { id: 'student-1', email: 'student@example.com', ...overrides } as AuthenticatedUser;
}

function makeResult(overrides: Partial<StartVoiceSessionResult> = {}): StartVoiceSessionResult {
  return {
    sessionId: 'voice-session-1',
    studentId: 'student-1',
    contextRef: 'lesson:fractions',
    status: 'active',
    createdAt: '2026-06-19T00:00:00.000Z',
    ...overrides,
  };
}

describe('StartVoiceSessionRequestDto.fromBody', () => {
  it('returns a trimmed contextRef when present and non-blank', () => {
    expect(StartVoiceSessionRequestDto.fromBody({ contextRef: '  lesson:fractions  ' })).toEqual({
      contextRef: 'lesson:fractions',
    });
  });

  it.each([{ contextRef: '' }, { contextRef: '   ' }, {}, null, undefined, 'string-body', 42])(
    'throws an AppError VALIDATION_ERROR for invalid body %p',
    (body) => {
      expect(() => StartVoiceSessionRequestDto.fromBody(body)).toThrow(AppError);
    },
  );

  it('ignores any client-supplied studentId field', () => {
    const dto = StartVoiceSessionRequestDto.fromBody({
      contextRef: 'lesson:fractions',
      studentId: 'attacker-supplied-id',
    });
    expect(dto).toEqual({ contextRef: 'lesson:fractions' });
    expect((dto as unknown as Record<string, unknown>).studentId).toBeUndefined();
  });
});

describe('VoiceSessionStartController', () => {
  function makeController(result: StartVoiceSessionResult = makeResult()) {
    const service = {
      startSession: jest.fn().mockResolvedValue(result),
    } as unknown as VoiceSessionStartService;
    const controller = new VoiceSessionStartController(service);
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
    const result = makeResult({ sessionId: 'voice-session-42' });
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

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const result = makeResult();
    const { controller } = makeController(result);

    const response = await controller.startSession(makeUser(), { contextRef: 'lesson:fractions' });
    const serialized = JSON.stringify(response);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });
});
