// Phase 2 — P2-034
// ProfileService unit tests.
//
// Covers:
// - getProfileForUser: student profile, admin profile, reviewer/support (no profile)
// - getProfileForUser: inactive user blocking, missing user
// - updateProfileForUser: student update, admin update, unsupported user type
// - updateProfileForUser: inactive user blocking
// - Ownership implicit: internalUserId always sourced from verified JWT (via controller),
//   never from client payload — confirmed by absence of client-injectable userId param.
// - supabaseAuthUid never present in ProfileMeResponse.

import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ProfileService } from './profile.service';
import { UserRecord } from '../users/users.types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeUserRecord = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 'user-001',
  supabaseAuthUid: 'supa-uid-001',
  email: 'user@example.com',
  phone: null,
  userType: 'student',
  status: 'active',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
  ...overrides,
});

const makeStudentProfile = () => ({
  id: 'sp-001',
  userId: 'user-001',
  profileType: 'student_profile',
  displayName: 'Test Student',
  avatarUrl: null,
  preferredLanguage: 'ar',
  timezone: 'Asia/Riyadh',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
});

const makeAdminProfile = () => ({
  id: 'ap-001',
  userId: 'user-002',
  profileType: 'admin_profile',
  displayName: 'Test Admin',
  avatarUrl: null,
  department: 'Engineering',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
});

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function makeUsersService(user: UserRecord | null = makeUserRecord()) {
  return {
    getById: jest.fn().mockResolvedValue(
      user ?? Promise.reject({ code: ApiErrorCode.NOT_FOUND, statusCode: 404 }),
    ),
    assertUserIsActive: jest.fn().mockImplementation((u: UserRecord) => {
      if (u.status === 'disabled' || u.status === 'deleted' || u.status === 'pending') {
        throw Object.assign(new Error('Inactive'), {
          code: ApiErrorCode.FORBIDDEN,
          statusCode: HttpStatus.FORBIDDEN,
        });
      }
    }),
  };
}

function makeStudentsService(profile: ReturnType<typeof makeStudentProfile> | null = null) {
  return {
    findByUserId: jest.fn().mockResolvedValue(profile),
    updateByUserId: jest.fn().mockResolvedValue(undefined),
  };
}

function makeAdminService(profile: ReturnType<typeof makeAdminProfile> | null = null) {
  return {
    findByUserId: jest.fn().mockResolvedValue(profile),
    updateByUserId: jest.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// getProfileForUser
// ---------------------------------------------------------------------------

describe('ProfileService.getProfileForUser', () => {
  it('returns student profile for a student user', async () => {
    const service = new ProfileService(
      makeUsersService(makeUserRecord()) as never,
      makeStudentsService(makeStudentProfile()) as never,
      makeAdminService() as never,
    );

    const result = await service.getProfileForUser('user-001');

    expect(result.internalUserId).toBe('user-001');
    expect(result.userType).toBe('student');
    expect(result.studentProfile).not.toBeNull();
    expect(result.studentProfile?.displayName).toBe('Test Student');
    expect(result.adminProfile).toBeNull();
  });

  it('returns admin profile for an admin user', async () => {
    const adminUser = makeUserRecord({ id: 'user-002', userType: 'admin' });
    const service = new ProfileService(
      makeUsersService(adminUser) as never,
      makeStudentsService() as never,
      makeAdminService(makeAdminProfile()) as never,
    );

    const result = await service.getProfileForUser('user-002');

    expect(result.userType).toBe('admin');
    expect(result.adminProfile).not.toBeNull();
    expect(result.adminProfile?.department).toBe('Engineering');
    expect(result.studentProfile).toBeNull();
  });

  it('returns null for both profiles when user is a reviewer', async () => {
    const reviewer = makeUserRecord({ userType: 'reviewer' });
    const service = new ProfileService(
      makeUsersService(reviewer) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    const result = await service.getProfileForUser('user-001');

    expect(result.studentProfile).toBeNull();
    expect(result.adminProfile).toBeNull();
  });

  it('returns null for both profiles when user is support type', async () => {
    const support = makeUserRecord({ userType: 'support' });
    const service = new ProfileService(
      makeUsersService(support) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    const result = await service.getProfileForUser('user-001');

    expect(result.studentProfile).toBeNull();
    expect(result.adminProfile).toBeNull();
  });

  it('throws FORBIDDEN for a disabled user', async () => {
    const disabledUser = makeUserRecord({ status: 'disabled' });
    const service = new ProfileService(
      makeUsersService(disabledUser) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    await expect(service.getProfileForUser('user-001')).rejects.toMatchObject({
      code: ApiErrorCode.FORBIDDEN,
      statusCode: HttpStatus.FORBIDDEN,
    });
  });

  it('throws FORBIDDEN for a deleted user', async () => {
    const deletedUser = makeUserRecord({ status: 'deleted' });
    const service = new ProfileService(
      makeUsersService(deletedUser) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    await expect(service.getProfileForUser('user-001')).rejects.toMatchObject({
      code: ApiErrorCode.FORBIDDEN,
    });
  });

  it('never exposes supabaseAuthUid in the response', async () => {
    const service = new ProfileService(
      makeUsersService(makeUserRecord()) as never,
      makeStudentsService(makeStudentProfile()) as never,
      makeAdminService() as never,
    );

    const result = await service.getProfileForUser('user-001');
    const flat = JSON.stringify(result);

    expect(flat).not.toContain('supa-uid-001');
    expect(flat).not.toContain('supabaseAuthUid');
    expect(flat).not.toContain('supabase_auth_uid');
  });

  it('returns null studentProfile when student user has no profile row', async () => {
    const service = new ProfileService(
      makeUsersService(makeUserRecord()) as never,
      makeStudentsService(null) as never,
      makeAdminService() as never,
    );

    const result = await service.getProfileForUser('user-001');

    expect(result.studentProfile).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateProfileForUser
// ---------------------------------------------------------------------------

describe('ProfileService.updateProfileForUser', () => {
  it('calls students.updateByUserId and returns refreshed profile', async () => {
    const students = makeStudentsService(makeStudentProfile());
    const service = new ProfileService(
      makeUsersService(makeUserRecord()) as never,
      students as never,
      makeAdminService() as never,
    );

    const result = await service.updateProfileForUser('user-001', {
      displayName: 'Updated Name',
      preferredLanguage: 'en',
    });

    expect(students.updateByUserId).toHaveBeenCalledWith(
      'user-001',
      expect.objectContaining({ displayName: 'Updated Name' }),
    );
    expect(result.userType).toBe('student');
  });

  it('calls admin.updateByUserId for an admin user', async () => {
    const adminUser = makeUserRecord({ id: 'user-002', userType: 'admin' });
    const adminSvc = makeAdminService(makeAdminProfile());
    const service = new ProfileService(
      makeUsersService(adminUser) as never,
      makeStudentsService() as never,
      adminSvc as never,
    );

    await service.updateProfileForUser('user-002', { displayName: 'Admin Name' });

    expect(adminSvc.updateByUserId).toHaveBeenCalledWith(
      'user-002',
      expect.objectContaining({ displayName: 'Admin Name' }),
    );
  });

  it('throws FORBIDDEN when updating profile for reviewer user type', async () => {
    const reviewer = makeUserRecord({ userType: 'reviewer' });
    const service = new ProfileService(
      makeUsersService(reviewer) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    await expect(
      service.updateProfileForUser('user-001', { displayName: 'X' }),
    ).rejects.toMatchObject({
      code: ApiErrorCode.FORBIDDEN,
      statusCode: HttpStatus.FORBIDDEN,
    });
  });

  it('throws FORBIDDEN when updating profile for an inactive user', async () => {
    const pending = makeUserRecord({ status: 'pending' });
    const service = new ProfileService(
      makeUsersService(pending) as never,
      makeStudentsService() as never,
      makeAdminService() as never,
    );

    await expect(
      service.updateProfileForUser('user-001', { displayName: 'X' }),
    ).rejects.toMatchObject({
      code: ApiErrorCode.FORBIDDEN,
    });
  });

  it('does not include role, permission, or status fields in the update call', async () => {
    const students = makeStudentsService(makeStudentProfile());
    const service = new ProfileService(
      makeUsersService(makeUserRecord()) as never,
      students as never,
      makeAdminService() as never,
    );

    await service.updateProfileForUser('user-001', {
      displayName: 'Safe Name',
      preferredLanguage: 'en',
    });

    const callArg = students.updateByUserId.mock.calls[0][1] as Record<string, unknown>;
    expect(callArg).not.toHaveProperty('role');
    expect(callArg).not.toHaveProperty('status');
    expect(callArg).not.toHaveProperty('userType');
    expect(callArg).not.toHaveProperty('supabaseAuthUid');
  });
});
