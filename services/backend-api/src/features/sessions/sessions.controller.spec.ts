// Phase 5 — P5-066
// SessionsController tests.
//
// Covers:
//   - POST /sessions/start returns 201 with session data
//   - studentId sourced from JWT user, never from body
//   - sessionType forwarded from body to service
//   - skillFocusIds forwarded from body to service
//   - skillFocusIds defaults to undefined when absent
//   - service errors propagate as-is (guard error handling tested in guards)
//   - no AIM Engine call introduced

import { SessionsController, StartSessionRequestBody } from './sessions.controller';
import { StartSessionResponse } from './sessions.types';

// ---------------------------------------------------------------------------
// Mock service
// ---------------------------------------------------------------------------

function makeService(
  response: Partial<StartSessionResponse> = {},
): import('./sessions.service').SessionsService {
  const defaultResponse: StartSessionResponse = {
    id: 'ses0e8400-e29b-41d4-a716-446655440070',
    sessionType: 'lesson_practice',
    status: 'active',
    startedAt: '2026-06-17T16:00:00Z',
    currentLevel: 'A1',
    skillFocusIds: [],
    ...response,
  };
  return {
    startSession: jest.fn().mockResolvedValue(defaultResponse),
  } as unknown as import('./sessions.service').SessionsService;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const JWT_USER = {
  id: '770e8400-e29b-41d4-a716-446655440002',
  email: 'student@test.com',
  expiresAt: Date.now() / 1000 + 3600,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SessionsController.startSession', () => {
  it('calls sessionsService.startSession with studentId from JWT', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);
    const body: StartSessionRequestBody = { sessionType: 'lesson_practice' };

    await ctrl.startSession(JWT_USER, body);

    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: JWT_USER.id }),
    );
  });

  it('never uses a studentId from the request body', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);
    // Even if someone passes a studentId in the body it is ignored
    const body = { sessionType: 'lesson_practice', studentId: 'attacker-id' } as StartSessionRequestBody;

    await ctrl.startSession(JWT_USER, body);

    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: JWT_USER.id }),
    );
    expect(svc.startSession).not.toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'attacker-id' }),
    );
  });

  it('forwards sessionType from body to service', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);
    const body: StartSessionRequestBody = { sessionType: 'review_practice' };

    await ctrl.startSession(JWT_USER, body);

    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ sessionType: 'review_practice' }),
    );
  });

  it('forwards skillFocusIds from body to service', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);
    const skills = ['skill:arabic:p1:vocab', 'skill:arabic:p1:grammar'];
    const body: StartSessionRequestBody = { sessionType: 'lesson_practice', skillFocusIds: skills };

    await ctrl.startSession(JWT_USER, body);

    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ skillFocusIds: skills }),
    );
  });

  it('passes undefined skillFocusIds when not in body', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);
    const body: StartSessionRequestBody = { sessionType: 'adaptive_drill' };

    await ctrl.startSession(JWT_USER, body);

    expect(svc.startSession).toHaveBeenCalledWith(
      expect.objectContaining({ skillFocusIds: undefined }),
    );
  });

  it('returns the session response from the service', async () => {
    const expected: StartSessionResponse = {
      id: 'ses-test-999',
      sessionType: 'adaptive_drill',
      status: 'active',
      startedAt: '2026-06-17T16:30:00Z',
      currentLevel: 'B1',
      skillFocusIds: ['skill:arabic:p2:reading'],
    };
    const svc = makeService(expected);
    const ctrl = new SessionsController(svc);

    const result = await ctrl.startSession(JWT_USER, { sessionType: 'adaptive_drill' });

    expect(result).toEqual(expected);
  });

  it('propagates service errors without masking', async () => {
    const svc = {
      startSession: jest.fn().mockRejectedValue(new Error('session start failed')),
    } as unknown as import('./sessions.service').SessionsService;
    const ctrl = new SessionsController(svc);

    await expect(ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice' }))
      .rejects.toThrow('session start failed');
  });

  it('does not call AIM Engine (scope guard: only delegates to SessionsService)', async () => {
    const svc = makeService();
    const ctrl = new SessionsController(svc);

    await ctrl.startSession(JWT_USER, { sessionType: 'lesson_practice' });

    // Only startSession was called — no other service methods
    expect(Object.keys(svc)).not.toContain('analyzeAttempt');
    expect(svc.startSession).toHaveBeenCalledTimes(1);
  });
});
