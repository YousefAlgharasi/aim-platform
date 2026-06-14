import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { LessonsService } from './lessons.service';

@Module({
  imports: [DatabaseModule],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
