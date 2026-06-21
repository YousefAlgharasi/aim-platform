import { BadRequestException, ForbiddenException } from '@nestjs/common';

const VALID_ACTOR_ROLES = ['student', 'parent', 'admin', 'system'];

const VALID_METRIC_DOMAINS = [
  'learning', 'placement', 'curriculum', 'assessment',
  'notification', 'billing', 'user', 'operations',
];

const VALID_SCOPE_TYPES = ['platform', 'cohort', 'role', 'student', 'parent'];

const VALID_PERIOD_TYPES = ['day', 'week', 'month'];

const VALID_EXPORT_TYPES = ['csv', 'json', 'pdf'];

const VALID_DASHBOARD_KEYS = ['admin_overview', 'parent_summary', 'student_summary'];

const MIN_COHORT_AGGREGATE_SIZE = 5;

export function validateUUID(value: string, fieldName: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!value || !uuidRegex.test(value)) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }
}

export function validateActorRole(role: string): void {
  if (!VALID_ACTOR_ROLES.includes(role)) {
    throw new BadRequestException(`Invalid actor role: ${role}`);
  }
}

export function validateMetricDomain(domain: string): void {
  if (!VALID_METRIC_DOMAINS.includes(domain)) {
    throw new BadRequestException(`Invalid metric domain: ${domain}`);
  }
}

export function validateScopeType(scopeType: string): void {
  if (!VALID_SCOPE_TYPES.includes(scopeType)) {
    throw new BadRequestException(`Invalid scope type: ${scopeType}`);
  }
}

export function validatePeriodType(periodType: string): void {
  if (!VALID_PERIOD_TYPES.includes(periodType)) {
    throw new BadRequestException(`Invalid period type: ${periodType}`);
  }
}

export function validatePeriodRange(periodStart: Date, periodEnd: Date): void {
  if (periodEnd <= periodStart) {
    throw new BadRequestException('Period end must be after period start');
  }
}

export function validateExportType(exportType: string): void {
  if (!VALID_EXPORT_TYPES.includes(exportType)) {
    throw new BadRequestException(`Invalid export type: ${exportType}`);
  }
}

export function validateDashboardKey(dashboardKey: string): void {
  if (!VALID_DASHBOARD_KEYS.includes(dashboardKey)) {
    throw new BadRequestException(`Invalid dashboard key: ${dashboardKey}`);
  }
}

export function validateEventType(eventType: string): void {
  if (!eventType || typeof eventType !== 'string' || eventType.trim() === '') {
    throw new BadRequestException('Event type is required');
  }
  if (eventType.length > 100) {
    throw new BadRequestException('Event type must be 100 characters or less');
  }
}

/**
 * Suppresses aggregates scoped to a cohort/group smaller than the minimum
 * size, to prevent re-identification of individuals (P15-004 privacy rule).
 */
export function assertMinimumAggregateSize(distinctMemberCount: number): void {
  if (distinctMemberCount < MIN_COHORT_AGGREGATE_SIZE) {
    throw new ForbiddenException(
      `Aggregate scope is too small to report safely (minimum ${MIN_COHORT_AGGREGATE_SIZE} members)`,
    );
  }
}

export function assertRoleAllowed(
  requestedRole: string,
  allowedRoles: string[],
): void {
  if (!allowedRoles.includes(requestedRole)) {
    throw new ForbiddenException(`Role ${requestedRole} is not permitted to access this resource`);
  }
}
