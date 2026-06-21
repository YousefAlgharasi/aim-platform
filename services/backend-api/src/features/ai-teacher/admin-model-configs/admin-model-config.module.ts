/**
 * P18-049: Create Admin AI Model Config API — module wiring.
 * Wires `AdminModelConfigController` (admin-only) onto the existing
 * `ModelConfigService` from `AiTeacherGovernanceModule` (P18-028), the
 * same wiring pattern as `AdminPromptModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiTeacherGovernanceModule } from '../governance/governance.module';
import { AdminModelConfigController } from './admin-model-config.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiTeacherGovernanceModule],
  controllers: [AdminModelConfigController],
})
export class AdminModelConfigModule {}
