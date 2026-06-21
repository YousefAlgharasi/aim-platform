/**
 * P18-050: Create Admin AI Usage and Cost API — module wiring.
 * Wires `AdminUsageCostController` (admin-only) onto the existing
 * `AiCostQuotaService` from `AiTeacherGovernanceModule` (P18-030), the
 * same wiring pattern as `AdminPromptModule`/`AdminModelConfigModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiTeacherGovernanceModule } from '../governance/governance.module';
import { AdminUsageCostController } from './admin-usage-cost.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiTeacherGovernanceModule],
  controllers: [AdminUsageCostController],
})
export class AdminUsageCostModule {}
