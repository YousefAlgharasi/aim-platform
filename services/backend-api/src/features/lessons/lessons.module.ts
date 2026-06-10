import { Module } from '@nestjs/common';

import { LessonsService } from './lessons.service';

@Module({
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
