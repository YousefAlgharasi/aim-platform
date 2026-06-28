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
import { AuthModule } from '../../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
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
import { WeaknessUpdateService } from './persistence/weakness-update.service';
import { DifficultyDecisionService } from './persistence/difficulty-decision.service';
import { RecommendationOutputService } from './persistence/recommendation-output.service';
import { ReviewScheduleOutputService } from './persistence/review-schedule-output.service';
import { FrustrationSignalService } from './persistence/frustration-signal.service';
import { SessionSummaryService } from './persistence/session-summary.service';
import { AimResultService } from './result/aim-result.service';
import { StudentSkillStateReadService } from './result/student-skill-state-read.service';
import { ReviewScheduleReadService } from './result/review-schedule-read.service';
import { SessionStateReadService } from './result/session-state-read.service';
import { WeaknessRecordsReadService } from './result/weakness-records-read.service';
import { RecommendationReadService } from './result/recommendation-read.service';
import { ErrorPatternsReadService } from './result/error-patterns-read.service';
import { AimResultController } from './result/aim-result.controller';

@Module({
  imports: [DatabaseModule, AuthModule, NotificationsModule],
  controllers: [AimResultController],
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

    // Phase 5 — weakness record persistence (P5-058)
    WeaknessUpdateService,

    // Phase 5 — difficulty decision persistence (P5-059)
    DifficultyDecisionService,

    // Phase 5 — recommendation output persistence (P5-060)
    RecommendationOutputService,

    // Phase 5 — review schedule output persistence (P5-061)
    ReviewScheduleOutputService,

    // Phase 5 — frustration signal persistence (P5-062)
    FrustrationSignalService,

    // Phase 5 — session summary persistence (P5-063)
    SessionSummaryService,

    // Phase 5 — result read APIs
    AimResultService,
    StudentSkillStateReadService,

    // Phase 5 — review schedule read service (P5-072)
    ReviewScheduleReadService,

    // Phase 5 — session state read service (P5-068)
    SessionStateReadService,

    // Phase 5 — weakness records read service (P5-070)
    WeaknessRecordsReadService,

    // Phase 5 — recommendation read service (P5-071)
    RecommendationReadService,

    // Phase 5 — error patterns read service (P5-035 table)
    ErrorPatternsReadService,
  ],
  exports: [
    // Existing exports preserved
    AimEngineClientService,
    AimService,

    // Phase 5 exports
    AimHealthCheckService,
    AimPipelineOrchestratorService,
    AimResultService,

    // Phase 8 — recommendation read service (needed by AI Teacher context builder, P8-030)
    RecommendationReadService,

    // Phase 8 — skill state read service (needed by AI Teacher context builder, P8-033)
    StudentSkillStateReadService,

    // Phase 8 — weakness records read service (needed by AI Teacher context builder, P8-034)
    WeaknessRecordsReadService,

    // Phase 8 — review schedule read service (needed by AI Teacher context builder, P8-036)
    ReviewScheduleReadService,

    // Phase 8 — error patterns read service (needed by AI Teacher context builder, P8-037)
    ErrorPatternsReadService,

    // Phase 12 — session state read service (needed by Parent Activity Summary Service, P12-029)
    SessionStateReadService,
  ],
})
export class AimModule {}
