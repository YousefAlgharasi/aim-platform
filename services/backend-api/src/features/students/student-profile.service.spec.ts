// Phase 2 — P2-030
// StudentProfileService unit tests.

import { HttpStatus } from '@nestjs/common';
import { StudentProfileService } from './student-profile.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { StudentProfileRecord } from './student-profile.types';

const makeProfileRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'profile-uuid-1',
  user_id: 'user-uuid-1',
  profile_type: 'student_profile',
  display_name: 'Test Student',
  avatar_url: null,
  preferred_language: 'en',
  timezone: 'UTC',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeProfileRecord = (
  overrides: Partial<StudentProfileRecord> = {},
): StudentProfileRecord => ({
  id: 'profile-uuid-1',
  userId: 'user-uuid-1',
  profileType: 'student_profile',
  displayName: 'Test Student',
  avatarUrl: null,
  preferredLanguage: 'en',
  timezone: 'UTC',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeMockDb = (rows: unknown[] = []) => ({
  query: jest.fn().mockResolvedValue({ rows, rowCount: rows.length }),
});

describe('StudentProfileService', () => {
  describe('findById', () => {
    it('returns a StudentProfileRecord when a matching row exists', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.findById('profile-uuid-1');

      expect(result).toEqual(makeProfileRecord());
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      expect(await service.findById('profile-uuid-1')).toBeNull();
    });

    it('throws BAD_REQUEST when profileId is empty', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(service.findById('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findByUserId', () => {
    it('returns a StudentProfileRecord when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.findByUserId('user-uuid-1');

      expect(result?.userId).toBe('user-uuid-1');
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      expect(await service.findByUserId('user-uuid-1')).toBeNull();
    });

    it('throws BAD_REQUEST when userId is empty', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(service.findByUserId('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.getById('profile-uuid-1');

      expect(result.id).toBe('profile-uuid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(service.getById('no-such-id')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getByUserId', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.getByUserId('user-uuid-1');

      expect(result.userId).toBe('user-uuid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(service.getByUserId('no-such-id')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('create', () => {
    it('returns the created StudentProfileRecord', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.create({
        userId: 'user-uuid-1',
        displayName: 'Test Student',
      });

      expect(result.userId).toBe('user-uuid-1');
      expect(result.profileType).toBe('student_profile');
    });

    it('throws INTERNAL_SERVER_ERROR when DB returns no rows', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

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
      const service = new StudentProfileService(db as never);

      await expect(
        service.create({ userId: 'user-uuid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.CONFLICT,
        statusCode: HttpStatus.CONFLICT,
      });
    });

    it('throws BAD_REQUEST when userId is empty', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(service.create({ userId: '' })).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('upsertByUserId', () => {
    it('returns the upserted StudentProfileRecord', async () => {
      const db = makeMockDb([makeProfileRow()]);
      const service = new StudentProfileService(db as never);

      const result = await service.upsertByUserId({ userId: 'user-uuid-1' });

      expect(result.userId).toBe('user-uuid-1');
    });

    it('throws INTERNAL_SERVER_ERROR when DB returns no rows', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(
        service.upsertByUserId({ userId: 'user-uuid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('updateByUserId', () => {
    it('returns the updated StudentProfileRecord', async () => {
      const updated = makeProfileRow({ display_name: 'Updated Name' });
      const db = makeMockDb([updated]);
      const service = new StudentProfileService(db as never);

      const result = await service.updateByUserId('user-uuid-1', {
        displayName: 'Updated Name',
      });

      expect(result.displayName).toBe('Updated Name');
    });

    it('throws NOT_FOUND when no matching row', async () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      await expect(
        service.updateByUserId('no-such-id', { displayName: 'X' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('assertOwnership', () => {
    it('does not throw when userId matches', () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

      expect(() =>
        service.assertOwnership(makeProfileRecord(), 'user-uuid-1'),
      ).not.toThrow();
    });

    it('throws FORBIDDEN when userId does not match', () => {
      const db = makeMockDb([]);
      const service = new StudentProfileService(db as never);

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
