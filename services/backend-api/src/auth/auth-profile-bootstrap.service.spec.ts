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

// Build a mock AnalyticsEventIngestionService.
const makeAnalyticsMock = () => ({
  ingest: jest.fn().mockResolvedValue(undefined),
});

// Build a mock BillingRepository.
const makeBillingRepoMock = () => ({
  findPlanByType: jest.fn().mockResolvedValue({ id: 'free-plan-uuid', planType: 'free' }),
});

// Build a mock SubscriptionService.
const makeSubscriptionServiceMock = () => ({
  getUserSubscriptions: jest.fn().mockResolvedValue([]),
  createSubscription: jest.fn().mockResolvedValue({ id: 'sub-uuid' }),
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
      );

      const uid = 'verified-jwt-uid';
      await service.bootstrap({ supabaseAuthUid: uid, email: 'a@b.com' });

      expect(usersMock.upsertBySupabaseUid).toHaveBeenCalledWith(
        expect.objectContaining({ supabaseAuthUid: uid }),
      );
    });

    it('persists display_name, avatar_url, preferred_language, and timezone into student_profiles and returns them', async () => {
      const userRecord = makeUserRecord({
        id: '1a2b02a1-cb8a-4fe8-b23a-13019cd61938',
        supabaseAuthUid: 'fea999be-db75-4690-844c-4bc054f7fe3c',
        email: 'ahmedalalawi2022@gmail.com',
        userType: 'student',
      });
      const usersMock = makeUsersMock(null, userRecord);
      const dbMock = {
        query: jest
          .fn()
          // 1. ensureStudentProfile INSERT
          .mockResolvedValueOnce({
            rows: [{ id: '533d9ecd-b7eb-4113-9b53-3da9125381d2', user_id: userRecord.id }],
            rowCount: 1,
          })
          // 2. syncStudentProfileMetadata UPDATE
          .mockResolvedValueOnce({
            rows: [
              {
                id: '533d9ecd-b7eb-4113-9b53-3da9125381d2',
                user_id: userRecord.id,
                display_name: 'احمد علاو',
                avatar_url: 'https://example.com/pic.jpg',
                preferred_language: 'ar',
                timezone: 'Asia/Riyadh',
              },
            ],
            rowCount: 1,
          })
          // 3. ensureRoleAssigned INSERT
          .mockResolvedValue({ rows: [], rowCount: 0 }),
      };

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        makeLoggingMock() as never,
        makeAnalyticsMock() as never,
        makeBillingRepoMock() as never,
        makeSubscriptionServiceMock() as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: userRecord.supabaseAuthUid,
        email: userRecord.email,
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/pic.jpg',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
      });

      expect(result).toEqual({
        internalUserId: userRecord.id,
        userType: 'student',
        status: 'active',
        userCreated: true,
        profileCreated: true,
        profileType: 'student_profile',
        profileId: '533d9ecd-b7eb-4113-9b53-3da9125381d2',
        displayName: 'احمد علاو',
        avatarUrl: 'https://example.com/pic.jpg',
        preferredLanguage: 'ar',
        timezone: 'Asia/Riyadh',
      });
    });
  });

  describe('bootstrap — student user (repeated login)', () => {
    it('idempotent: profileCreated=false when profile already exists', async () => {
      const userRecord = makeUserRecord({ userType: 'student' });
      const usersMock = makeUsersMock(userRecord, userRecord);   // existing user
      const dbMock = makeDbMock([]);   // ON CONFLICT DO NOTHING — no rows returned
      const loggingMock = makeLoggingMock();
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
      );

      await service.bootstrap({ supabaseAuthUid: 'supa-uid-abc', email: null });

      expect(loggingMock.log).not.toHaveBeenCalled();
    });

    it('never uses internalUserId as supabase_auth_uid and does not create duplicate users or profiles', async () => {
      const existingRecord = makeUserRecord({
        id: 'dcc1fb98-357a-4480-85c8-481bb14e0aa4',
        supabaseAuthUid: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
        email: 'ahmedalalawi2022@gmail.com',
      });
      const usersMock = {
        findBySupabaseUid: jest.fn().mockResolvedValue(null),
        findById: jest.fn().mockResolvedValue(existingRecord),
        upsertBySupabaseUid: jest.fn().mockResolvedValue(existingRecord),
      };
      const dbMock = makeDbMock([]); // existing student_profiles row -> ON CONFLICT DO NOTHING
      const loggingMock = makeLoggingMock();
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: existingRecord.id, // internalUserId mistakenly passed
        email: existingRecord.email,
      });

      expect(usersMock.upsertBySupabaseUid).toHaveBeenCalledWith({
        supabaseAuthUid: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
        email: 'ahmedalalawi2022@gmail.com',
        phone: null,
      });
      expect(result.internalUserId).toBe('dcc1fb98-357a-4480-85c8-481bb14e0aa4');
      expect(result.userCreated).toBe(false);
      expect(result.profileCreated).toBe(false);
    });

    it('resolves existing canonical user by verified email via findByEmailWithAuthUser and preserves existing profile', async () => {
      const existingRecord = makeUserRecord({
        id: 'dcc1fb98-357a-4480-85c8-481bb14e0aa4',
        supabaseAuthUid: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
        email: 'ahmedalalawi2022@gmail.com',
      });
      const usersMock = {
        findBySupabaseUid: jest.fn().mockResolvedValue(null),
        findById: jest.fn().mockResolvedValue(null),
        findByEmailWithAuthUser: jest.fn().mockResolvedValue(existingRecord),
        upsertBySupabaseUid: jest.fn().mockResolvedValue(existingRecord),
      };
      const dbMock = makeDbMock([]);
      const loggingMock = makeLoggingMock();
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
      );

      const result = await service.bootstrap({
        supabaseAuthUid: 'unrecognized-uid-123',
        email: 'ahmedalalawi2022@gmail.com',
      });

      expect(usersMock.findByEmailWithAuthUser).toHaveBeenCalledWith('ahmedalalawi2022@gmail.com');
      expect(usersMock.upsertBySupabaseUid).toHaveBeenCalledWith({
        supabaseAuthUid: 'f090a6e4-4f6f-4dfc-9a13-bb7b98c87790',
        email: 'ahmedalalawi2022@gmail.com',
        phone: null,
      });
      expect(result.internalUserId).toBe('dcc1fb98-357a-4480-85c8-481bb14e0aa4');
      expect(result.userCreated).toBe(false);
      expect(result.profileCreated).toBe(false);
    });
  });

  describe('bootstrap — admin user', () => {
    it('creates admin profile, returns profileType=admin_profile', async () => {
      const adminRecord = makeUserRecord({ userType: 'admin' });
      const usersMock = makeUsersMock(null, adminRecord);
      const dbMock = makeDbMock([{ id: 'ap-uuid', user_id: adminRecord.id }]);
      const loggingMock = makeLoggingMock();
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

      const service = new AuthProfileBootstrapService(
        dbMock as never,
        usersMock as never,
        loggingMock as never,
        analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
      const analyticsMock = makeAnalyticsMock();
      const billingRepoMock = makeBillingRepoMock();
      const subscriptionServiceMock = makeSubscriptionServiceMock();

        const service = new AuthProfileBootstrapService(
          dbMock as never,
          usersMock as never,
          loggingMock as never,
          analyticsMock as never,
        billingRepoMock as never,
        subscriptionServiceMock as never,
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
