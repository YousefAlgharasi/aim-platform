import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth';
import { DatabaseModule } from '../../database/database.module';
import { ParentAccessAuditService } from './parent-access-audit.service';
import { ParentAccessPolicyService } from './parent-access-policy.service';
import { ParentChildLinkService } from './parent-child-link.service';
import { ParentConsentService } from './parent-consent.service';
import { ParentRepository } from './parent.repository';
import { ParentsController } from './parents.controller';
import { ParentsService } from './parents.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ParentsController],
  providers: [
    ParentsService,
    ParentRepository,
    ParentChildLinkService,
    ParentConsentService,
    ParentAccessPolicyService,
    ParentAccessAuditService,
  ],
  exports: [
    ParentsService,
    ParentRepository,
    ParentChildLinkService,
    ParentConsentService,
    ParentAccessPolicyService,
    ParentAccessAuditService,
  ],
})
export class ParentsModule {}
