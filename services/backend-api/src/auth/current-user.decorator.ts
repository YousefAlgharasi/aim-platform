import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from './authenticated-user';

export function readCurrentUserFromContext(
  context: ExecutionContext,
): AuthenticatedUser | undefined {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
}

export const CurrentUser = createParamDecorator<
  keyof AuthenticatedUser | undefined,
  AuthenticatedUser | AuthenticatedUser[keyof AuthenticatedUser] | undefined
>((property, context) => {
  const user = readCurrentUserFromContext(context);

  if (!property) {
    return user;
  }

  return user?.[property];
});

export function readResolvedInternalUserId(
  context: ExecutionContext,
): string | undefined {
  const request = context.switchToHttp().getRequest<{ resolvedInternalUserId?: string }>();
  return request.resolvedInternalUserId;
}

export const ResolvedInternalUserId = createParamDecorator<
  undefined,
  string | undefined
>((_, context) => {
  return readResolvedInternalUserId(context);
});
