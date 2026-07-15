// P18-022: AI Teacher governance module
// Groups the prompt template, model config, safety, and cost/quota
// governance pieces (P18-023..P18-030) that sit alongside the existing
// legacy chat pipeline modules in ai-teacher.module.ts.

import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../../database/database.module';
import { ProviderGatewayConfigService } from '../provider-gateway/provider-gateway.config';
import { AiModelConfigRepository } from './ai-model-config.repository';
import { AiPromptTemplateRepository } from './ai-prompt-template.repository';
import { AiTeacherAuditLogRepository } from './ai-teacher-audit-log.repository';
import { AiTeacherAuditService } from './ai-teacher-audit.service';
import { AiTeacherSafetyCheckRepository } from './ai-teacher-safety-check.repository';
import { AiTeacherSafetyService } from './ai-teacher-safety.service';
import { AiTeacherStreamingService } from './ai-teacher-streaming.service';
import { AiTeacherProviderGateway } from './ai-teacher-provider.interface';
import { AiTeacherProviderOpenAiService } from './ai-teacher-provider-openai.service';
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
    AiTeacherAuditService,
    AiTeacherStreamingService,
    ProviderGatewayConfigService,
    { provide: AiTeacherProviderGateway, useClass: AiTeacherProviderOpenAiService },
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
    AiTeacherAuditService,
    AiTeacherStreamingService,
    // Exported so other features (e.g. placement writing/speaking AI
    // grading, P4-052) can reuse the same OpenAI-compatible provider
    // instead of standing up a second provider seam.
    AiTeacherProviderGateway,
  ],
})
export class AiTeacherGovernanceModule {}
