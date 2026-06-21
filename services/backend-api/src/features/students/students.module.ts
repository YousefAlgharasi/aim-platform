// Phase 2 — P2-030 (student profile service) + P2-032 (DatabaseModule added)
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { StudentProfileService } from './student-profile.service';
import { StudentsService } from './students.service';

@Module({
  imports: [DatabaseModule],
  providers: [StudentsService, StudentProfileService],
  exports: [StudentsService, StudentProfileService],
})
export class StudentsModule {}
