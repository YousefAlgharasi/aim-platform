export type AnalyticsActorRole = 'student' | 'parent' | 'admin' | 'system';

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  actorRole: AnalyticsActorRole;
  actorId: string | null;
  subjectType: string;
  subjectId: string | null;
  occurredAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export type MetricDomain =
  | 'learning'
  | 'placement'
  | 'curriculum'
  | 'assessment'
  | 'notification'
  | 'billing'
  | 'user'
  | 'operations';

export type MetricValueType = 'count' | 'rate' | 'sum' | 'average' | 'distinct_count';

export interface MetricDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  domain: MetricDomain;
  valueType: MetricValueType;
  aggregationMethod: string;
  sourceEventTypes: string[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MetricScopeType = 'platform' | 'cohort' | 'role' | 'student' | 'parent';

export type MetricPeriodType = 'day' | 'week' | 'month';

export interface MetricAggregate {
  id: string;
  metricDefinitionId: string;
  scopeType: MetricScopeType;
  scopeId: string | null;
  periodType: MetricPeriodType;
  periodStart: Date;
  periodEnd: Date;
  value: number;
  computedAt: Date;
}

export type ReportCategory =
  | 'learning'
  | 'curriculum'
  | 'assessment'
  | 'notification'
  | 'billing'
  | 'user'
  | 'admin'
  | 'parent'
  | 'student';

export interface ReportDefinition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: ReportCategory;
  allowedRoles: AnalyticsActorRole[];
  parametersSchema: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReportRunStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ReportRun {
  id: string;
  reportDefinitionId: string;
  requestedByUserId: string;
  requestedRole: AnalyticsActorRole;
  parameters: Record<string, unknown>;
  status: ReportRunStatus;
  resultRef: string | null;
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export type DashboardKey = 'admin_overview' | 'parent_summary' | 'student_summary';

export type DashboardWidgetType = 'kpi' | 'chart' | 'table';

export interface DashboardWidget {
  id: string;
  dashboardKey: DashboardKey;
  widgetType: DashboardWidgetType;
  metricDefinitionId: string | null;
  reportDefinitionId: string | null;
  config: Record<string, unknown>;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ExportType = 'csv' | 'json' | 'pdf';

export type ExportJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'denied';

export interface ExportJob {
  id: string;
  requestedByUserId: string;
  requestedRole: AnalyticsActorRole;
  reportRunId: string | null;
  exportType: ExportType;
  scope: Record<string, unknown>;
  status: ExportJobStatus;
  fileRef: string | null;
  denialReason: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type AnalyticsCohortType = 'static' | 'dynamic';

export interface AnalyticsCohort {
  id: string;
  key: string;
  name: string;
  description: string | null;
  cohortType: AnalyticsCohortType;
  definition: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsCohortMember {
  id: string;
  cohortId: string;
  userId: string;
  addedAt: Date;
}

export type AnalyticsAuditAction = 'view_dashboard' | 'run_report' | 'request_export' | 'access_denied';

export type AnalyticsAuditResult = 'allowed' | 'denied';

export interface AnalyticsAccessAuditLog {
  id: string;
  actorUserId: string | null;
  actorRole: AnalyticsActorRole;
  action: AnalyticsAuditAction;
  targetType: string;
  targetId: string | null;
  scope: Record<string, unknown>;
  result: AnalyticsAuditResult;
  createdAt: Date;
}
