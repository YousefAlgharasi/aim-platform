// Phase 2 — P2-030 (scaffold) + P2-032 (DatabaseModule added)
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { StudentsService } from './students.service';

@Module({
  imports: [DatabaseModule],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
