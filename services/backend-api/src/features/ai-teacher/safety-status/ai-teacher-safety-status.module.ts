/**
 * P18-047: Create AI Safety Status API — module wiring.
 * Wires `AiTeacherSafetyStatusController`
 * (GET /ai-teacher/sessions/:id/safety-status) onto
 * `AiTeacherSafetyStatusService`, backed by `AiChatRepositoriesModule`
 * (P8-026, session ownership + safety event lookup) and `AuthModule`
 * (guards) — the same wiring pattern as `ChatHistoryReadModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherSafetyStatusService } from './ai-teacher-safety-status.service';
import { AiTeacherSafetyStatusController } from './ai-teacher-safety-status.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiChatRepositoriesModule],
  controllers: [AiTeacherSafetyStatusController],
  providers: [AiTeacherSafetyStatusService],
  exports: [AiTeacherSafetyStatusService],
})
export class AiTeacherSafetyStatusModule {}
