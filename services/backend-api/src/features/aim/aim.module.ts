/**
 * AIM Feature Module — Phase 5 skeleton (P5-043).
 *
 * Extends the existing AIM feature with the Phase 5 subdirectory structure
 * defined in docs/phase-5/backend-aim-pipeline-map.md:
 *
 *   adapter/     — AIM Engine HTTP adapter (sole backend caller of AIM Engine)
 *   pipeline/    — Pipeline orchestrator and state assembly
 *   persistence/ — AIM result persistence services and audit log
 *   result/      — Read-only AIM result APIs
 *
 * All new services are stubs. Implementation is owned by downstream tasks
 * P5-044 through P5-075.
 *
 * Scope rules:
 * - Only this module may talk to the AIM Engine.
 * - Flutter, Admin Dashboard, and all clients are prohibited from calling
 *   the AIM Engine directly.
 * - No secrets, service-role keys, or AI provider keys are stored here.
 */
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AimEngineClientService } from './aim-engine-client.service';
import { AimService } from './aim.service';

// Phase 5 additions (P5-043 skeleton)
import { AimHealthCheckService } from './aim-health-check.service';
import { AimEngineAdapterService } from './adapter/aim-engine-adapter.service';
import { AimRequestMapperService } from './adapter/aim-request-mapper.service';
import { AimAdapterErrorHandlerService } from './adapter/aim-adapter-error-handler.service';
import { AimAdapterTimeoutPolicyService } from './adapter/aim-adapter-timeout-policy.service';
import { AimResponseMapperService } from './adapter/aim-response-mapper.service';
import { AttemptSkillContextService } from './adapter/attempt-skill-context.service';
import { AimPipelineOrchestratorService } from './pipeline/aim-pipeline-orchestrator.service';
import { AimStateAssemblyService } from './pipeline/aim-state-assembly.service';
import { AimAuditService } from './persistence/aim-audit.service';
import { AimPersistenceService } from './persistence/aim-persistence.service';
import { StudentSkillStateUpdateService } from './persistence/student-skill-state-update.service';
import { DifficultyDecisionService } from './persistence/difficulty-decision.service';
import { RecommendationOutputService } from './persistence/recommendation-output.service';
import { AimResultService } from './result/aim-result.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    // Existing (pre-Phase 5)
    AimEngineClientService,
    AimService,

    // Phase 5 — health check (P5-046)
    AimHealthCheckService,

    // Phase 5 — adapter (sole AIM Engine caller)
    AimEngineAdapterService,

    // Phase 5 — request mapper (Stage 3, P5-047)
    AimRequestMapperService,

    // Phase 5 — attempt skill context resolver (P5-055)
    AttemptSkillContextService,

    // Phase 5 — response mapper (Stage 5, P5-048)
    AimResponseMapperService,

    // Phase 5 — timeout/retry policy (P5-049)
    AimAdapterTimeoutPolicyService,

    // Phase 5 — error handler / fallback profiles (P5-050)
    AimAdapterErrorHandlerService,

    // Phase 5 — pipeline
    AimPipelineOrchestratorService,
    AimStateAssemblyService,

    // Phase 5 — persistence and audit
    AimPersistenceService,
    AimAuditService,

    // Phase 5 — skill state persistence (P5-057)
    StudentSkillStateUpdateService,

    // Phase 5 — difficulty decision persistence (P5-059)
    DifficultyDecisionService,

    // Phase 5 — recommendation output persistence (P5-060)
    RecommendationOutputService,

    // Phase 5 — result read APIs
    AimResultService,
  ],
  exports: [
    // Existing exports preserved
    AimEngineClientService,
    AimService,

    // Phase 5 exports
    AimHealthCheckService,
    AimResultService,
  ],
})
export class AimModule {}
