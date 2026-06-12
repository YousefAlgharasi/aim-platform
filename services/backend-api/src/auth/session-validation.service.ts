import { HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AppError } from '../common/errors/app-error';
import { ApiErrorCode } from '../common/errors/api-error-code';
import { SessionValidationResult } from './session-validation.types';

interface UserStatusRow {
  id: string;
  status: string;
}

@Injectable()
export class SessionValidationService {
  constructor(private readonly db: DatabaseService) {}

  async validate(supabaseAuthUid: string): Promise<SessionValidationResult> {
    if (!supabaseAuthUid || supabaseAuthUid.trim() === '') {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Supabase Auth UID is required for session validation',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const result = await this.db.query<UserStatusRow>(
      'SELECT id, status FROM users WHERE supabase_auth_uid = $1 LIMIT 1',
      [supabaseAuthUid],
    );

    if (result.rowCount === 0 || result.rows.length === 0) {
      return { valid: false, reason: 'USER_NOT_FOUND' };
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return { valid: false, reason: 'USER_INACTIVE' };
    }

    return {
      valid: true,
      internalUserId: user.id,
      userStatus: user.status,
    };
  }
}
