import { HttpStatus } from '@nestjs/common';
import { SessionValidationService } from './session-validation.service';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { AppError } from '../common/errors/app-error';

function makeDatabaseService(rows: { id: string; status: string }[]) {
  return {
    query: jest.fn().mockResolvedValue({ rowCount: rows.length, rows }),
  };
}

describe('SessionValidationService', () => {
  describe('validate', () => {
    it('throws UNAUTHORIZED when supabaseAuthUid is empty', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionValidationService(db as never);

      await expect(service.validate('')).rejects.toMatchObject({
        code: ApiErrorCode.UNAUTHORIZED,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    });

    it('returns invalid with USER_NOT_FOUND when no user record exists', async () => {
      const db = makeDatabaseService([]);
      const service = new SessionValidationService(db as never);

      const result = await service.validate('auth-uid-000');

      expect(result).toEqual({ valid: false, reason: 'USER_NOT_FOUND' });
    });

    it('returns invalid with USER_INACTIVE when user status is not active', async () => {
      const db = makeDatabaseService([{ id: 'user-001', status: 'suspended' }]);
      const service = new SessionValidationService(db as never);

      const result = await service.validate('auth-uid-001');

      expect(result).toEqual({ valid: false, reason: 'USER_INACTIVE' });
    });

    it('returns invalid with USER_INACTIVE when user status is deleted', async () => {
      const db = makeDatabaseService([{ id: 'user-002', status: 'deleted' }]);
      const service = new SessionValidationService(db as never);

      const result = await service.validate('auth-uid-002');

      expect(result).toEqual({ valid: false, reason: 'USER_INACTIVE' });
    });

    it('returns valid session with internalUserId when user is active', async () => {
      const db = makeDatabaseService([{ id: 'user-003', status: 'active' }]);
      const service = new SessionValidationService(db as never);

      const result = await service.validate('auth-uid-003');

      expect(result).toEqual({
        valid: true,
        internalUserId: 'user-003',
        userStatus: 'active',
      });
    });

    it('queries by supabase_auth_uid with parameterised value', async () => {
      const db = makeDatabaseService([{ id: 'user-004', status: 'active' }]);
      const service = new SessionValidationService(db as never);

      await service.validate('auth-uid-004');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('supabase_auth_uid'),
        ['auth-uid-004'],
      );
    });
  });
});
