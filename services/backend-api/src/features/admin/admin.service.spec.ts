// Phase 2 — P2-059
// AdminService unit tests.

import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { UserRecord } from '../users/users.types';

const makeUserRecord = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 'user-uuid-1',
  supabaseAuthUid: 'supa-uid-1',
  email: 'user@example.com',
  phone: null,
  userType: 'student',
  status: 'active',
  createdAt: '2026-06-12T00:00:00.000Z',
  updatedAt: '2026-06-12T00:00:00.000Z',
  ...overrides,
});

const makeMockUsersService = (
  users: UserRecord[] = [],
  total = 0,
): jest.Mocked<Pick<UsersService, 'listAll'>> => ({
  listAll: jest.fn().mockResolvedValue({ users, total }),
});

describe('AdminService', () => {
  describe('listUsers', () => {
    it('returns a paginated user list with supabaseAuthUid stripped', async () => {
      const records = [makeUserRecord()];
      const usersService = makeMockUsersService(records, 1);
      const service = new AdminService(usersService as unknown as UsersService);

      const result = await service.listUsers(1, 20);

      expect(result.users).toHaveLength(1);
      expect(result.users[0]).not.toHaveProperty('supabaseAuthUid');
      expect(result.users[0]).toMatchObject({
        id: 'user-uuid-1',
        email: 'user@example.com',
        phone: null,
        userType: 'student',
        status: 'active',
      });
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('calculates offset correctly from page and limit', async () => {
      const usersService = makeMockUsersService([], 0);
      const service = new AdminService(usersService as unknown as UsersService);

      await service.listUsers(3, 10);

      expect(usersService.listAll).toHaveBeenCalledWith(20, 10);
    });

    it('clamps limit to max 100', async () => {
      const usersService = makeMockUsersService([], 0);
      const service = new AdminService(usersService as unknown as UsersService);

      await service.listUsers(1, 999);

      expect(usersService.listAll).toHaveBeenCalledWith(0, 100);
    });

    it('clamps page to minimum 1', async () => {
      const usersService = makeMockUsersService([], 0);
      const service = new AdminService(usersService as unknown as UsersService);

      await service.listUsers(-5, 20);

      expect(usersService.listAll).toHaveBeenCalledWith(0, 20);
    });

    it('returns correct pagination metadata', async () => {
      const usersService = makeMockUsersService([], 50);
      const service = new AdminService(usersService as unknown as UsersService);

      const result = await service.listUsers(2, 10);

      expect(result.total).toBe(50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('returns empty users array when no records exist', async () => {
      const usersService = makeMockUsersService([], 0);
      const service = new AdminService(usersService as unknown as UsersService);

      const result = await service.listUsers(1, 20);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
