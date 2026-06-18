import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';
import { ContextBuilderModule } from './context-builder';
import { AiChatRepositoriesModule } from './repositories';

@Module({
  imports: [ConfigModule, ContextBuilderModule, AiChatRepositoriesModule],
  providers: [AiTeacherService],
  exports: [AiTeacherService, ContextBuilderModule, AiChatRepositoriesModule],
})
export class AiTeacherModule {}
