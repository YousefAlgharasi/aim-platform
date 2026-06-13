// Phase 2 — P2-059
// AdminController unit tests.

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminUserListResponse } from './admin.types';

const makeListResponse = (overrides: Partial<AdminUserListResponse> = {}): AdminUserListResponse => ({
  users: [],
  total: 0,
  page: 1,
  limit: 20,
  ...overrides,
});

const makeMockAdminService = (
  response: AdminUserListResponse = makeListResponse(),
): jest.Mocked<Pick<AdminService, 'listUsers'>> => ({
  listUsers: jest.fn().mockResolvedValue(response),
});

describe('AdminController', () => {
  describe('listUsers', () => {
    it('delegates to AdminService with parsed page and limit', async () => {
      const adminService = makeMockAdminService();
      const controller = new AdminController(adminService as unknown as AdminService);

      await controller.listUsers('2', '50');

      expect(adminService.listUsers).toHaveBeenCalledWith(2, 50);
    });

    it('defaults to page 1 and limit 20 when params are missing', async () => {
      const adminService = makeMockAdminService();
      const controller = new AdminController(adminService as unknown as AdminService);

      await controller.listUsers('1', '20');

      expect(adminService.listUsers).toHaveBeenCalledWith(1, 20);
    });

    it('falls back to 1 and 20 for non-numeric query params', async () => {
      const adminService = makeMockAdminService();
      const controller = new AdminController(adminService as unknown as AdminService);

      await controller.listUsers('abc', 'xyz');

      expect(adminService.listUsers).toHaveBeenCalledWith(1, 20);
    });

    it('returns the AdminService response directly', async () => {
      const expected = makeListResponse({ total: 5, page: 1, limit: 20 });
      const adminService = makeMockAdminService(expected);
      const controller = new AdminController(adminService as unknown as AdminService);

      const result = await controller.listUsers('1', '20');

      expect(result).toBe(expected);
    });
  });
});
