import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth';
import { DatabaseModule } from '../../../database/database.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { CurriculumAuditLogController } from './curriculum-audit-log.controller';
import { CurriculumAuditLogService } from './curriculum-audit-log.service';

@Module({
  imports: [AuthModule, DatabaseModule, RolesModule, UsersModule],
  controllers: [CurriculumAuditLogController],
  providers: [CurriculumAuditLogService],
  exports: [CurriculumAuditLogService],
})
export class CurriculumAuditLogModule {}
