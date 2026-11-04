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

  it('resolves existing internal user and existing student profile in GET /auth/me using consistent JWT subject semantics', async () => {
    const existingAuthUid = 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790';
    const existingInternalUserId = 'dcc1fb98-357a-4480-85c8-481bb14e0aa4';
    const existingStudentProfileId = 'c435b86b-b3b5-4aed-8337-7b72e94a214f';

    const usersMock = makeUsersMock();
    usersMock.findBySupabaseUid.mockResolvedValue({
      id: existingInternalUserId,
      supabaseAuthUid: existingAuthUid,
      email: 'ahmedalalawi2022@gmail.com',
      phone: null,
      userType: 'student',
      status: 'active',
      createdAt: '2026-10-27T14:17:22.161Z',
      updatedAt: '2026-11-01T15:32:40.517Z',
    });

    const studentsMock = makeStudentsMock();
    studentsMock.findByUserId.mockResolvedValue({
      id: existingStudentProfileId,
      userId: existingInternalUserId,
      profileType: 'student_profile',
      displayName: 'احمد علاو',
      avatarUrl: null,
      preferredLanguage: 'ar',
      timezone: null,
      createdAt: '2026-10-27T14:17:22.749Z',
      updatedAt: '2026-10-27T14:17:22.749Z',
    });

    const testController = new AuthController(
      makeBootstrapMock(),
      makeAuthLoginMock(),
      makeRolesMock(),
      usersMock,
      studentsMock,
    );

    const me = await testController.getMe({
      id: existingAuthUid,
      email: 'ahmedalalawi2022@gmail.com',
      role: 'authenticated',
      appMetadata: { role: 'student', roles: ['student'] },
      expiresAt: 1_900_000_000,
    });

    expect(usersMock.findBySupabaseUid).toHaveBeenCalledWith(existingAuthUid);
    expect(studentsMock.findByUserId).toHaveBeenCalledWith(existingInternalUserId);
    expect(me.user.id).toBe(existingAuthUid);
    expect(me.profile).toEqual({
      id: existingStudentProfileId,
      profileType: 'student_profile',
      displayName: 'احمد علاو',
      avatarUrl: undefined,
      preferredLanguage: 'ar',
      timezone: undefined,
    });
  });
});

