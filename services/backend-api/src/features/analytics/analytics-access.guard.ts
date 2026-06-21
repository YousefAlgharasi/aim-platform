import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../../auth/authenticated-user';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { AnalyticsAccessPolicyService } from './analytics-access-policy.service';
import { AnalyticsActorRole } from './analytics.entities';
import { ANALYTICS_ACCESS_KEY, AnalyticsAccessRequirement } from './analytics-access.decorator';

/**
 * Protects dashboard, report, metric, export, and cohort routes. Resolves
 * the requester's internal user + role, then defers the allow/deny call to
 * AnalyticsAccessPolicyService (the backend authority for analytics access),
 * which also writes the access audit log entry.
 */
@Injectable()
export class AnalyticsAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly analyticsAccessPolicyService: AnalyticsAccessPolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<AnalyticsAccessRequirement | undefined>(
      ANALYTICS_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirement) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authenticated user is required for analytics access');
    }

    const internalUser = await this.usersService.findBySupabaseUid(user.id);

    if (!internalUser || internalUser.status !== 'active') {
      throw new UnauthorizedException('Active internal user is required for analytics access');
    }

    const roles = (await this.rolesService.getUserRoles(internalUser.id)).map((role) => role.key);
    const actorRole = this.resolveActorRole(roles);

    if (!actorRole) {
      throw new ForbiddenException('No analytics-eligible role found for this account');
    }

    const decision = await this.analyticsAccessPolicyService.evaluateAccess({
      actorUserId: internalUser.id,
      actorRole,
      category: requirement.category,
      action: requirement.action,
      targetType: requirement.category,
      targetId: null,
      scopeOwnerUserId: this.resolveScopeOwnerUserId(request),
    });

    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason ?? 'Analytics access denied');
    }

    (request as unknown as { analyticsActor?: { userId: string; role: AnalyticsActorRole } }).analyticsActor = {
      userId: internalUser.id,
      role: actorRole,
    };

    return true;
  }

  private resolveActorRole(roles: readonly string[]): AnalyticsActorRole | null {
    if (roles.includes('admin') || roles.includes('super_admin')) {
      return 'admin';
    }
    if (roles.includes('parent')) {
      return 'parent';
    }
    if (roles.includes('student')) {
      return 'student';
    }
    return null;
  }

  private resolveScopeOwnerUserId(request: AuthenticatedRequest): string | null {
    const params = (request as unknown as { params?: Record<string, string> }).params;
    return params?.userId ?? params?.studentId ?? params?.parentId ?? null;
  }
}
