// Phase 2 — P2-033
// Profile ownership guard.
//
// Scope: Auth, Users, Roles only.
//
// Responsibility:
//   Enforce that profile endpoints can only be accessed by the authenticated user
//   for their own profile. Prevents any client-supplied user ID from bypassing
//   the @CurrentUser() / JWT-sourced identity pattern.
//
// Enforcement model:
//   - Profile endpoints use /profile/me — no user ID appears in the URL.
//   - The JWT-sourced internal user ID is the only identity in play.
//   - This guard explicitly rejects any request that carries a body field
//     attempting to override the JWT identity (userId, internalUserId, user_id).
//   - The user's account status is verified (must be active).
//
// Why this guard exists even though /profile/me has implicit ownership:
//   - Makes the ownership contract explicit and auditable.
//   - Guards against future endpoint refactors that might introduce :userId params.
//   - Provides a testable enforcement point independent of route structure.
//   - Satisfies the P1-022 ownership guard foundation for profile endpoints.
//
// Security rules:
//   - Must always run after SupabaseJwtAuthGuard (JWT must be verified first).
//   - Backend is the final authority for identity and ownership.
//   - No secrets, service-role keys, or privileged config here.

import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError } from '../../common/errors/app-error';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../authenticated-user';
import { UsersService } from '../../features/users/users.service';
import { PROFILE_OWNERSHIP_KEY } from './authorization.constants';

// Body fields that must never override the JWT-sourced identity.
const FORBIDDEN_BODY_ID_KEYS = ['userId', 'internalUserId', 'user_id', 'id'] as const;

@Injectable()
export class ProfileOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresOwnership = this.reflector.getAllAndOverride<boolean>(
      PROFILE_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Guard is a no-op unless explicitly required by @RequireProfileOwnership().
    if (!requiresOwnership) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // SupabaseJwtAuthGuard must run before this guard.
    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required for profile ownership check.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // Resolve the internal AIM user from the Supabase Auth UID.
    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user has no internal AIM account.',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    // Account must be active. Suspended or deleted users cannot access profiles.
    if (internalUser.status !== 'active') {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Profile access requires an active account.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    // Reject any request body that attempts to supply a user ID override.
    // Profile endpoints use /profile/me — only the JWT identity is authoritative.
    const body = (request as { body?: Record<string, unknown> }).body;
    if (body && typeof body === 'object') {
      for (const key of FORBIDDEN_BODY_ID_KEYS) {
        const supplied = body[key];
        if (supplied !== undefined && supplied !== null) {
          // Allow the field only if it matches the JWT-sourced internal user ID.
          // This permits the frontend to echo back the user's own ID without penalty,
          // but rejects any attempt to access another user's profile data.
          if (String(supplied) !== internalUser.id) {
            throw new AppError({
              code: ApiErrorCode.FORBIDDEN,
              message:
                'Cross-account profile access is forbidden. ' +
                'Profile endpoints resolve identity from the verified JWT only.',
              statusCode: HttpStatus.FORBIDDEN,
            });
          }
        }
      }
    }

    // Attach the resolved internal user ID to the request for downstream use.
    // ProfileService receives this via @CurrentUser() which already carries user.id,
    // but the guard resolves the internal user independently to verify status.
    (request as { resolvedInternalUserId?: string }).resolvedInternalUserId =
      internalUser.id;

    return true;
  }
}
