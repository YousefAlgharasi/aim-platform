import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../authenticated-user';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';
import { resolveAuthorizedRoles } from './authorized-role.resolver';
import { STUDENT_OWNERSHIP_REQUIREMENT_KEY } from './authorization.constants';
import { StudentOwnershipRequirement } from './ownership-policy';
import { hasAnyRequiredRole } from './role-match';

interface OwnershipRequest extends AuthenticatedRequest {
  readonly params?: Record<string, string | undefined>;
}

@Injectable()
export class StudentOwnershipGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requirement = this.reflector.getAllAndOverride<StudentOwnershipRequirement>(
      STUDENT_OWNERSHIP_REQUIREMENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<OwnershipRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required for ownership authorization',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const actualRoles = resolveAuthorizedRoles(user);

    if (hasAnyRequiredRole(actualRoles, requirement.privilegedRoles)) {
      return true;
    }

    const targetStudentId = request.params?.[requirement.paramName]?.trim();

    if (!targetStudentId) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Student ownership target is missing',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (targetStudentId === user.id) {
      return true;
    }

    throw new AppError({
      code: ApiErrorCode.FORBIDDEN,
      message: 'Cross-student data access is forbidden',
      statusCode: HttpStatus.FORBIDDEN,
    });
  }
}
