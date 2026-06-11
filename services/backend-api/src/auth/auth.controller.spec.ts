import { AuthController } from './auth.controller';
import { AuthenticatedUser } from './authenticated-user';

describe('AuthController', () => {
  const controller = new AuthController();

  it('returns a safe current user response from the authenticated request user', () => {
    const user: AuthenticatedUser = {
      id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
      email: 'student@example.com',
      role: 'authenticated',
      appMetadata: {
        roles: ['student'],
      },
      issuedAt: 1_800_000_000,
      expiresAt: 1_900_000_000,
    };

    expect(controller.getMe(user)).toEqual({
      user: {
        id: '9c63ef31-463c-45a4-b6c4-6c5d5d53e541',
        email: 'student@example.com',
      },
      session: {
        authenticated: true,
        sessionStatus: 'active',
        expiresAt: 1_900_000_000,
      },
      roles: ['student'],
      permissions: [],
    });
  });
});
