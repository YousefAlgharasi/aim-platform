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
): string {
  const request = context.switchToHttp().getRequest<{ resolvedInternalUserId?: string; user?: AuthenticatedUser }>();
  return request.resolvedInternalUserId || request.user?.id || '';
}

export const ResolvedInternalUserId = createParamDecorator<
  undefined,
  string | undefined
>((_, context) => {
  return readResolvedInternalUserId(context);
});
