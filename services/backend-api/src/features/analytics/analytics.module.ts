import { Module, forwardRef } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../../auth/auth.module';
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
import { AdminAnalyticsDashboardController } from './admin-analytics-dashboard.controller';
import { AdminLearningReportsController } from './admin-learning-reports.controller';
import { AdminAssessmentReportsController } from './admin-assessment-reports.controller';
import { AdminRevenueReportsController } from './admin-revenue-reports.controller';
import { AdminCurriculumReportsController } from './admin-curriculum-reports.controller';
import { AdminUserReportsController } from './admin-user-reports.controller';
import { ParentReportsController } from './parent-reports.controller';
import { StudentAnalyticsSummaryController } from './student-analytics-summary.controller';
import { AnalyticsExportController } from './analytics-export.controller';

@Module({
  imports: [DatabaseModule, UsersModule, RolesModule, forwardRef(() => AuthModule)],
  controllers: [
    AdminAnalyticsDashboardController,
    AdminLearningReportsController,
    AdminAssessmentReportsController,
    AdminRevenueReportsController,
    AdminCurriculumReportsController,
    AdminUserReportsController,
    ParentReportsController,
    StudentAnalyticsSummaryController,
    AnalyticsExportController,
  ],
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
