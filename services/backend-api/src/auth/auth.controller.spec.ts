// Phase 2 — P2-025 (updated to pass AuthProfileBootstrapService mock)
import { AuthController } from './auth.controller';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { AuthenticatedUser } from './authenticated-user';

const makeBootstrapMock = (): jest.Mocked<AuthProfileBootstrapService> =>
  ({ bootstrap: jest.fn() } as unknown as jest.Mocked<AuthProfileBootstrapService>);

describe('AuthController', () => {
  const controller = new AuthController(makeBootstrapMock());

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
