// P9-068: Create Start Voice Session API
// VoiceSessionStartController + StartVoiceSessionRequestDto tests.
//
// Bugfix: studentId is now resolved via ResolveInternalUserIdGuard to the
// internal users.id (never the raw Supabase Auth UID) — the controller
// method takes the resolved id directly, not an AuthenticatedUser object.

import { VoiceSessionStartController } from '../voice-session-start.controller';
import { VoiceSessionStartService } from '../../session-start/voice-session-start.service';
import { StartVoiceSessionRequestDto } from '../voice-session-start.dto';
import { StartVoiceSessionResult } from '../../session-start/voice-session-start.types';
import { AppError } from '../../../../common/errors/app-error';

function makeResult(overrides: Partial<StartVoiceSessionResult> = {}): StartVoiceSessionResult {
  return {
    sessionId: 'voice-session-1',
    studentId: 'internal-user-1',
    contextRef: 'lesson:fractions',
    status: 'active',
    createdAt: '2026-06-19T00:00:00.000Z',
    focusRecap: null,
    lastSessionRecap: null,
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

  it('resolves studentId from ResolveInternalUserIdGuard, never from the body', async () => {
    const { controller, service } = makeController();

    await controller.startSession('internal-user-1', {
      contextRef: 'lesson:fractions',
      studentId: 'attacker-supplied-id',
    });

    expect(service.startSession).toHaveBeenCalledWith({
      studentId: 'internal-user-1',
      contextRef: 'lesson:fractions',
    });
  });

  it('returns the service result unchanged', async () => {
    const result = makeResult({ sessionId: 'voice-session-42' });
    const { controller } = makeController(result);

    await expect(
      controller.startSession('internal-user-1', { contextRef: 'lesson:fractions' }),
    ).resolves.toEqual(result);
  });

  it('rejects before calling the service when contextRef is missing', async () => {
    const { controller, service } = makeController();

    await expect(controller.startSession('internal-user-1', {})).rejects.toThrow(AppError);
    expect(service.startSession).not.toHaveBeenCalled();
  });

  it('never computes a mastery, level, weakness, difficulty, recommendation, or review-schedule value', async () => {
    const result = makeResult();
    const { controller } = makeController(result);

    const response = await controller.startSession('internal-user-1', { contextRef: 'lesson:fractions' });
    const serialized = JSON.stringify(response);

    expect(serialized).not.toMatch(/mastery/i);
    expect(serialized).not.toMatch(/\blevel\b/i);
    expect(serialized).not.toMatch(/weakness/i);
    expect(serialized).not.toMatch(/difficulty/i);
    expect(serialized).not.toMatch(/recommendation/i);
    expect(serialized).not.toMatch(/reviewSchedule/i);
  });
});
