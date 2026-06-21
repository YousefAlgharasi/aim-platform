import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../../auth/authenticated-user';

export const OPERATIONS_RESOURCE_KEY = 'operations_resource';
export const OPERATIONS_ADMIN_KEY = 'operations_admin';

export function OperationsResource(resource: string) {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(OPERATIONS_RESOURCE_KEY, resource, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

export function OperationsAdminOnly() {
  return (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(OPERATIONS_ADMIN_KEY, true, descriptor?.value ?? target);
    return descriptor ?? target;
  };
}

@Injectable()
export class OperationsOwnershipGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const resource = this.reflector.get<string>(
      OPERATIONS_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!resource) {
      return true;
    }

    // Ownership is validated at the service layer for ticket/feedback resources
    // The guard ensures the user is authenticated and the resource type is recognized
    const validResources = [
      'support_ticket',
      'feedback',
      'feature_request',
    ];

    if (!validResources.includes(resource)) {
      throw new ForbiddenException(`Unknown operations resource: ${resource}`);
    }

    return true;
  }
}

@Injectable()
export class OperationsAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const isAdminOnly = this.reflector.get<boolean>(
      OPERATIONS_ADMIN_KEY,
      context.getHandler(),
    );

    if (isAdminOnly) {
      const roles = (user as any).roles || [];
      const role = user.role;
      const isAdmin =
        role === 'admin' ||
        role === 'super_admin' ||
        roles.includes('admin') ||
        roles.includes('super_admin');

      if (!isAdmin) {
        throw new ForbiddenException('Admin access required for operations management');
      }
    }

    return true;
  }
}
