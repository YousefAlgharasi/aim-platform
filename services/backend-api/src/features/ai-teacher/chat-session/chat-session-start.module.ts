/**
 * P8-063: Build Chat Session Start Service — module skeleton.
 * P8-071: Wires `ChatSessionStartController` (POST /ai-teacher/sessions)
 * onto this module, backed by `AiChatRepositoriesModule` (P8-026).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ChatSessionStartService } from './chat-session-start.service';
import { ChatSessionStartController } from './chat-session-start.controller';

@Module({
  imports: [AuthModule, AiChatRepositoriesModule],
  controllers: [ChatSessionStartController],
  providers: [ChatSessionStartService],
  exports: [ChatSessionStartService],
})
export class ChatSessionStartModule {}
