import { VoiceSessionOwnershipGuard } from '../voice-session-ownership.guard';

describe('VoiceSessionOwnershipGuard', () => {
  let guard: VoiceSessionOwnershipGuard;

  beforeEach(() => {
    guard = new VoiceSessionOwnershipGuard();
  });

  const createContext = (user: any, params: any) => ({
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  }) as any;

  it('should allow authenticated user', () => {
    const ctx = createContext({ id: 'student-1' }, { sessionId: 'session-1' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw when user is missing', () => {
    const ctx = createContext(null, { sessionId: 'session-1' });
    expect(() => guard.canActivate(ctx)).toThrow();
  });

  it('should allow when no sessionId param', () => {
    const ctx = createContext({ id: 'student-1' }, {});
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
