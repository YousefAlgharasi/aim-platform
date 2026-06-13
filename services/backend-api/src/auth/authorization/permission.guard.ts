import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../../features/roles';
import { UsersService } from '../../features/users';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { AppError } from '../../common/errors/app-error';
import { AuthenticatedRequest } from '../authenticated-user';
import { REQUIRED_PERMISSIONS_KEY } from './authorization.constants';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<readonly string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authenticated user is required for permission authorization',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser || internalUser.status !== 'active') {
      throw new AppError({
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Active internal user is required for permission authorization',
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const uniquePermissions = [...new Set(requiredPermissions)];
    const permissionChecks = await Promise.all(
      uniquePermissions.map((permission) =>
        this.rolesService.hasPermission(internalUser.id, permission),
      ),
    );

    if (!permissionChecks.every(Boolean)) {
      throw new AppError({
        code: ApiErrorCode.FORBIDDEN,
        message: 'Insufficient permission for this operation',
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}
