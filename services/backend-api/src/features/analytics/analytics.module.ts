import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
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

@Module({
  imports: [DatabaseModule],
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
  ],
})
export class AnalyticsModule {}
