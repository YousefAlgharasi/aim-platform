/**
 * P8-066: Add AI Response Safety Filter — module skeleton.
 * Exposes `ResponseSafetyFilterService`, backed by
 * `AiChatRepositoriesModule` (P8-026) for `AiSafetyEventRepository`
 * persistence. Not yet wired into `AiTeacherOrchestratorService`'s
 * response path — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ResponseSafetyFilterService } from './response-safety-filter.service';

@Module({
  imports: [AiChatRepositoriesModule],
  providers: [ResponseSafetyFilterService],
  exports: [ResponseSafetyFilterService],
})
export class ResponseSafetyFilterModule {}
