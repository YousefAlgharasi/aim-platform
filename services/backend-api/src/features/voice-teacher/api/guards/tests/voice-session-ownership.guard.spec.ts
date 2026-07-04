import { VoiceSessionOwnershipGuard } from '../voice-session-ownership.guard';
import { AiChatSessionRepository } from '../../../../ai-teacher/repositories/ai-chat-session.repository';

function makeRepository(overrides: Partial<jest.Mocked<Pick<AiChatSessionRepository, 'findById'>>> = {}) {
  return {
    findById: overrides.findById ?? jest.fn().mockResolvedValue(null),
  } as unknown as AiChatSessionRepository;
}

function createContext(user: any, params: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as any;
}

describe('VoiceSessionOwnershipGuard', () => {
  it('throws when user is missing', async () => {
    const repo = makeRepository();
    const guard = new VoiceSessionOwnershipGuard(repo);
    const ctx = createContext(null, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Authentication required');
  });

  it('allows when no sessionId param', async () => {
    const repo = makeRepository();
    const guard = new VoiceSessionOwnershipGuard(repo);
    const ctx = createContext({ id: 'student-1' }, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects when session is not found', async () => {
    const repo = makeRepository({ findById: jest.fn().mockResolvedValue(null) });
    const guard = new VoiceSessionOwnershipGuard(repo);
    const ctx = createContext({ id: 'student-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Voice session not found');
  });

  it('rejects when session belongs to a different student', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue({ id: 'session-1', student_id: 'other-student' }),
    });
    const guard = new VoiceSessionOwnershipGuard(repo);
    const ctx = createContext({ id: 'student-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Access denied');
  });

  it('allows when session belongs to the authenticated student', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue({ id: 'session-1', student_id: 'student-1' }),
    });
    const guard = new VoiceSessionOwnershipGuard(repo);
    const ctx = createContext({ id: 'student-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
