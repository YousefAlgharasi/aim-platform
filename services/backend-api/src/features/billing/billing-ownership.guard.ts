import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { resolveAuthorizedRoles } from '../../auth/authorization/authorized-role.resolver';
import { AuthorizedRole } from '../../auth/authorization/authorized-role';

export const BILLING_RESOURCE_KEY = 'billing_resource';
export const BILLING_ADMIN_KEY = 'billing_admin';

export function BillingResource(resource: string) {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(BILLING_RESOURCE_KEY, resource, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

export function BillingAdminOnly() {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(BILLING_ADMIN_KEY, true, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

@Injectable()
export class BillingOwnershipGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const isAdminOnly = this.reflector.get<boolean>(
      BILLING_ADMIN_KEY,
      context.getHandler(),
    );

    if (isAdminOnly) {
      const roles = (user as any).roles || [];
      const isAdmin = roles.includes('admin') || roles.includes('super_admin');
      if (!isAdmin) {
        throw new ForbiddenException('Admin access required');
      }
      return true;
    }

    const params = (request as any).params ?? {};
    const resourceUserId = params.userId as string | undefined;
    if (resourceUserId && resourceUserId !== user.id) {
      throw new ForbiddenException('Not authorized to access this billing resource');
    }

    return true;
  }
}

@Injectable()
export class BillingRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const resource = this.reflector.get<string>(
      BILLING_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!resource) {
      return true;
    }

    const resolvedRoles = resolveAuthorizedRoles(user);
    const hasAccess =
      resolvedRoles.includes(AuthorizedRole.ADMIN) ||
      resolvedRoles.includes(AuthorizedRole.SUPER_ADMIN);

    if (!hasAccess) {
      throw new ForbiddenException(`Insufficient permissions for billing resource: ${resource}`);
    }

    return true;
  }
}
