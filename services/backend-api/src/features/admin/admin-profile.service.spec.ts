// Phase 2 — P2-031
// AdminProfileService unit tests.

import { HttpStatus } from '@nestjs/common';
import { AdminProfileService } from './admin-profile.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AdminProfileRecord } from './admin-profile.types';

const makeProfileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'admin-profile-uuid-1',
  user_id: 'user-uuid-1',
  profile_type: 'admin_profile',
  display_name: 'Admin User',
  avatar_url: null,
  department: 'Engineering',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeProfileRecord = (
  overrides: Partial<AdminProfileRecord> = {},
): AdminProfileRecord => ({
  id: 'admin-profile-uuid-1',
  userId: 'user-uuid-1',
  profileType: 'admin_profile',
  displayName: 'Admin User',
  avatarUrl: null,
  department: 'Engineering',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeMockDb = (rows: unknown[] = []) => ({
  query: jest.fn().mockResolvedValue({ rows, rowCount: rows.length }),
});

describe('AdminProfileService', () => {
  describe('findById', () => {
    it('returns an AdminProfileRecord when a matching row exists', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.findById('admin-profile-uuid-1');

      expect(result).toEqual(makeProfileRecord());
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      expect(await service.findById('admin-profile-uuid-1')).toBeNull();
    });

    it('throws BAD_REQUEST when profileId is empty', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(service.findById('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findByUserId', () => {
    it('returns an AdminProfileRecord when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.findByUserId('user-uuid-1');

      expect(result?.userId).toBe('user-uuid-1');
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      expect(await service.findByUserId('user-uuid-1')).toBeNull();
    });

    it('throws BAD_REQUEST when userId is empty', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(service.findByUserId('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.getById('admin-profile-uuid-1');

      expect(result.id).toBe('admin-profile-uuid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(service.getById('no-such-id')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getByUserId', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.getByUserId('user-uuid-1');

      expect(result.userId).toBe('user-uuid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(service.getByUserId('no-such-id')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('create', () => {
    it('returns the created AdminProfileRecord', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.create({
        userId: 'user-uuid-1',
        displayName: 'Admin User',
        department: 'Engineering',
      });

      expect(result.userId).toBe('user-uuid-1');
      expect(result.profileType).toBe('admin_profile');
      expect(result.department).toBe('Engineering');
    });

    it('throws INTERNAL_SERVER_ERROR when DB returns no rows', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(
        service.create({ userId: 'user-uuid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('throws CONFLICT on unique violation (pg code 23505)', async () => {
      const pgUniqueError = Object.assign(new Error('unique violation'), {
        code: '23505',
      });
      const db = { query: jest.fn().mockRejectedValue(pgUniqueError) };
      const service = new AdminProfileService(db as never);

      await expect(
        service.create({ userId: 'user-uuid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it('throws BAD_REQUEST when userId is empty', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(service.create({ userId: '' })).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('upsertByUserId', () => {
    it('returns the upserted AdminProfileRecord', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new AdminProfileService(db as never);

      const result = await service.upsertByUserId({ userId: 'user-uuid-1' });

      expect(result.userId).toBe('user-uuid-1');
    });

    it('throws INTERNAL_SERVER_ERROR when DB returns no rows', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(
        service.upsertByUserId({ userId: 'user-uuid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('updateByUserId', () => {
    it('returns the updated AdminProfileRecord', async () => {
      const updated = makeProfileRow({ department: 'Product' });
      const db = makeMockDb([updated]);
      const service = new AdminProfileService(db as never);

      const result = await service.updateByUserId('user-uuid-1', {
        department: 'Product',
      });

      expect(result.department).toBe('Product');
    });

    it('throws NOT_FOUND when no matching row', async () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      await expect(
        service.updateByUserId('no-such-id', { department: 'X' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('assertOwnership', () => {
    it('does not throw when userId matches', () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      expect(() =>
        service.assertOwnership(makeProfileRecord(), 'user-uuid-1'),
      ).not.toThrow();
    });

    it('throws FORBIDDEN when userId does not match', () => {
      const db = makeMockDb([]);
      const service = new AdminProfileService(db as never);

      expect(() =>
        service.assertOwnership(makeProfileRecord(), 'other-user-id'),
      ).toThrow(
        expect.objectContaining({
          code: ApiErrorCode.FORBIDDEN,
          statusCode: HttpStatus.FORBIDDEN,
        }),
      );
    });
  });
});
