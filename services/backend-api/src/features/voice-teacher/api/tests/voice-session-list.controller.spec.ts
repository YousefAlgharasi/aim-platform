import { VoiceSessionListController } from '../voice-session-list.controller';

describe('VoiceSessionListController', () => {
  let controller: VoiceSessionListController;
  const mockUser = { id: 'student-1', email: 'test@test.com' } as any;

  beforeEach(() => {
    controller = new VoiceSessionListController();
  });

  it('should return a sessions array', async () => {
    const result = await controller.listSessions(mockUser);
    expect(result.sessions).toBeDefined();
    expect(Array.isArray(result.sessions)).toBe(true);
  });

  it('should never include AIM authority fields', async () => {
    const result = await controller.listSessions(mockUser);
    const json = JSON.stringify(result);
    expect(json).not.toContain('mastery');
    expect(json).not.toContain('weakness');
  });
});
