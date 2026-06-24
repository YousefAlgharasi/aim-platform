import { Module } from '@nestjs/common';
import { BackendConfigModule } from '../config/backend-config.module';
import { DatabaseModule } from '../database/database.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [BackendConfigModule, DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
