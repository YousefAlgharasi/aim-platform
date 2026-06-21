import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsEventIngestionService } from './analytics-event-ingestion.service';

@Module({
  imports: [DatabaseModule],
  providers: [AnalyticsRepository, AnalyticsEventIngestionService],
  exports: [AnalyticsRepository, AnalyticsEventIngestionService],
})
export class AnalyticsModule {}
