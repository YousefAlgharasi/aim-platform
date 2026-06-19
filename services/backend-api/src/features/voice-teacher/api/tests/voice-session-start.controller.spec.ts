import { VoiceSessionStartController } from '../voice-session-start.controller';

describe('VoiceSessionStartController', () => {
  let controller: VoiceSessionStartController;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    controller = new VoiceSessionStartController();
  });

  it('should create a voice session and return sessionId', async () => {
    const result = await controller.startSession({}, mockUser);
    expect(result.sessionId).toBeTruthy();
    expect(result.sessionId).toMatch(/^vs_/);
    expect(result.createdAt).toBeTruthy();
  });

  it('should accept optional contextRef', async () => {
    const result = await controller.startSession(
      { contextRef: 'lesson-123' },
      mockUser,
    );
    expect(result.sessionId).toBeTruthy();
  });

  it('should never include AIM authority fields', async () => {
    const result = await controller.startSession({}, mockUser);
    const json = JSON.stringify(result);
    expect(json).not.toContain('mastery');
    expect(json).not.toContain('weakness');
    expect(json).not.toContain('difficulty');
    expect(json).not.toContain('recommendation');
  });

  it('should generate unique session IDs', async () => {
    const r1 = await controller.startSession({}, mockUser);
    const r2 = await controller.startSession({}, mockUser);
    expect(r1.sessionId).not.toBe(r2.sessionId);
  });
});
