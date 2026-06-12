import { AuthLoggingService } from './auth-logging.service';

function makeDatabaseService() {
  return { query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [] }) };
}

describe('AuthLoggingService', () => {
  describe('log', () => {
    it('inserts a row with event_type and nulls for missing optional fields', async () => {
      const db = makeDatabaseService();
      const service = new AuthLoggingService(db as never);

      await service.log('login');

      expect(db.query).toHaveBeenCalledTimes(1);
      const [sql, params] = db.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO auth_audit_logs');
      expect(params[2]).toBe('login');
      expect(params[0]).toBeNull();
      expect(params[3]).toBeNull();
    });

    it('passes userId and supabaseAuthUid when provided', async () => {
      const db = makeDatabaseService();
      const service = new AuthLoggingService(db as never);

      await service.log('token_validated', {
        userId: 'user-001',
        supabaseAuthUid: 'auth-uid-001',
      });

      const [, params] = db.query.mock.calls[0];
      expect(params[0]).toBe('user-001');
      expect(params[1]).toBe('auth-uid-001');
      expect(params[2]).toBe('token_validated');
    });

    it('passes actorUserId for admin-originated events', async () => {
      const db = makeDatabaseService();
      const service = new AuthLoggingService(db as never);

      await service.log('role_assigned', {
        userId: 'user-002',
        actorUserId: 'admin-001',
      });

      const [, params] = db.query.mock.calls[0];
      expect(params[3]).toBe('admin-001');
    });

    it('serialises metadata to JSON string', async () => {
      const db = makeDatabaseService();
      const service = new AuthLoggingService(db as never);

      await service.log('access_denied', {
        metadata: { reason: 'INSUFFICIENT_ROLE', requiredRole: 'admin' },
      });

      const [, params] = db.query.mock.calls[0];
      expect(params[6]).toBe(JSON.stringify({ reason: 'INSUFFICIENT_ROLE', requiredRole: 'admin' }));
    });

    it('does not throw when the database insert fails', async () => {
      const db = { query: jest.fn().mockRejectedValue(new Error('DB unavailable')) };
      const service = new AuthLoggingService(db as never);

      await expect(service.log('logout', { userId: 'user-003' })).resolves.toBeUndefined();
    });

    it('sets ip_address and user_agent when provided', async () => {
      const db = makeDatabaseService();
      const service = new AuthLoggingService(db as never);

      await service.log('login', { ipAddress: '10.0.0.1', userAgent: 'Dart/3.0' });

      const [, params] = db.query.mock.calls[0];
      expect(params[4]).toBe('10.0.0.1');
      expect(params[5]).toBe('Dart/3.0');
    });
  });
});
