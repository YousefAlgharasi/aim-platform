/**
 * P8-068: Build AI Teacher Feedback Service — module skeleton.
 * P8-075: Wires `AiTeacherFeedbackSubmitController`
 * (POST /ai-teacher/messages/:id/feedback) onto this module, backed by
 * `AiChatRepositoriesModule` (P8-026) and `AuthModule` (guards).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherFeedbackSubmitService } from './ai-teacher-feedback-submit.service';
import { AiTeacherFeedbackSubmitController } from './ai-teacher-feedback-submit.controller';

@Module({
  imports: [AuthModule, AiChatRepositoriesModule],
  controllers: [AiTeacherFeedbackSubmitController],
  providers: [AiTeacherFeedbackSubmitService],
  exports: [AiTeacherFeedbackSubmitService],
})
export class AiTeacherFeedbackModule {}
