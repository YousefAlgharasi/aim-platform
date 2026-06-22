import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';
import { resolveAuthorizedRoles } from '../../../auth/authorization/authorized-role.resolver';
import { AuthorizedRole } from '../../../auth/authorization/authorized-role';

@Injectable()
export class NotificationAdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user?.id) {
      throw new AppError({
        message: 'Authentication required',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ApiErrorCode.UNAUTHORIZED,
      });
    }

    const roles = resolveAuthorizedRoles(user);
    const isAdmin = roles.includes(AuthorizedRole.ADMIN) || roles.includes(AuthorizedRole.SUPER_ADMIN);

    if (!isAdmin) {
      throw new AppError({
        message: 'Admin access required',
        statusCode: HttpStatus.FORBIDDEN,
        code: ApiErrorCode.FORBIDDEN,
      });
    }

    return true;
  }
}
