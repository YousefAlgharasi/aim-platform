import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEventIngestionService } from './analytics-event-ingestion.service';
import { MetricDefinitionService } from './metric-definition.service';

@Module({
  imports: [DatabaseModule],
  providers: [AnalyticsRepository, AnalyticsEventIngestionService, MetricDefinitionService],
  exports: [AnalyticsRepository, AnalyticsEventIngestionService, MetricDefinitionService],
})
export class AnalyticsModule {}
