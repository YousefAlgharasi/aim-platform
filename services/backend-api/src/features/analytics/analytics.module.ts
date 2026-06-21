import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEventIngestionService } from './analytics-event-ingestion.service';
import { MetricDefinitionService } from './metric-definition.service';
import { MetricAggregationService } from './metric-aggregation.service';
import { ReportDefinitionService } from './report-definition.service';
import { ReportRunnerService } from './report-runner.service';
import { DashboardService } from './dashboard.service';
import { AnalyticsExportService } from './analytics-export.service';
import { CohortService } from './cohort.service';
import { AnalyticsAccessPolicyService } from './analytics-access-policy.service';
import { AnalyticsAuditService } from './analytics-audit.service';
import { AnalyticsAccessGuard } from './analytics-access.guard';

@Module({
  imports: [DatabaseModule, UsersModule, RolesModule],
  providers: [
    AnalyticsRepository,
    AnalyticsEventIngestionService,
    MetricDefinitionService,
    MetricAggregationService,
    ReportDefinitionService,
    ReportRunnerService,
    DashboardService,
    AnalyticsExportService,
    CohortService,
    AnalyticsAccessPolicyService,
    AnalyticsAuditService,
    AnalyticsAccessGuard,
  ],
  exports: [
    AnalyticsRepository,
    AnalyticsEventIngestionService,
    MetricDefinitionService,
    MetricAggregationService,
    ReportDefinitionService,
    ReportRunnerService,
    DashboardService,
    AnalyticsExportService,
    CohortService,
    AnalyticsAccessPolicyService,
    AnalyticsAuditService,
    AnalyticsAccessGuard,
  ],
})
export class AnalyticsModule {}
