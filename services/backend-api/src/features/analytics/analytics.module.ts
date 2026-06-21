import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEventIngestionService } from './analytics-event-ingestion.service';
import { MetricDefinitionService } from './metric-definition.service';
import { MetricAggregationService } from './metric-aggregation.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    AnalyticsRepository,
    AnalyticsEventIngestionService,
    MetricDefinitionService,
    MetricAggregationService,
  ],
  exports: [
    AnalyticsRepository,
    AnalyticsEventIngestionService,
    MetricDefinitionService,
    MetricAggregationService,
  ],
})
export class AnalyticsModule {}
