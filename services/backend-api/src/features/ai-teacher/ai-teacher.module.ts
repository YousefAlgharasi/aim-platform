import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';
import { ContextBuilderModule } from './context-builder';
import { AiChatRepositoriesModule } from './repositories';
import { ChatMessageSubmitModule } from './chat-message/chat-message-submit.module';

@Module({
  imports: [ConfigModule, ContextBuilderModule, AiChatRepositoriesModule, ChatMessageSubmitModule],
  providers: [AiTeacherService],
  exports: [AiTeacherService, ContextBuilderModule, AiChatRepositoriesModule],
})
export class AiTeacherModule {}
