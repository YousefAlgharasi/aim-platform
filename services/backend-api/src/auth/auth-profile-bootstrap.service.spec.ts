// Phase 2 — P2-025
// AuthProfileBootstrapService unit tests.
//
// Scope: Auth, Users, Roles only.
//
// Coverage:
//   - student user: creates user row + student profile on first login
//   - student user: idempotent — no new profile on repeated call
//   - admin user:   creates user row + admin profile on first login
//   - admin user:   idempotent — no new profile on repeated call
//   - reviewer/support/system user: creates user row, no profile
//   - userCreated flag reflects whether the user row was newly inserted
//   - supabaseAuthUid is always sourced from the service input, never from a client payload
//   - user_created audit event is logged on first insert only

import { AuthProfileBootstrapService } from './auth-profile-bootstrap.service';
import { UserRecord } from '../features/users/users.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeUserRecord = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 'internal-user-uuid',
  supabaseAuthUid: 'supa-uid-abc',
  email: 'user@example.com',
  phone: null,
  userType: 'student',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

// Build a minimal mock for UsersService.
const makeUsersMock = (
  existingUser: UserRecord | null,
  upsertResult: UserRecord,
) => ({
  findBySupabaseUid: jest.fn().mockResolvedValue(existingUser),
  upsertBySupabaseUid: jest.fn().mockResolvedValue(upsertResult),
});

// Build a mock for DatabaseService that returns rows for the profile INSERT.
const makeDbMock = (profileRows: unknown[] = [{ id: 'profile-uuid', user_id: 'internal-user-uuid' }]) => ({
  query: jest.fn().mockResolvedValue({ rows: profileRows, rowCount: profileRows.length }),
});

// Build a mock AuthLoggingService.
const makeLoggingMock = () => ({
  log: jest.fn().mockResolvedValue(undefined),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthProfileBootstrapService', () => {
  describe('bootstrap — student user (first login)', () => {
    it('creates user row and student profile, returns userCreated=true and profileCreated=true', async () => {
      const userRecord = makeUserRecord({ userType: 'student' });
      const usersMock = makeUsersMock(null, userRecord);   // null → first login
      const dbMock = makeDbMock([{ id: 'sp-uuid', user_id: userRecord.id }]);
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: 'supa-uid-abc',
        email: 'user@example.com',
      });

      expect(result.internalUserId).toBe(userRecord.id);
      expect(result.userType).toBe('student');
      expect(result.status).toBe('active');
      expect(result.userCreated).toBe(true);
      expect(result.profileCreated).toBe(true);
      expect(result.profileType).toBe('student_profile');
    });

    it('logs user_created event on first insert', async () => {
      const userRecord = makeUserRecord({ userType: 'student' });
      const usersMock = makeUsersMock(null, userRecord);
      const dbMock = makeDbMock();
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      await service.bootstrap({ supabaseAuthUid: 'supa-uid-abc', email: null });

      expect(loggingMock.log).toHaveBeenCalledWith('user_created', {
        userId: userRecord.id,
        supabaseAuthUid: userRecord.supabaseAuthUid,
        metadata: { userType: 'student' },
      });
    });

    it('passes supabaseAuthUid from input to upsertBySupabaseUid — never from client', async () => {
      const userRecord = makeUserRecord();
      const usersMock = makeUsersMock(null, userRecord);
      const dbMock = makeDbMock();
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      const uid = 'verified-jwt-uid';
      await service.bootstrap({ supabaseAuthUid: uid, email: 'a@b.com' });

      expect(usersMock.upsertBySupabaseUid).toHaveBeenCalledWith(
        expect.objectContaining({ supabaseAuthUid: uid }),
      );
    });
  });

  describe('bootstrap — student user (repeated login)', () => {
    it('idempotent: profileCreated=false when profile already exists', async () => {
      const userRecord = makeUserRecord({ userType: 'student' });
      const usersMock = makeUsersMock(userRecord, userRecord);   // existing user
      const dbMock = makeDbMock([]);   // ON CONFLICT DO NOTHING — no rows returned
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: 'supa-uid-abc',
        email: 'user@example.com',
      });

      expect(result.userCreated).toBe(false);
      expect(result.profileCreated).toBe(false);
      expect(result.profileType).toBe('student_profile');
    });

    it('does not log user_created when user already existed', async () => {
      const userRecord = makeUserRecord();
      const usersMock = makeUsersMock(userRecord, userRecord);
      const dbMock = makeDbMock([]);
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      await service.bootstrap({ supabaseAuthUid: 'supa-uid-abc', email: null });

      expect(loggingMock.log).not.toHaveBeenCalled();
    });
  });

  describe('bootstrap — admin user', () => {
    it('creates admin profile, returns profileType=admin_profile', async () => {
      const adminRecord = makeUserRecord({ userType: 'admin' });
      const usersMock = makeUsersMock(null, adminRecord);
      const dbMock = makeDbMock([{ id: 'ap-uuid', user_id: adminRecord.id }]);
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: 'supa-uid-admin',
        email: 'admin@example.com',
      });

      expect(result.profileType).toBe('admin_profile');
      expect(result.profileCreated).toBe(true);
    });

    it('admin profile idempotent — profileCreated=false when row already exists', async () => {
      const adminRecord = makeUserRecord({ userType: 'admin' });
      const usersMock = makeUsersMock(adminRecord, adminRecord);
      const dbMock = makeDbMock([]);   // ON CONFLICT DO NOTHING
      const loggingMock = makeLoggingMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: 'supa-uid-admin',
        email: null,
      });

      expect(result.profileCreated).toBe(false);
      expect(result.profileType).toBe('admin_profile');
    });
  });

  describe('bootstrap — other user types', () => {
    it.each(['reviewer', 'support', 'system'])(
      'user_type=%s: no profile created, profileType=null',
      async (userType) => {
        const record = makeUserRecord({ userType: userType as never });
        const usersMock = makeUsersMock(null, record);
        const dbMock = makeDbMock();
        const loggingMock = makeLoggingMock();

        const service = new AuthProfileBootstrapService(
          dbMock as never,
          usersMock as never,
          loggingMock as never,
        );

        const result = await service.bootstrap({
          supabaseAuthUid: 'supa-uid-other',
          email: null,
        });

        expect(result.profileType).toBeNull();
        expect(result.profileCreated).toBe(false);
        // db.query should NOT have been called for a profile INSERT
        expect(dbMock.query).not.toHaveBeenCalled();
      },
    );
  });
});
