import { Module } from '@nestjs/common';

import { BackendConfigModule } from '../config/backend-config.module';
import { DatabaseService } from './database.service';
import { JobLockService } from './job-lock.service';

@Module({
  imports: [BackendConfigModule],
  providers: [DatabaseService, JobLockService],
  exports: [DatabaseService, JobLockService],
})
export class DatabaseModule {}
