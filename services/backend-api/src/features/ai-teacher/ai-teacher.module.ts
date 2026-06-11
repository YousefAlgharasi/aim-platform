import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';

@Module({
  imports: [ConfigModule],
  providers: [AiTeacherService],
  exports: [AiTeacherService],
})
export class AiTeacherModule {}
