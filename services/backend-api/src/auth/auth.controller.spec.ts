// Phase 2 — P2-025 (updated to pass AuthProfileBootstrapService mock)
import { AuthController } from './auth.controller';
import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { AuthLoginService } from './auth-login.service';
import { RolesService } from '../features/roles/roles.service';
import { UsersService } from '../features/users/users.service';
import { StudentsService } from '../features/students/students.service';
import { AuthenticatedUser } from './authenticated-user';

const makeBootstrapMock = (): jest.Mocked<AuthProfileBootstrapService> =>
  ({ bootstrap: jest.fn() } as unknown as jest.Mocked<AuthProfileBootstrapService>);

const makeAuthLoginMock = (): jest.Mocked<AuthLoginService> =>
  ({
    login: jest.fn(),
    googleLogin: jest.fn(),
    refresh: jest.fn(),
    register: jest.fn(),
    forgotPassword: jest.fn(),
    logout: jest.fn(),
  } as unknown as jest.Mocked<AuthLoginService>);

const makeRolesMock = (): jest.Mocked<RolesService> =>
  ({ getUserRoles: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<RolesService>);

const makeUsersMock = (): jest.Mocked<UsersService> =>
  ({ findBySupabaseUid: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<UsersService>);

const makeStudentsMock = (): jest.Mocked<StudentsService> =>
  ({ findByUserId: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<StudentsService>);

describe('AuthController', () => {
  const controller = new AuthController(
    makeBootstrapMock(),
    makeAuthLoginMock(),
    makeRolesMock(),
    makeUsersMock(),
    makeStudentsMock(),
  );

  it('returns a safe current user response from the authenticated request user', async () => {
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

    await expect(controller.getMe(user)).resolves.toEqual({
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

  it('delegates google login to AuthLoginService.googleLogin', async () => {
    const authLoginMock = makeAuthLoginMock();
    const googleResult = {
      accessToken: 'acc_123',
      refreshToken: 'ref_123',
      expiresAt: 1900000000,
      user: { id: 'usr_123', email: 'test@example.com' },
    };
    (authLoginMock.googleLogin as jest.Mock).mockResolvedValue(googleResult);

    const testController = new AuthController(
      makeBootstrapMock(),
      authLoginMock,
      makeRolesMock(),
      makeUsersMock(),
      makeStudentsMock(),
    );

    const result = await testController.googleLogin({ idToken: 'valid_id_token' });
    expect(authLoginMock.googleLogin).toHaveBeenCalledWith({ idToken: 'valid_id_token' });
    expect(result).toBe(googleResult);
  });
});

