/**
 * P18-043: Create AI Streaming Message API — module wiring.
 * Wires `AiTeacherStreamMessageController`
 * (POST /ai-teacher/sessions/:id/messages/stream) onto
 * `AiTeacherStreamMessageService`, backed by `AiTeacherOrchestratorModule`
 * (P8-062) and `AiChatRepositoriesModule` (session ownership lookup) and
 * `AuthModule` (guards) — the same wiring pattern as
 * `ChatMessageSubmitModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiTeacherOrchestratorModule } from '../orchestrator/ai-teacher-orchestrator.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherStreamMessageService } from './ai-teacher-stream-message.service';
import { AiTeacherStreamMessageController } from './ai-teacher-stream-message.controller';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    UsersModule,
    AiTeacherOrchestratorModule,
    AiChatRepositoriesModule,
  ],
  controllers: [AiTeacherStreamMessageController],
  providers: [AiTeacherStreamMessageService],
  exports: [AiTeacherStreamMessageService],
})
export class AiTeacherStreamMessageModule {}
