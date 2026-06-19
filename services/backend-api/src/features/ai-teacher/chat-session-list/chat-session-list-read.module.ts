/**
 * P8-074: Create Chat Session List API — module.
 * Wires `ChatSessionListReadController` (GET /ai-teacher/sessions) onto
 * `ChatSessionListReadService`, backed by `AiChatRepositoriesModule`
 * (P8-026) and `AuthModule` (guards).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ChatSessionListReadService } from './chat-session-list-read.service';
import { ChatSessionListReadController } from './chat-session-list-read.controller';

@Module({
  imports: [AuthModule, AiChatRepositoriesModule],
  controllers: [ChatSessionListReadController],
  providers: [ChatSessionListReadService],
  exports: [ChatSessionListReadService],
})
export class ChatSessionListReadModule {}
