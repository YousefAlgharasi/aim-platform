/**
 * P8-063: Build Chat Session Start Service — module skeleton.
 * Exposes `ChatSessionStartService`, backed by `AiChatRepositoriesModule`
 * (P8-026), for callers to depend on. Not yet wired into a public API
 * endpoint — that is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ChatSessionStartService } from './chat-session-start.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [ChatSessionStartService],
  exports: [ChatSessionStartService],
})
export class ChatSessionStartModule {}
