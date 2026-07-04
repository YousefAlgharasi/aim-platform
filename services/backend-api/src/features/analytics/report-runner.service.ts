import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { AnalyticsRepository } from './analytics.repository';
import { ReportDefinitionService } from './report-definition.service';
import {
  ReportRun,
  ReportRunResultData,
  ReportSection,
  ReportDefinition,
  AnalyticsActorRole,
  MetricAggregate,
} from './analytics.entities';
import { MetricDefinitionService } from './metric-definition.service';
import {
  StudentAimProgressReportService,
  STUDENT_AIM_PROGRESS_REPORT_KEY,
} from './student-aim-progress-report.service';

interface ReportCategoryConfig {
  metricKeys: string[];
  eventTypes: string[];
  sectionTitle: string;
}

const REPORT_CATEGORY_CONFIG: Record<string, ReportCategoryConfig> = {
  learning: {
    metricKeys: ['daily_active_students', 'lesson_completion_rate'],
    eventTypes: ['session.started', 'session.completed', 'lesson.started', 'lesson.completed'],
    sectionTitle: 'Learning Activity',
  },
  assessment: {
    metricKeys: ['assessment_completion_rate'],
    eventTypes: ['assessment.assigned', 'assessment.submitted', 'assessment.graded'],
    sectionTitle: 'Assessment Activity',
  },
  billing: {
    metricKeys: ['active_subscriptions'],
    eventTypes: ['subscription.created', 'subscription.canceled', 'payment.completed'],
    sectionTitle: 'Revenue & Subscriptions',
  },
  notification: {
    metricKeys: ['notification_delivery_rate'],
    eventTypes: ['notification.delivered', 'notification.failed'],
    sectionTitle: 'Notification Delivery',
  },
  user: {
    metricKeys: ['new_signups'],
    eventTypes: ['user.registered', 'user.deactivated'],
    sectionTitle: 'User Activity',
  },
  parent: {
    metricKeys: ['daily_active_students', 'lesson_completion_rate', 'assessment_completion_rate'],
    eventTypes: ['lesson.completed', 'assessment.submitted'],
    sectionTitle: 'Child Learning Summary',
  },
  student: {
    metricKeys: ['lesson_completion_rate', 'assessment_completion_rate'],
    eventTypes: ['lesson.completed', 'assessment.submitted', 'session.completed'],
    sectionTitle: 'My Learning Summary',
  },
  curriculum: {
    metricKeys: ['lesson_completion_rate'],
    eventTypes: ['lesson.started', 'lesson.completed'],
    sectionTitle: 'Curriculum Progress',
  },
  admin: {
    metricKeys: ['daily_active_students', 'new_signups', 'active_subscriptions'],
    eventTypes: ['user.registered', 'session.started'],
    sectionTitle: 'Platform Overview',
  },
};

@Injectable()
export class ReportRunnerService {
  private readonly logger = new Logger(ReportRunnerService.name);

  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly reportDefinitionService: ReportDefinitionService,
    private readonly metricDefinitionService: MetricDefinitionService,
    private readonly studentAimProgressReport: StudentAimProgressReportService,
  ) {}

  async runReport(params: {
    reportKey: string;
    requestedByUserId: string;
    requestedRole: AnalyticsActorRole;
    parameters: Record<string, unknown>;
  }): Promise<ReportRun> {
    const definition = await this.reportDefinitionService.getByKeyForRole(
      params.reportKey,
      params.requestedRole,
    );

    const run = await this.analyticsRepository.createReportRun({
      reportDefinitionId: definition.id,
      requestedByUserId: params.requestedByUserId,
      requestedRole: params.requestedRole,
      parameters: params.parameters,
    });

    return this.execute(run.id, definition, params.parameters, params.requestedByUserId);
  }

  async getRunStatus(id: string): Promise<ReportRun> {
    const run = await this.analyticsRepository.findReportRunById(id);

    if (!run) {
      throw new NotFoundException(`Report run not found: ${id}`);
    }

    return run;
  }

  private async execute(
    reportRunId: string,
    definition: ReportDefinition,
    parameters: Record<string, unknown>,
    requestedByUserId: string,
  ): Promise<ReportRun> {
    const startedAt = new Date();

    await this.analyticsRepository.updateReportRunStatus(reportRunId, {
      status: 'running',
      startedAt,
    });

    try {
      const resultData = await this.assembleResultData(definition, parameters, requestedByUserId);
      const resultRef = `report-run:${reportRunId}`;

      const completed = await this.analyticsRepository.updateReportRunStatus(reportRunId, {
        status: 'completed',
        resultRef,
        resultData,
        startedAt,
        completedAt: new Date(),
      });

      this.logger.log(`Report run ${reportRunId} completed for definition ${definition.key}`);
      return completed as ReportRun;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown report run failure';
      this.logger.warn(`Report run ${reportRunId} failed: ${errorMessage}`);

      const failed = await this.analyticsRepository.updateReportRunStatus(reportRunId, {
        status: 'failed',
        errorMessage,
        startedAt,
        completedAt: new Date(),
      });

      return failed as ReportRun;
    }
  }

  private async assembleResultData(
    definition: ReportDefinition,
    parameters: Record<string, unknown>,
    requestedByUserId: string,
  ): Promise<ReportRunResultData> {
    // P20-023: student_aim_progress reads real, already-persisted per-student
    // AIM output (student_skill_states/weakness_records/review_schedules) —
    // structured, per-skill records with no meaningful mapping onto the
    // generic platform-scoped metric_aggregates/analytics_events mechanism
    // below, so it bypasses that mechanism entirely rather than forcing a
    // per-skill "metric" into a system built for scalar time series.
    const sections =
      definition.key === STUDENT_AIM_PROGRESS_REPORT_KEY
        ? await this.studentAimProgressReport.buildSections(requestedByUserId)
        : await this.assembleMetricDrivenSections(definition, parameters);

    return {
      reportKey: definition.key,
      reportName: definition.name,
      category: definition.category,
      generatedAt: new Date().toISOString(),
      parameters,
      sections,
    };
  }

  private async assembleMetricDrivenSections(
    definition: ReportDefinition,
    parameters: Record<string, unknown>,
  ): Promise<ReportSection[]> {
    const { from, to } = this.resolvePeriodRange(parameters);
    const config = REPORT_CATEGORY_CONFIG[definition.category] ?? REPORT_CATEGORY_CONFIG['admin'];

    const sections: ReportSection[] = [];

    const metricsSection = await this.buildMetricsSection(config, from, to);
    if (metricsSection.data.length > 0) {
      sections.push(metricsSection);
    }

    const eventsSection = await this.buildEventsSummarySection(config, from, to);
    if (eventsSection.data.length > 0) {
      sections.push(eventsSection);
    }

    return sections;
  }

  private async buildMetricsSection(
    config: ReportCategoryConfig,
    from: Date,
    to: Date,
  ): Promise<ReportSection> {
    const data: Record<string, unknown>[] = [];

    for (const metricKey of config.metricKeys) {
      const definition = await this.metricDefinitionService.getByKey(metricKey).catch(() => null);
      if (!definition) continue;

      const aggregates = await this.analyticsRepository.findMetricAggregates({
        metricDefinitionId: definition.id,
        scopeType: 'platform',
        periodType: 'day',
        from,
        to,
      });

      const latestAggregate = await this.analyticsRepository.findLatestMetricAggregate(
        definition.id,
        'platform',
        null,
      );

      data.push({
        metricKey: definition.key,
        metricName: definition.name,
        domain: definition.domain,
        valueType: definition.valueType,
        currentValue: latestAggregate?.value ?? 0,
        periodAggregates: aggregates.map((a: MetricAggregate) => ({
          periodStart: a.periodStart,
          periodEnd: a.periodEnd,
          value: a.value,
          computedAt: a.computedAt,
        })),
        totalForPeriod: aggregates.reduce((sum: number, a: MetricAggregate) => sum + a.value, 0),
        dataPoints: aggregates.length,
      });
    }

    return {
      title: config.sectionTitle,
      type: 'metrics',
      data,
    };
  }

  private async buildEventsSummarySection(
    config: ReportCategoryConfig,
    from: Date,
    to: Date,
  ): Promise<ReportSection> {
    const data: Record<string, unknown>[] = [];

    for (const eventType of config.eventTypes) {
      const events = await this.analyticsRepository.findEventsByType(eventType, from, to);

      if (events.length === 0) continue;

      const uniqueActors = new Set(events.map((e) => e.actorId).filter(Boolean));
      const uniqueSubjects = new Set(events.map((e) => e.subjectId).filter(Boolean));

      data.push({
        eventType,
        totalCount: events.length,
        uniqueActors: uniqueActors.size,
        uniqueSubjects: uniqueSubjects.size,
        firstOccurrence: events[0].occurredAt,
        lastOccurrence: events[events.length - 1].occurredAt,
      });
    }

    return {
      title: 'Event Summary',
      type: 'events_summary',
      data,
    };
  }

  private resolvePeriodRange(parameters: Record<string, unknown>): { from: Date; to: Date } {
    const now = new Date();

    if (parameters.from && parameters.to) {
      return {
        from: new Date(parameters.from as string),
        to: new Date(parameters.to as string),
      };
    }

    const period = (parameters.period as string) ?? 'month';
    const to = now;
    const from = new Date(now);

    switch (period) {
      case 'day':
        from.setDate(from.getDate() - 1);
        break;
      case 'week':
        from.setDate(from.getDate() - 7);
        break;
      case 'year':
        from.setFullYear(from.getFullYear() - 1);
        break;
      case 'month':
      default:
        from.setMonth(from.getMonth() - 1);
        break;
    }

    return { from, to };
  }
}
