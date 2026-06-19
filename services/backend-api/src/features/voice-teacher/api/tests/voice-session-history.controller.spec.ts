import { VoiceSessionHistoryController } from '../voice-session-history.controller';

describe('VoiceSessionHistoryController', () => {
  let controller: VoiceSessionHistoryController;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    controller = new VoiceSessionHistoryController();
  });

  it('should return session history with sessionId', async () => {
    const result = await controller.getSessionHistory('session-1', mockUser);
    expect(result.sessionId).toBe('session-1');
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
  });

  it('should never include mastery or AIM fields in response', async () => {
    const result = await controller.getSessionHistory('session-1', mockUser);
    const json = JSON.stringify(result);
    expect(json).not.toContain('mastery');
    expect(json).not.toContain('weakness');
    expect(json).not.toContain('difficulty');
  });
});
