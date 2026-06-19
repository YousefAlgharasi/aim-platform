/**
 * P8-068: Build AI Teacher Feedback Service — module skeleton.
 * P8-076: Adds `AiTeacherFeedbackSubmitController` exposing the service
 * behind POST /ai-teacher/messages/:messageId/feedback with JWT auth,
 * role guard, and DTO validation.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherFeedbackSubmitService } from './ai-teacher-feedback-submit.service';
import { AiTeacherFeedbackSubmitController } from './ai-teacher-feedback-submit.controller';

@Module({
  imports: [AiChatRepositoriesModule],
  controllers: [AiTeacherFeedbackSubmitController],
  providers: [AiTeacherFeedbackSubmitService],
  exports: [AiTeacherFeedbackSubmitService],
})
export class AiTeacherFeedbackModule {}
