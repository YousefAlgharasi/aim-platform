import { Module } from '@nestjs/common';
import { BackendConfigModule } from './config/backend-config.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [BackendConfigModule, HealthModule],
})
export class AppModule {}
