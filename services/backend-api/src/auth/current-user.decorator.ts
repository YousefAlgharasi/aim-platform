import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user';

export const CurrentUser = createParamDecorator<
  keyof AuthenticatedUser | undefined,
  AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined
>((property, context) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  const user = request.user;

  if (!property) {
    return user;
  }

  return user?.[property];
});
