import { SetMetadata } from '@nestjs/common';
import { REQUIRED_PERMISSIONS_KEY } from './authorization.constants';

export const RequirePermissions = (
  ...permissions: readonly string[]
): MethodDecorator & ClassDecorator => SetMetadata(REQUIRED_PERMISSIONS_KEY, [...permissions]);
