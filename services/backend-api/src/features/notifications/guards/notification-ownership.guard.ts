import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AppError } from '../../../common/errors/app-error';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { AuthenticatedRequest } from '../../../auth/authenticated-user';

@Injectable()
export class NotificationOwnershipGuard implements CanActivate {
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

    return true;
  }
}
