import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiTeacherService } from './ai-teacher.service';
import { ContextBuilderModule } from './context-builder';
import { AiChatRepositoriesModule } from './repositories';
import { ChatSessionStartModule } from './chat-session/chat-session-start.module';
import { ChatMessageSubmitModule } from './chat-message/chat-message-submit.module';
import { ChatHistoryReadModule } from './chat-history/chat-history-read.module';
import { ChatSessionListReadModule } from './chat-session-list/chat-session-list-read.module';
import { AiTeacherFeedbackModule } from './feedback/ai-teacher-feedback.module';
import { AiTeacherGovernanceModule } from './governance/governance.module';
import { AiTeacherStreamMessageModule } from './streaming-api/ai-teacher-stream-message.module';
import { AiTeacherSafetyStatusModule } from './safety-status/ai-teacher-safety-status.module';
import { AdminPromptModule } from './admin-prompts/admin-prompt.module';
import { AdminModelConfigModule } from './admin-model-configs/admin-model-config.module';

@Module({
  imports: [
    ConfigModule,
    ContextBuilderModule,
    AiChatRepositoriesModule,
    ChatSessionStartModule,
    ChatMessageSubmitModule,
    ChatHistoryReadModule,
    ChatSessionListReadModule,
    AiTeacherFeedbackModule,
    AiTeacherGovernanceModule,
    AiTeacherStreamMessageModule,
    AiTeacherSafetyStatusModule,
    AdminPromptModule,
    AdminModelConfigModule,
  ],
  providers: [AiTeacherService],
  exports: [AiTeacherService, ContextBuilderModule, AiChatRepositoriesModule, AiTeacherGovernanceModule],
})
export class AiTeacherModule {}
