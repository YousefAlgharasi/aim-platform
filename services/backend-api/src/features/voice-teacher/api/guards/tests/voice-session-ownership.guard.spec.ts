import { VoiceSessionOwnershipGuard } from '../voice-session-ownership.guard';
import { AiChatSessionRepository } from '../../../../ai-teacher/repositories/ai-chat-session.repository';
import { UsersService } from '../../../../users/users.service';

function makeRepository(overrides: Partial<jest.Mocked<Pick<AiChatSessionRepository, 'findById'>>> = {}) {
  return {
    findById: overrides.findById ?? jest.fn().mockResolvedValue(null),
  } as unknown as AiChatSessionRepository;
}

function makeUsersService(internalId: string | null) {
  return {
    findBySupabaseUid: jest.fn().mockResolvedValue(internalId ? { id: internalId } : null),
  } as unknown as UsersService;
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
    const users = makeUsersService(null);
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    const ctx = createContext(null, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Authentication required');
  });

  it('allows when no sessionId param', async () => {
    const repo = makeRepository();
    const users = makeUsersService(null);
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    const ctx = createContext({ id: 'auth-uid-1' }, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('throws when the authenticated user has no internal AIM account', async () => {
    const repo = makeRepository();
    const users = makeUsersService(null);
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    const ctx = createContext({ id: 'auth-uid-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('no internal AIM account');
  });

  it('rejects when session is not found', async () => {
    const repo = makeRepository({ findById: jest.fn().mockResolvedValue(null) });
    const users = makeUsersService('internal-user-1');
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    const ctx = createContext({ id: 'auth-uid-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Voice session not found');
  });

  it('rejects when session belongs to a different student (compares internal ids, not the raw auth uid)', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue({ id: 'session-1', student_id: 'other-internal-user' }),
    });
    const users = makeUsersService('internal-user-1');
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    const ctx = createContext({ id: 'auth-uid-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow('Access denied');
  });

  it('allows when session belongs to the authenticated student, matched by internal id', async () => {
    const repo = makeRepository({
      findById: jest.fn().mockResolvedValue({ id: 'session-1', student_id: 'internal-user-1' }),
    });
    const users = makeUsersService('internal-user-1');
    const guard = new VoiceSessionOwnershipGuard(repo, users);
    // Regression guard for the original bug: the raw auth uid must never be
    // compared directly against session.student_id (an internal users.id).
    const ctx = createContext({ id: 'auth-uid-1' }, { sessionId: 'session-1' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
