import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsActorRole, AnalyticsAuditAction, ReportCategory } from './analytics.entities';

/**
 * Backend authority for evaluating analytics access decisions
 * (docs/phase-15/reporting-access-map.md). Every report/dashboard/export
 * read is checked here before any data leaves the backend; nothing in this
 * map is enforceable client-side.
 */
const CATEGORY_ALLOWED_ROLES: Record<ReportCategory, AnalyticsActorRole[]> = {
  learning: ['admin', 'parent', 'student'],
  curriculum: ['admin'],
  assessment: ['admin', 'parent', 'student'],
  notification: ['admin'],
  billing: ['admin', 'parent'],
  user: ['admin'],
  admin: ['admin'],
  parent: ['parent'],
  student: ['student'],
};

export interface AccessCheckParams {
  actorUserId: string | null;
  actorRole: AnalyticsActorRole;
  category: ReportCategory;
  action: AnalyticsAuditAction;
  targetType: string;
  targetId?: string | null;
  /** The user id that owns the scope being requested (e.g. own account, own child). */
  scopeOwnerUserId?: string | null;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
}

@Injectable()
export class AnalyticsAccessPolicyService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async evaluateAccess(params: AccessCheckParams): Promise<AccessDecision> {
    const decision = this.decide(params);

    await this.analyticsRepository.insertAccessAuditLog({
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      scope: { category: params.category },
      result: decision.allowed ? 'allowed' : 'denied',
    });

    return decision;
  }

  private decide(params: AccessCheckParams): AccessDecision {
    const allowedRoles = CATEGORY_ALLOWED_ROLES[params.category] ?? [];

    if (!allowedRoles.includes(params.actorRole)) {
      return { allowed: false, reason: `Role ${params.actorRole} cannot access ${params.category} reports` };
    }

    if (params.actorRole === 'admin' || params.actorRole === 'system') {
      return { allowed: true };
    }

    if (params.scopeOwnerUserId && params.scopeOwnerUserId !== params.actorUserId) {
      return { allowed: false, reason: 'Scope is outside the requester\'s own data' };
    }

    return { allowed: true };
  }
}
