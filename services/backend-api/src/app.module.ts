import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BackendConfigModule } from './config/backend-config.module';
import { CommonModule } from './common/common.module';
import { ThrottleModule } from './common/throttle/throttle.module';
import { DatabaseModule } from './database/database.module';
import { FeaturesModule } from './features/features.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BackendConfigModule,
    CommonModule,
    ThrottleModule,
    DatabaseModule,
    HealthModule,
    FeaturesModule,
  ],
})
export class AppModule {}
