import { SetMetadata } from '@nestjs/common';
import { AuthorizedRole } from './authorized-role';
import { REQUIRED_ROLES_KEY } from './authorization.constants';

export const RequireRoles = (
  ...roles: readonly AuthorizedRole[]
): MethodDecorator & ClassDecorator => SetMetadata(REQUIRED_ROLES_KEY, [...roles]);
