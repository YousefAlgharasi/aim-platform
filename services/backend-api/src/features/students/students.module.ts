import { Module } from '@nestjs/common';

import { StudentsService } from './students.service';

@Module({
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
