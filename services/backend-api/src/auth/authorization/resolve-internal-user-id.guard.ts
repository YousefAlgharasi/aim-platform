// Resolve internal user ID guard.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Resolve the verified JWT's Supabase Auth UID (request.user.id) to the
//   internal `users.id` primary key and attach it to the request as
//   `resolvedInternalUserId`, readable via the existing
//   `@ResolvedInternalUserId()` decorator (auth/current-user.decorator.ts).
//
// Why this exists:
//   Several tables (e.g. ai_chat_sessions.student_id) have a foreign key to
//   `users.id`, the internal primary key — NOT the Supabase Auth UID found
//   in `request.user.id`. Passing the raw JWT UID into one of these tables
//   fails with a foreign key violation. This guard mirrors the resolution
//   already performed ad hoc by ProfileOwnershipGuard
//   (auth/authorization/profile-ownership.guard.ts), generalized for reuse
//   by any feature that writes to a `users.id`-keyed table.
//
// Security rules:
//   - Must always run after SupabaseJwtAuthGuard (JWT must be verified first).
//   - Backend is the final authority for identity; never trusts a
//     client-supplied user ID.
//   - No secrets, service-role keys, or privileged config here.

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { UsersService } from '../../features/users/users.service';
import { AuthenticatedRequest } from '../authenticated-user';

@Injectable()
export class ResolveInternalUserIdGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user has no internal AIM account.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    (request as { resolvedInternalUserId?: string }).resolvedInternalUserId = internalUser.id;

    return true;
  }
}
