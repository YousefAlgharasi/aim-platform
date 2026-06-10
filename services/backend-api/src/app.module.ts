import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { BackendConfigModule } from './config/backend-config.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [BackendConfigModule, CommonModule, AuthModule, HealthModule],
})
export class AppModule {}
