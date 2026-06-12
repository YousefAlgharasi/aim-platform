import { HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';

const ROLE_ROW = {
  id: 'role-001',
  key: 'student',
  name: 'Student',
  description: null,
  is_system: true,
  created_at: '2026-06-12T00:00:00Z',
  updated_at: '2026-06-12T00:00:00Z',
};

const PERM_ROW = {
  id: 'perm-001',
  key: 'profiles.read.own',
  scope: 'profiles',
  description: null,
  created_at: '2026-06-12T00:00:00Z',
  updated_at: '2026-06-12T00:00:00Z',
};

function makeDb(responses: { rowCount: number; rows: unknown[] }[]) {
  let call = 0;
  return {
    query: jest.fn().mockImplementation(() => {
      const r = responses[call] ?? { rowCount: 0, rows: [] };
      call++;
      return Promise.resolve(r);
    }),
  };
}

describe('RolesService', () => {
  describe('getRoles', () => {
    it('returns mapped role records', async () => {
      const db = makeDb([{ rowCount: 1, rows: [ROLE_ROW] }]);
      const service = new RolesService(db as never);

      const result = await service.getRoles();

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('student');
      expect(result[0].isSystem).toBe(true);
      expect((result[0] as Record<string, unknown>).is_system).toBeUndefined();
    });
  });

  describe('getRoleByKey', () => {
    it('returns role with permissions', async () => {
      const db = makeDb([
        { rowCount: 1, rows: [ROLE_ROW] },
        { rowCount: 1, rows: [PERM_ROW] },
      ]);
      const service = new RolesService(db as never);

      const result = await service.getRoleByKey('student');

      expect(result.role.key).toBe('student');
      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].key).toBe('profiles.read.own');
    });

    it('throws NOT_FOUND when role does not exist', async () => {
      const db = makeDb([{ rowCount: 0, rows: [] }]);
      const service = new RolesService(db as never);

      await expect(service.getRoleByKey('unknown')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getUserRoles', () => {
    it('returns roles for a valid user', async () => {
      const db = makeDb([{ rowCount: 1, rows: [ROLE_ROW] }]);
      const service = new RolesService(db as never);

      const result = await service.getUserRoles('user-001');

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('student');
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('user_roles'), ['user-001']);
    });

    it('throws BAD_REQUEST on empty userId', async () => {
      const db = makeDb([]);
      const service = new RolesService(db as never);

      await expect(service.getUserRoles('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('getUserPermissions', () => {
    it('returns deduplicated permissions across roles', async () => {
      const db = makeDb([{ rowCount: 1, rows: [PERM_ROW] }]);
      const service = new RolesService(db as never);

      const result = await service.getUserPermissions('user-001');

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('profiles.read.own');
    });

    it('throws BAD_REQUEST on empty userId', async () => {
      const db = makeDb([]);
      const service = new RolesService(db as never);

      await expect(service.getUserPermissions('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('getUserPermissionKeys', () => {
    it('returns only permission key strings', async () => {
      const db = makeDb([{ rowCount: 1, rows: [{ key: 'profiles.read.own' }] }]);
      const service = new RolesService(db as never);

      const result = await service.getUserPermissionKeys('user-001');

      expect(result).toEqual(['profiles.read.own']);
    });
  });

  describe('hasPermission', () => {
    it('returns true when permission exists', async () => {
      const db = makeDb([{ rowCount: 1, rows: [{ exists: true }] }]);
      const service = new RolesService(db as never);

      expect(await service.hasPermission('user-001', 'profiles.read.own')).toBe(true);
    });

    it('returns false when permission does not exist', async () => {
      const db = makeDb([{ rowCount: 1, rows: [{ exists: false }] }]);
      const service = new RolesService(db as never);

      expect(await service.hasPermission('user-001', 'auth.audit.read')).toBe(false);
    });

    it('throws BAD_REQUEST on empty userId', async () => {
      const db = makeDb([]);
      const service = new RolesService(db as never);

      await expect(service.hasPermission('', 'profiles.read.own')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });
});
