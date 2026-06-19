/**
 * P8-073: Create Chat History API — module.
 * Wires `ChatHistoryReadController` (GET /ai-teacher/sessions/:id/messages)
 * onto `ChatHistoryReadService`, backed by `AiChatRepositoriesModule`
 * (P8-026) and `AuthModule` (guards).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ChatHistoryReadService } from './chat-history-read.service';
import { ChatHistoryReadController } from './chat-history-read.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiChatRepositoriesModule],
  controllers: [ChatHistoryReadController],
  providers: [ChatHistoryReadService],
  exports: [ChatHistoryReadService],
})
export class ChatHistoryReadModule {}
