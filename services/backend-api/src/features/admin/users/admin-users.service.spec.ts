import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AdminUsersService } from './admin-users.service';

const USER_ROW = {
  id: 'user-001',
  email: 'admin@example.com',
  phone: '+966500000000',
  user_type: 'admin',
  status: 'active',
  created_at: '2026-06-12T00:00:00Z',
  updated_at: '2026-06-12T00:00:00Z',
};

const STUDENT_ROW = {
  id: 'user-002',
  email: 'student@example.com',
  phone: null,
  user_type: 'student',
  status: 'active',
  created_at: '2026-06-10T00:00:00Z',
  updated_at: '2026-06-10T00:00:00Z',
};

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

describe('AdminUsersService.listUsers', () => {
  it('returns paginated results with defaults', async () => {
    const db = makeDbSequential([
      { rowCount: 2, rows: [USER_ROW, STUDENT_ROW] },
      { rowCount: 1, rows: [{ count: '2' }] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.listUsers();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('user-001');
    expect(result.data[1].id).toBe('user-002');
  });

  it('passes page and limit to the query', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [{ count: '0' }] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.listUsers({ page: 3, limit: 10 });

    const dataQuery = db.query.mock.calls[0][1] as unknown[];
    expect(dataQuery).toContain(10);
    expect(dataQuery).toContain(20);
  });

  it('clamps limit to MAX_LIMIT (100)', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [{ count: '0' }] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.listUsers({ limit: 500 });

    expect(result.limit).toBe(100);
  });

  it('clamps page to minimum 1', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [{ count: '0' }] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.listUsers({ page: -5 });

    expect(result.page).toBe(1);
  });

  it('filters by status', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [USER_ROW] },
      { rowCount: 1, rows: [{ count: '1' }] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.listUsers({ status: 'active' });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('status = $1');
    expect(db.query.mock.calls[0][1]).toContain('active');
  });

  it('filters by userType', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [STUDENT_ROW] },
      { rowCount: 1, rows: [{ count: '1' }] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.listUsers({ userType: 'student' });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('user_type = $1');
    expect(db.query.mock.calls[0][1]).toContain('student');
  });

  it('searches by email with ILIKE', async () => {
    const db = makeDbSequential([
      { rowCount: 1, rows: [USER_ROW] },
      { rowCount: 1, rows: [{ count: '1' }] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.listUsers({ email: 'admin' });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('ILIKE');
    expect(db.query.mock.calls[0][1]).toContain('%admin%');
  });

  it('combines multiple filters', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [{ count: '0' }] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.listUsers({ status: 'active', userType: 'student', email: 'test' });

    const sql = db.query.mock.calls[0][0] as string;
    expect(sql).toContain('status = $1');
    expect(sql).toContain('user_type = $2');
    expect(sql).toContain('ILIKE $3');
  });

  it('returns empty data when no users match', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
      { rowCount: 1, rows: [{ count: '0' }] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.listUsers({ status: 'disabled' });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('never exposes supabase_auth_uid in list results', async () => {
    const rowWithSecret = { ...USER_ROW, supabase_auth_uid: 'secret-uid' };
    const db = makeDbSequential([
      { rowCount: 1, rows: [rowWithSecret] },
      { rowCount: 1, rows: [{ count: '1' }] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.listUsers();
    const flat = JSON.stringify(result);

    expect(flat).not.toContain('secret-uid');
    expect(flat).not.toContain('supabase_auth_uid');
  });
});

describe('AdminUsersService.updateUserStatus', () => {
  it('updates status and returns safe DTO', async () => {
    const updatedRow = { ...USER_ROW, status: 'disabled' };
    const db = makeDbSequential([
      { rowCount: 1, rows: [updatedRow] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.updateUserStatus('user-001', 'disabled');

    expect(result.id).toBe('user-001');
    expect(result.status).toBe('disabled');
    expect((result as unknown as Record<string, unknown>).supabase_auth_uid).toBeUndefined();
  });

  it('throws NOT_FOUND when user does not exist', async () => {
    const db = makeDbSequential([
      { rowCount: 0, rows: [] },
    ]);
    const service = new AdminUsersService(db as never);

    await expect(service.updateUserStatus('non-existent', 'active')).rejects.toMatchObject({
      code: ApiErrorCode.NOT_FOUND,
      statusCode: HttpStatus.NOT_FOUND,
    });
  });

  it('throws BAD_REQUEST for empty userId', async () => {
    const db = makeDbSequential([]);
    const service = new AdminUsersService(db as never);

    await expect(service.updateUserStatus('', 'active')).rejects.toMatchObject({
      code: ApiErrorCode.BAD_REQUEST,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('throws BAD_REQUEST for whitespace-only userId', async () => {
    const db = makeDbSequential([]);
    const service = new AdminUsersService(db as never);

    await expect(service.updateUserStatus('   ', 'active')).rejects.toMatchObject({
      code: ApiErrorCode.BAD_REQUEST,
      statusCode: HttpStatus.BAD_REQUEST,
    });
  });

  it('passes userId from param, not from body', async () => {
    const updatedRow = { ...USER_ROW, status: 'active' };
    const db = makeDbSequential([
      { rowCount: 1, rows: [updatedRow] },
    ]);
    const service = new AdminUsersService(db as never);

    await service.updateUserStatus('user-001', 'active');

    const queryParams = db.query.mock.calls[0][1] as unknown[];
    expect(queryParams).toContain('user-001');
    expect(queryParams[1]).toBe('user-001');
  });

  it('never exposes supabase_auth_uid in update result', async () => {
    const rowWithSecret = { ...USER_ROW, supabase_auth_uid: 'secret-uid', status: 'disabled' };
    const db = makeDbSequential([
      { rowCount: 1, rows: [rowWithSecret] },
    ]);
    const service = new AdminUsersService(db as never);

    const result = await service.updateUserStatus('user-001', 'disabled');
    const flat = JSON.stringify(result);

    expect(flat).not.toContain('secret-uid');
    expect(flat).not.toContain('supabase_auth_uid');
  });
});

describe('AdminUsersController permission guards', () => {
  it('controller class has UseGuards with SupabaseJwtAuthGuard and RoleGuard', async () => {
    const controllerModule = await import('./admin-users.controller');
    const ControllerClass = controllerModule.AdminUsersController;

    const guards = Reflect.getMetadata('__guards__', ControllerClass);
    expect(guards).toBeDefined();
    expect(guards.length).toBeGreaterThanOrEqual(2);
  });

  it('controller class requires ADMIN and SUPER_ADMIN roles', async () => {
    const controllerModule = await import('./admin-users.controller');
    const ControllerClass = controllerModule.AdminUsersController;

    const roles = Reflect.getMetadata('aim:requiredRoles', ControllerClass);
    expect(roles).toBeDefined();
    expect(roles).toContain('admin');
    expect(roles).toContain('super_admin');
  });
});
