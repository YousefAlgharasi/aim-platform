// P18-022: AI Teacher governance module
// Groups the prompt template, model config, safety, and cost/quota
// governance pieces (P18-023..P18-030) that sit alongside the existing
// legacy chat pipeline modules in ai-teacher.module.ts.

import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { AiModelConfigRepository } from './ai-model-config.repository';
import { AiPromptTemplateRepository } from './ai-prompt-template.repository';
import { AiTeacherAuditLogRepository } from './ai-teacher-audit-log.repository';
import { AiTeacherSafetyCheckRepository } from './ai-teacher-safety-check.repository';
import { AiTeacherSafetyService } from './ai-teacher-safety.service';
import { AiTeacherProviderGateway } from './ai-teacher-provider.interface';
import { AiTeacherProviderUnavailableStub } from './ai-teacher-provider-unavailable.stub';
import { AiUsageCostEventRepository } from './ai-usage-cost-event.repository';
import { AiCostQuotaService } from './ai-cost-quota.service';
import { ModelConfigService } from './model-config.service';
import { PromptTemplateService } from './prompt-template.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    AiPromptTemplateRepository,
    AiModelConfigRepository,
    AiTeacherSafetyCheckRepository,
    AiUsageCostEventRepository,
    AiTeacherAuditLogRepository,
    PromptTemplateService,
    ModelConfigService,
    AiTeacherSafetyService,
    AiCostQuotaService,
    { provide: AiTeacherProviderGateway, useClass: AiTeacherProviderUnavailableStub },
  ],
  exports: [
    AiPromptTemplateRepository,
    AiModelConfigRepository,
    AiTeacherSafetyCheckRepository,
    AiUsageCostEventRepository,
    AiTeacherAuditLogRepository,
    PromptTemplateService,
    ModelConfigService,
    AiTeacherSafetyService,
    AiCostQuotaService,
  ],
})
export class AiTeacherGovernanceModule {}
