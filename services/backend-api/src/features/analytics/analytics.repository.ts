import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  AnalyticsEvent,
  MetricDefinition,
  MetricAggregate,
  ReportDefinition,
  ReportRun,
  DashboardWidget,
  ExportJob,
  AnalyticsCohort,
  AnalyticsAccessAuditLog,
  AnalyticsAuditAction,
  AnalyticsAuditResult,
  AnalyticsActorRole,
} from './analytics.entities';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly db: DatabaseService) {}

  // --- Analytics Events ---

  async insertEvent(data: {
    eventType: string;
    actorRole: AnalyticsActorRole;
    actorId?: string | null;
    subjectType: string;
    subjectId?: string | null;
    occurredAt?: Date;
    metadata?: Record<string, unknown>;
  }): Promise<AnalyticsEvent> {
    const result = await this.db.query<AnalyticsEvent>(
      `INSERT INTO analytics_events (event_type, actor_role, actor_id, subject_type, subject_id, occurred_at, metadata)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, now()), $7)
       RETURNING *`,
      [
        data.eventType,
        data.actorRole,
        data.actorId ?? null,
        data.subjectType,
        data.subjectId ?? null,
        data.occurredAt ?? null,
        data.metadata ?? {},
      ],
    );
    return result.rows[0];
  }

  async findEventsByType(eventType: string, from: Date, to: Date): Promise<AnalyticsEvent[]> {
    const result = await this.db.query<AnalyticsEvent>(
      `SELECT * FROM analytics_events
       WHERE event_type = $1 AND occurred_at >= $2 AND occurred_at < $3
       ORDER BY occurred_at ASC`,
      [eventType, from, to],
    );
    return result.rows;
  }

  // --- Metric Definitions ---

  async findActiveMetricDefinitions(): Promise<MetricDefinition[]> {
    const result = await this.db.query<MetricDefinition>(
      `SELECT * FROM metric_definitions WHERE is_active = true ORDER BY domain, key`,
    );
    return result.rows;
  }

  async findMetricDefinitionByKey(key: string): Promise<MetricDefinition | null> {
    const result = await this.db.query<MetricDefinition>(
      `SELECT * FROM metric_definitions WHERE key = $1 AND is_active = true ORDER BY version DESC LIMIT 1`,
      [key],
    );
    return result.rows[0] || null;
  }

  // --- Metric Aggregates ---

  async upsertMetricAggregate(data: {
    metricDefinitionId: string;
    scopeType: string;
    scopeId: string | null;
    periodType: string;
    periodStart: Date;
    periodEnd: Date;
    value: number;
  }): Promise<MetricAggregate> {
    const result = await this.db.query<MetricAggregate>(
      `INSERT INTO metric_aggregates (metric_definition_id, scope_type, scope_id, period_type, period_start, period_end, value)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (metric_definition_id, scope_type, scope_id, period_type, period_start)
       DO UPDATE SET value = EXCLUDED.value, computed_at = now()
       RETURNING *`,
      [
        data.metricDefinitionId,
        data.scopeType,
        data.scopeId,
        data.periodType,
        data.periodStart,
        data.periodEnd,
        data.value,
      ],
    );
    return result.rows[0];
  }

  async findMetricAggregates(params: {
    metricDefinitionId: string;
    scopeType: string;
    scopeId?: string | null;
    periodType: string;
    from: Date;
    to: Date;
  }): Promise<MetricAggregate[]> {
    const result = await this.db.query<MetricAggregate>(
      `SELECT * FROM metric_aggregates
       WHERE metric_definition_id = $1 AND scope_type = $2
         AND ($3::uuid IS NULL OR scope_id = $3)
         AND period_type = $4 AND period_start >= $5 AND period_end <= $6
       ORDER BY period_start ASC`,
      [
        params.metricDefinitionId,
        params.scopeType,
        params.scopeId ?? null,
        params.periodType,
        params.from,
        params.to,
      ],
    );
    return result.rows;
  }

  // --- Report Definitions ---

  async findActiveReportDefinitions(): Promise<ReportDefinition[]> {
    const result = await this.db.query<ReportDefinition>(
      `SELECT * FROM report_definitions WHERE is_active = true ORDER BY category, key`,
    );
    return result.rows;
  }

  async findReportDefinitionByKey(key: string): Promise<ReportDefinition | null> {
    const result = await this.db.query<ReportDefinition>(
      `SELECT * FROM report_definitions WHERE key = $1 AND is_active = true`,
      [key],
    );
    return result.rows[0] || null;
  }

  // --- Report Runs ---

  async createReportRun(data: {
    reportDefinitionId: string;
    requestedByUserId: string;
    requestedRole: AnalyticsActorRole;
    parameters: Record<string, unknown>;
  }): Promise<ReportRun> {
    const result = await this.db.query<ReportRun>(
      `INSERT INTO report_runs (report_definition_id, requested_by_user_id, requested_role, parameters, status)
       VALUES ($1, $2, $3, $4, 'queued')
       RETURNING *`,
      [data.reportDefinitionId, data.requestedByUserId, data.requestedRole, data.parameters],
    );
    return result.rows[0];
  }

  async updateReportRunStatus(
    id: string,
    data: {
      status: ReportRun['status'];
      resultRef?: string | null;
      errorMessage?: string | null;
      startedAt?: Date | null;
      completedAt?: Date | null;
    },
  ): Promise<ReportRun | null> {
    const result = await this.db.query<ReportRun>(
      `UPDATE report_runs
       SET status = $2, result_ref = $3, error_message = $4, started_at = $5, completed_at = $6
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.status,
        data.resultRef ?? null,
        data.errorMessage ?? null,
        data.startedAt ?? null,
        data.completedAt ?? null,
      ],
    );
    return result.rows[0] || null;
  }

  async findReportRunById(id: string): Promise<ReportRun | null> {
    const result = await this.db.query<ReportRun>(`SELECT * FROM report_runs WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  // --- Dashboard Widgets ---

  async findDashboardWidgets(dashboardKey: string): Promise<DashboardWidget[]> {
    const result = await this.db.query<DashboardWidget>(
      `SELECT * FROM dashboard_widgets WHERE dashboard_key = $1 AND is_active = true ORDER BY display_order ASC`,
      [dashboardKey],
    );
    return result.rows;
  }

  // --- Export Jobs ---

  async createExportJob(data: {
    requestedByUserId: string;
    requestedRole: AnalyticsActorRole;
    reportRunId?: string | null;
    exportType: string;
    scope: Record<string, unknown>;
  }): Promise<ExportJob> {
    const result = await this.db.query<ExportJob>(
      `INSERT INTO export_jobs (requested_by_user_id, requested_role, report_run_id, export_type, scope, status)
       VALUES ($1, $2, $3, $4, $5, 'queued')
       RETURNING *`,
      [data.requestedByUserId, data.requestedRole, data.reportRunId ?? null, data.exportType, data.scope],
    );
    return result.rows[0];
  }

  async updateExportJobStatus(
    id: string,
    data: { status: ExportJob['status']; fileRef?: string | null; denialReason?: string | null; completedAt?: Date | null },
  ): Promise<ExportJob | null> {
    const result = await this.db.query<ExportJob>(
      `UPDATE export_jobs
       SET status = $2, file_ref = $3, denial_reason = $4, completed_at = $5
       WHERE id = $1
       RETURNING *`,
      [id, data.status, data.fileRef ?? null, data.denialReason ?? null, data.completedAt ?? null],
    );
    return result.rows[0] || null;
  }

  async findExportJobById(id: string): Promise<ExportJob | null> {
    const result = await this.db.query<ExportJob>(`SELECT * FROM export_jobs WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  // --- Cohorts ---

  async findActiveCohorts(): Promise<AnalyticsCohort[]> {
    const result = await this.db.query<AnalyticsCohort>(
      `SELECT * FROM analytics_cohorts WHERE is_active = true ORDER BY key`,
    );
    return result.rows;
  }

  async countCohortMembers(cohortId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM analytics_cohort_members WHERE cohort_id = $1`,
      [cohortId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  // --- Access Audit Logs ---

  async insertAccessAuditLog(data: {
    actorUserId: string | null;
    actorRole: AnalyticsActorRole;
    action: AnalyticsAuditAction;
    targetType: string;
    targetId?: string | null;
    scope?: Record<string, unknown>;
    result: AnalyticsAuditResult;
  }): Promise<AnalyticsAccessAuditLog> {
    const result = await this.db.query<AnalyticsAccessAuditLog>(
      `INSERT INTO analytics_access_audit_logs (actor_user_id, actor_role, action, target_type, target_id, scope, result)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.actorUserId,
        data.actorRole,
        data.action,
        data.targetType,
        data.targetId ?? null,
        data.scope ?? {},
        data.result,
      ],
    );
    return result.rows[0];
  }
}
