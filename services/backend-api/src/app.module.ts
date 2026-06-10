import { Module } from '@nestjs/common';

import { BackendConfigModule } from './config/backend-config.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { FeaturesModule } from './features/features.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    BackendConfigModule,
    CommonModule,
    DatabaseModule,
    HealthModule,
    FeaturesModule,
  ],
})
export class AppModule {}
