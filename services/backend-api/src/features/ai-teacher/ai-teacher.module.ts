import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';
import { ContextBuilderModule } from './context-builder';
import { AiChatRepositoriesModule } from './repositories';
import { ChatSessionStartModule } from './chat-session/chat-session-start.module';

@Module({
  imports: [
    ConfigModule,
    ContextBuilderModule,
    AiChatRepositoriesModule,
    ChatSessionStartModule,
  ],
  providers: [AiTeacherService],
  exports: [AiTeacherService, ContextBuilderModule, AiChatRepositoriesModule],
})
export class AiTeacherModule {}
