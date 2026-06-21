import { Injectable } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import {
  AnalyticsAccessAuditLog,
  AnalyticsActorRole,
  AnalyticsAuditAction,
  AnalyticsAuditResult,
} from './analytics.entities';

const UNSAFE_SCOPE_KEY_PATTERN = /password|secret|token|api[_-]?key|credential|card[_-]?number/i;

/**
 * Backend authority for recording and reading analytics access traceability
 * (docs/phase-15/analytics-domain-map.md). Only safe scope metadata is ever
 * persisted; this is the single place dashboard/report/export access is
 * logged for audit purposes.
 */
@Injectable()
export class AnalyticsAuditService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async recordAccess(params: {
    actorUserId: string | null;
    actorRole: AnalyticsActorRole;
    action: AnalyticsAuditAction;
    targetType: string;
    targetId?: string | null;
    scope?: Record<string, unknown>;
    result: AnalyticsAuditResult;
  }): Promise<AnalyticsAccessAuditLog> {
    return this.analyticsRepository.insertAccessAuditLog({
      ...params,
      scope: this.stripUnsafeScope(params.scope ?? {}),
    });
  }

  async listForActor(actorUserId: string, limit = 100): Promise<AnalyticsAccessAuditLog[]> {
    return this.analyticsRepository.findAccessAuditLogs({ actorUserId, limit });
  }

  async listForTargetType(targetType: string, limit = 100): Promise<AnalyticsAccessAuditLog[]> {
    return this.analyticsRepository.findAccessAuditLogs({ targetType, limit });
  }

  private stripUnsafeScope(scope: Record<string, unknown>): Record<string, unknown> {
    const safe: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(scope)) {
      if (!UNSAFE_SCOPE_KEY_PATTERN.test(key)) {
        safe[key] = value;
      }
    }

    return safe;
  }
}
