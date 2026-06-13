// Phase 2 — P2-061
// AdminUsersService.getUserDetail unit tests.

import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AdminUsersService } from './admin-users.service';

const USER_ROW = {
  id: 'user-001',
  email: 'admin@example.com',
  phone: null,
  user_type: 'admin',
  status: 'active',
  created_at: '2026-06-12T00:00:00Z',
  updated_at: '2026-06-12T00:00:00Z',
};

const ROLE_ROW = { key: 'admin' };

const STUDENT_PROFILE_ROW = {
  id: 'sp-001',
  display_name: 'Test Student',
  native_language: 'ar',
  target_language: 'en',
  created_at: '2026-06-12T00:00:00Z',
  updated_at: '2026-06-12T00:00:00Z',
};

function makeDb(
  userRows: unknown[],
  roleRows: unknown[] = [],
  studentRows: unknown[] = [],
  adminRows: unknown[] = [],
) {
  let call = 0;
  const responses = [
    { rowCount: userRows.length, rows: userRows },
    { rowCount: roleRows.length, rows: roleRows },
    { rowCount: studentRows.length, rows: studentRows },
    { rowCount: adminRows.length, rows: adminRows },
  ];

  return {
    query: jest.fn().mockImplementation(() => {
      const base = call === 0 ? responses[0] : responses[Math.min(call, 3)];
      if (call > 0 && call <= 3) {
        call++;
        return Promise.resolve(responses[call - 1] ?? { rowCount: 0, rows: [] });
      }
      call++;
      return Promise.resolve(base);
    }),
  };
}

function makeDbSequential(responses: { rowCount: number; rows: unknown[] }[]) {
  let call = 0;
  return {
    query: jest.fn().mockImplementation(() => {
      const r = responses[call] ?? { rowCount: 0, rows: [] };
      call++;
      return Promise.resolve(r);
    }),
  };
}

describe('AdminUsersService.getUserDetail', () => {
  it('throws BAD_REQUEST for empty userId', async () => {
    const db = makeDbSequential([]);
    const service = new AdminUsersService(db as never);

    await expect(service.getUserDetail('')).rejects.toMatchObject({
      code: ApiErrorCode.BAD_REQUEST,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('throws NOT_FOUND when user does not exist', async () => {
    const db = makeDbSequential([{ rowCount: 0, rows: [] }]);
    const service = new AdminUsersService(db as never);

    await expect(service.getUserDetail('non-existent-id')).rejects.toMatchObject({
      code: ApiErrorCode.NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('returns user detail with roles and null profiles when none exist', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [USER_ROW] },
      { rowCount: 1, rows: [ROLE_ROW] },
      { rowCount: 0, rows: [] },
      { rowCount: 0, rows: [] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.getUserDetail('user-001');

    expect(result.id).toBe('user-001');
    expect(result.roles).toEqual(['admin']);
    expect(result.studentProfile).toBeNull();
    expect(result.adminProfile).toBeNull();
    expect((result as unknown as Record<string, unknown>).supabase_auth_uid).toBeUndefined();
    expect((result as unknown as Record<string, unknown>).supabaseAuthUid).toBeUndefined();
  });

  it('returns student profile when it exists', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [USER_ROW] },
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [STUDENT_PROFILE_ROW] },
      { rowCount: 0, rows: [] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.getUserDetail('user-001');

    expect(result.studentProfile).not.toBeNull();
    expect(result.studentProfile?.displayName).toBe('Test Student');
    expect(result.studentProfile?.nativeLanguage).toBe('ar');
    expect(result.adminProfile).toBeNull();
  });

  it('never exposes supabase_auth_uid in the result', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [{ ...USER_ROW, supabase_auth_uid: 'secret-uid' }] },
      { rowCount: 0, rows: [] },
      { rowCount: 0, rows: [] },
      { rowCount: 0, rows: [] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.getUserDetail('user-001');
    const flat = JSON.stringify(result);

    expect(flat).not.toContain('secret-uid');
    expect(flat).not.toContain('supabase_auth_uid');
    expect(flat).not.toContain('supabaseAuthUid');
  });
});
