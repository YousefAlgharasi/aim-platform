import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../auth/authenticated-user';

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

    return true;
  }
}
