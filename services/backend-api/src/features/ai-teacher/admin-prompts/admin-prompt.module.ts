/**
 * P18-048: Create Admin AI Prompt Management API — module wiring.
 * Wires `AdminPromptController` (admin-only) onto the existing
 * `PromptTemplateService` from `AiTeacherGovernanceModule` (P18-027), the
 * same wiring pattern as `AdminRolesController`/`AdminModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiTeacherGovernanceModule } from '../governance/governance.module';
import { AdminPromptController } from './admin-prompt.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiTeacherGovernanceModule],
  controllers: [AdminPromptController],
})
export class AdminPromptModule {}
