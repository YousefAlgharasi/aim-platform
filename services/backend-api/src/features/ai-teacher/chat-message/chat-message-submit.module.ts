/**
 * P8-064: Build Student Message Submit Service — module skeleton.
 * P8-072: Wires `ChatMessageSubmitController`
 * (POST /ai-teacher/sessions/:id/messages) onto this module, backed by
 * `AiTeacherOrchestratorModule` (P8-062) and `AiChatRepositoriesModule`
 * (P8-026, session ownership lookup) and `AuthModule` (guards).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { AiTeacherOrchestratorModule } from '../orchestrator/ai-teacher-orchestrator.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ChatMessageSubmitService } from './chat-message-submit.service';
import { ChatMessageSubmitController } from './chat-message-submit.controller';

@Module({
  imports: [AuthModule, AiTeacherOrchestratorModule, AiChatRepositoriesModule],
  controllers: [ChatMessageSubmitController],
  providers: [ChatMessageSubmitService],
  exports: [ChatMessageSubmitService],
})
export class ChatMessageSubmitModule {}
