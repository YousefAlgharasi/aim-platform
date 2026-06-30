/**
 * P8-076: Add AI Teacher API Guards — module.
 * Exports `AiTeacherSessionOwnershipGuard` for use by AI Teacher
 * API controller modules.
 */
import { Module } from '@nestjs/common';

import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherSessionOwnershipGuard } from './ai-teacher-session-ownership.guard';

@Module({
  imports: [AiChatRepositoriesModule, UsersModule],
  providers: [AiTeacherSessionOwnershipGuard],
  exports: [AiTeacherSessionOwnershipGuard],
})
export class AiTeacherGuardsModule {}
