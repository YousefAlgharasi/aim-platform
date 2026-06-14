import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { ReportsService } from './reports.service';

@Module({
  imports: [DatabaseModule],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
