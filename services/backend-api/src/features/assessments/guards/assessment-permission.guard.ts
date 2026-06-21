// P10-032: AssessmentPermissionGuard.
//
// Scope: Enforce role-based access on general assessment, attempt-creation,
//        and deadline endpoints (e.g. listing/starting assessments) that
//        are not scoped to a specific already-created attempt/result
//        record. Mirrors the PlacementPermissionGuard (P4-051) pattern.
//
// Usage:
//   @UseGuards(SupabaseJwtAuthGuard, AssessmentPermissionGuard)
//   @RequireRoles(AuthorizedRole.STUDENT)
//
// Security rules:
//   - student_id always resolved from JWT — never from client input.
//   - This guard performs no grading, scoring, pass/fail, or deadline-
//     status computation; it only checks role membership.
//   - No AIM Engine, AI Teacher, payments, parent dashboard, or voice AI.
//   - No secrets, service-role keys, database credentials, or AI provider keys.

import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AppError } from '../../../common/errors/app-error';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';
import { resolveAuthorizedRoles } from '../../../auth/authorization/authorized-role.resolver';
import { hasAnyRequiredRole } from '../../../auth/authorization/role-match';
import { REQUIRED_ROLES_KEY } from '../../../auth/authorization/authorization.constants';

@Injectable()
export class AssessmentPermissionGuard implements CanActivate {
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
        message: 'Authenticated user is required for assessment access.',
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
        message: 'Admin role is required to access assessment management endpoints.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    throw new AppError({
      code: ApiErrorCode.FORBIDDEN,
      message: 'Insufficient role for assessment access.',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
