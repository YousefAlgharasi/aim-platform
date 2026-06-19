/**
 * P8-068: Build AI Teacher Feedback Service — module skeleton.
 * Exposes `AiTeacherFeedbackSubmitService`, backed by
 * `AiChatRepositoriesModule` (P8-026), for callers to depend on. Not yet
 * wired into a public API endpoint — that is P8-075, a separate, later
 * task (blocked on this one).
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherFeedbackSubmitService } from './ai-teacher-feedback-submit.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [AiTeacherFeedbackSubmitService],
  exports: [AiTeacherFeedbackSubmitService],
})
export class AiTeacherFeedbackModule {}
