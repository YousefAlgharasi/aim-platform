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

import { AimEngineClientService } from './aim-engine-client.service';
import { AimService } from './aim.service';

// Phase 5 additions (P5-043 skeleton)
import { AimHealthCheckService } from './aim-health-check.service';
import { AimEngineAdapterService } from './adapter/aim-engine-adapter.service';
import { AimPipelineOrchestratorService } from './pipeline/aim-pipeline-orchestrator.service';
import { AimStateAssemblyService } from './pipeline/aim-state-assembly.service';
import { AimAuditService } from './persistence/aim-audit.service';
import { AimPersistenceService } from './persistence/aim-persistence.service';
import { AimResultService } from './result/aim-result.service';

@Module({
  providers: [
    // Existing (pre-Phase 5)
    AimEngineClientService,
    AimService,

    // Phase 5 — health check (P5-046)
    AimHealthCheckService,

    // Phase 5 — adapter (sole AIM Engine caller)
    AimEngineAdapterService,

    // Phase 5 — pipeline
    AimPipelineOrchestratorService,
    AimStateAssemblyService,

    // Phase 5 — persistence and audit
    AimPersistenceService,
    AimAuditService,

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
