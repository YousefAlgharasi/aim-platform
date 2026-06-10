import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { BackendConfigModule } from './config/backend-config.module';
import { FeaturesModule } from './features/features.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [BackendConfigModule, CommonModule, HealthModule, FeaturesModule],
})
export class AppModule {}
