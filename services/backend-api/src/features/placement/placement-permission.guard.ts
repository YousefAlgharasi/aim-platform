// Phase 4 — P4-051
// PlacementPermissionGuard — enforces student vs admin access on placement endpoints.
//
// Scope: Placement Test system only.
//
// This guard is applied at the controller or handler level using the
// @RequireRoles() decorator from the Phase 2 authorization infrastructure.
// It extends the existing RoleGuard pattern (P2-037/P2-038) without duplicating logic.
//
// Usage on student endpoints:
//   @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
//   @RequireRoles(AuthorizedRole.STUDENT)
//
// Usage on admin endpoints:
//   @UseGuards(SupabaseJwtAuthGuard, PlacementPermissionGuard)
//   @RequireRoles(AuthorizedRole.ADMIN, AuthorizedRole.SUPER_ADMIN)
//
// Security rules:
// - student_id always resolved from JWT — never from client input.
// - Admin endpoints must never return correct_answer, overallScore, or scoring internals
//   beyond what P4-030/031/032 defines as admin-visible.
// - No AIM Engine runtime, lesson delivery, AI Teacher, or progress dashboard checks here.
// - No secrets, service-role keys, database credentials, or privileged config here.
// - Backend is the final authority for placement scoring and result generation.
// - Placement scoring, level assignment, and weakness computation are never accessible
//   to student endpoints — this guard is the first line of defence at the HTTP layer.

import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';
import { resolveAuthorizedRoles } from '../../auth/authorization/authorized-role.resolver';
import { hasAnyRequiredRole } from '../../auth/authorization/role-match';
import { REQUIRED_ROLES_KEY } from '../../auth/authorization/authorization.constants';

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

@Injectable()
export class PlacementPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<readonly AuthorizedRole[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No roles configured on this handler — pass through.
    // SupabaseJwtAuthGuard already ensures the user is authenticated.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // Should not happen after SupabaseJwtAuthGuard, but guard defensively.
    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required for placement access',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const userRoles = resolveAuthorizedRoles(user);

    if (hasAnyRequiredRole(userRoles, requiredRoles)) {
      return true;
    }

    // Distinguish between student attempting admin access vs total auth failure.
    const isStudentAttemptingAdminAccess =
      hasAnyRequiredRole(userRoles, [AuthorizedRole.STUDENT]) &&
      hasAnyRequiredRole(requiredRoles, [
        AuthorizedRole.ADMIN,
        AuthorizedRole.SUPER_ADMIN,
      ]);

    if (isStudentAttemptingAdminAccess) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Admin role is required to access placement management endpoints',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    throw new AppError({
      code: ApiErrorCode.FORBIDDEN,
      message: 'Insufficient role for placement access',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
