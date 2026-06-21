import { SetMetadata } from '@nestjs/common';
import { AnalyticsAuditAction, ReportCategory } from './analytics.entities';

export const ANALYTICS_ACCESS_KEY = 'aim:analyticsAccess';

export interface AnalyticsAccessRequirement {
  category: ReportCategory;
  action: AnalyticsAuditAction;
}

/**
 * Marks a controller route as analytics-protected. AnalyticsAccessGuard
 * resolves the requirement set here and delegates the allow/deny decision
 * to AnalyticsAccessPolicyService — nothing here decides access itself.
 */
export const RequireAnalyticsAccess = (
  requirement: AnalyticsAccessRequirement,
): MethodDecorator & ClassDecorator => SetMetadata(ANALYTICS_ACCESS_KEY, requirement);
