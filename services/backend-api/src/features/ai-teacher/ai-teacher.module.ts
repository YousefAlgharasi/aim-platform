import { Module } from '@nestjs/common';

import { AiTeacherService } from './ai-teacher.service';

@Module({
  providers: [AiTeacherService],
  exports: [AiTeacherService],
})
export class AiTeacherModule {}
