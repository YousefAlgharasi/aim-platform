/**
 * P8-064: Build Student Message Submit Service — module skeleton.
 * Exposes `ChatMessageSubmitService`, backed by
 * `AiTeacherOrchestratorModule` (P8-062), for callers to depend on. Not
 * yet wired into a public API endpoint — that is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../orchestrator/ai-teacher-orchestrator.module';
import { ChatMessageSubmitService } from './chat-message-submit.service';

@Module({
  imports: [AiTeacherOrchestratorModule],
  providers: [ChatMessageSubmitService],
  exports: [ChatMessageSubmitService],
})
export class ChatMessageSubmitModule {}
