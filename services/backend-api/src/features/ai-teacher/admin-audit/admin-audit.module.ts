/**
 * P18-078: Create Admin AI Audit UI (backend support) — module wiring.
 * Wires `AdminAuditController` (admin-only) onto the existing
 * `AiTeacherAuditLogRepository` from `AiTeacherGovernanceModule` (P18-039),
 * the same wiring pattern as `AdminSafetyReviewModule`.
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiTeacherGovernanceModule } from '../governance/governance.module';
import { AdminAuditController } from './admin-audit.controller';

@Module({
  imports: [AuthModule, RolesModule, UsersModule, AiTeacherGovernanceModule],
  controllers: [AdminAuditController],
})
export class AdminAuditModule {}
