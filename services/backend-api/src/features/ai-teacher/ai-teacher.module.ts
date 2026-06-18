import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';
import { ContextBuilderModule } from './context-builder';

@Module({
  imports: [ConfigModule, ContextBuilderModule],
  providers: [AiTeacherService],
  exports: [AiTeacherService, ContextBuilderModule],
})
export class AiTeacherModule {}
