/**
 * P18-051: Create Admin AI Safety Review API — module wiring.
 * Wires `AdminSafetyReviewController` (admin-only) onto the existing
 * `AiSafetyEventRepository`/`AiTeacherFeedbackRepository` from
 * `AiChatRepositoriesModule` (P8-026), the same wiring pattern as the
 * other admin-* modules in this feature.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../repositories';
import { AdminSafetyReviewController } from './admin-safety-review.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiChatRepositoriesModule],
  controllers: [AdminSafetyReviewController],
})
export class AdminSafetyReviewModule {}
