// Phase 2 — P2-029
// UsersService unit tests.

import { HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { UserRecord } from './users.types';

const makeUserRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'user-uuid-1',
  supabase_auth_uid: 'supa-uid-1',
  email: 'test@example.com',
  phone: null,
  user_type: 'student',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeUserRecord = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 'user-uuid-1',
  supabaseAuthUid: 'supa-uid-1',
  email: 'test@example.com',
  phone: null,
  userType: 'student',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeMockDb = (rows: unknown[] = [], rowCount: number | null = null) => ({
  query: jest.fn().mockResolvedValue({
    rows,
    rowCount: rowCount ?? rows.length,
  }),
});

describe('UsersService', () => {
  describe('findById', () => {
    it('returns a UserRecord when a matching row exists', async () => {
      const db = makeMockDb([makeUserRow()]);
      const service = new UsersService(db as never);

      const result = await service.findById('user-uuid-1');

      expect(result).toEqual(makeUserRecord());
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      const result = await service.findById('user-uuid-1');

      expect(result).toBeNull();
    });

    it('throws BAD_REQUEST when user ID is empty', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(service.findById('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findBySupabaseUid', () => {
    it('returns a UserRecord when a matching row exists', async () => {
      const db = makeMockDb([makeUserRow()]);
      const service = new UsersService(db as never);

      const result = await service.findBySupabaseUid('supa-uid-1');

      expect(result).toEqual(makeUserRecord());
    });

    it('returns null when no row exists', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      const result = await service.findBySupabaseUid('supa-uid-1');

      expect(result).toBeNull();
    });

    it('throws BAD_REQUEST when UID is empty', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(service.findBySupabaseUid('')).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
        statusCode: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('getById', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeUserRow()]);
      const service = new UsersService(db as never);

      const result = await service.getById('user-uuid-1');

      expect(result.id).toBe('user-uuid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(service.getById('no-such-id')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('getBySupabaseUid', () => {
    it('returns the record when found', async () => {
      const db = makeMockDb([makeUserRow()]);
      const service = new UsersService(db as never);

      const result = await service.getBySupabaseUid('supa-uid-1');

      expect(result.supabaseAuthUid).toBe('supa-uid-1');
    });

    it('throws NOT_FOUND when absent', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(service.getBySupabaseUid('no-uid')).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('upsertBySupabaseUid', () => {
    it('returns the upserted UserRecord', async () => {
      const db = makeMockDb([makeUserRow()]);
      const service = new UsersService(db as never);

      const result = await service.upsertBySupabaseUid({
        supabaseAuthUid: 'supa-uid-1',
        email: 'test@example.com',
      });

      expect(result.supabaseAuthUid).toBe('supa-uid-1');
    });

    it('throws INTERNAL_SERVER_ERROR when DB returns no rows', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(
        service.upsertBySupabaseUid({ supabaseAuthUid: 'supa-uid-1' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('throws BAD_REQUEST when UID is empty', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(
        service.upsertBySupabaseUid({ supabaseAuthUid: '' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.BAD_REQUEST,
      });
    });
  });

  describe('updateById', () => {
    it('returns the updated UserRecord', async () => {
      const updatedRow = makeUserRow({ email: 'new@example.com' });
      const db = makeMockDb([updatedRow]);
      const service = new UsersService(db as never);

      const result = await service.updateById('user-uuid-1', { email: 'new@example.com' });

      expect(result.email).toBe('new@example.com');
    });

    it('throws NOT_FOUND when no row matches', async () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      await expect(
        service.updateById('no-such-id', { email: 'x@example.com' }),
      ).rejects.toMatchObject({
        code: ApiErrorCode.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('assertUserIsActive', () => {
    it('does not throw for an active user', () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      expect(() => service.assertUserIsActive(makeUserRecord())).not.toThrow();
    });

    it('throws FORBIDDEN for a disabled user', () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      expect(() =>
        service.assertUserIsActive(makeUserRecord({ status: 'disabled' })),
      ).toThrow(
        expect.objectContaining({
          code: ApiErrorCode.FORBIDDEN,
          statusCode: HttpStatus.FORBIDDEN,
        }) as AppError,
      );
    });

    it('throws FORBIDDEN for a deleted user', () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      expect(() =>
        service.assertUserIsActive(makeUserRecord({ status: 'deleted' })),
      ).toThrow(
        expect.objectContaining({ code: ApiErrorCode.FORBIDDEN }) as AppError,
      );
    });

    it('throws FORBIDDEN for a pending user', () => {
      const db = makeMockDb([]);
      const service = new UsersService(db as never);

      expect(() =>
        service.assertUserIsActive(makeUserRecord({ status: 'pending' })),
      ).toThrow(
        expect.objectContaining({ code: ApiErrorCode.FORBIDDEN }) as AppError,
      );
    });
  });
});
