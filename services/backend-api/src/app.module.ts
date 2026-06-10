import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { BackendConfigModule } from './config/backend-config.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [CommonModule, BackendConfigModule, HealthModule],
})
export class AppModule {}
