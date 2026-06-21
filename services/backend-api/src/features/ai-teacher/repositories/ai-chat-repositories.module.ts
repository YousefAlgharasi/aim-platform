// P8-026: Add Backend AI Chat Repositories

import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { AiChatMessageRepository } from './ai-chat-message.repository';
import { AiChatSessionRepository } from './ai-chat-session.repository';
import { AiContextSnapshotRepository } from './ai-context-snapshot.repository';
import { AiProviderLogRepository } from './ai-provider-log.repository';
import { AiSafetyEventRepository } from './ai-safety-event.repository';
import { AiTeacherFeedbackRepository } from './ai-teacher-feedback.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    AiChatSessionRepository,
    AiChatMessageRepository,
    AiContextSnapshotRepository,
    AiProviderLogRepository,
    AiSafetyEventRepository,
    AiTeacherFeedbackRepository,
  ],
  exports: [
    AiChatSessionRepository,
    AiChatMessageRepository,
    AiContextSnapshotRepository,
    AiProviderLogRepository,
    AiSafetyEventRepository,
    AiTeacherFeedbackRepository,
  ],
})
export class AiChatRepositoriesModule {}
