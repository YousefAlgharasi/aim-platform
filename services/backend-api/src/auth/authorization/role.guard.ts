import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../authenticated-user';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';
import { RolesService } from '../../features/roles/roles.service';
import { UsersService } from '../../features/users/users.service';
import { AuthorizedRole } from './authorized-role';
import { isAuthorizedRole } from './authorized-role';
import { REQUIRED_ROLES_KEY } from './authorization.constants';
import { hasAnyRequiredRole } from './role-match';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<readonly AuthorizedRole[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required for role authorization',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser || internalUser.status !== 'active') {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Active internal user is required for role authorization',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const actualRoles = (await this.rolesService.getUserRoles(internalUser.id))
      .map((role) => role.key)
      .filter(isAuthorizedRole);

    if (!hasAnyRequiredRole(actualRoles, requiredRoles)) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Insufficient role for this operation',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}
