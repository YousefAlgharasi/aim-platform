/**
 * P9-048: Create Voice Orchestrator Skeleton (Group F — Voice Orchestration
 * With Phase 8 AI Teacher). Wires the STT Gateway pipeline (Group E,
 * P9-038..P9-046) and the Phase 8 AI Teacher Orchestrator (P8-062) together
 * behind `VoiceOrchestratorService`.
 *
 * TTS Gateway (Group G, P9-058+) will be added to `imports` when those tasks
 * complete; until then, the orchestrator returns `audioRef: null` and marks
 * `isFallback: true` so callers can handle the no-audio case gracefully.
 *
 * This module is not yet wired into the top-level `VoiceTeacherModule` since
 * no controller/API route exists to invoke it — that integration is a
 * separate, later task (P9-049+, P9-058+).
 *
 * Dependency: P9-046 (STT Gateway pipeline), P8-062 (AI Teacher Orchestrator).
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.module';
import { SttSafeFailureService } from '../stt-gateway/stt-safe-failure.service';
import { VoiceOrchestratorService } from './voice-orchestrator.service';

@Module({
  imports: [
    /**
     * P8-062: AI Teacher Orchestrator — provides `AiTeacherOrchestratorService`
     * which drives context assembly (AIM Engine / curriculum), prompt building,
     * AI provider call, response safety filtering, and message persistence.
     * All learning-decision authority remains here, never in the Voice layer.
     */
    AiTeacherOrchestratorModule,
  ],
  providers: [
    VoiceOrchestratorService,
    /**
     * STT safe-failure handler (P9-045). Injected directly rather than via a
     * dedicated SttGatewayModule because SttGatewayModule and its STT_GATEWAY
     * concrete binding are not yet available in this skeleton (Group E wiring
     * task is separate). `SttSafeFailureService` has no database or config
     * dependencies; it can be declared as a standalone provider here.
     */
    SttSafeFailureService,
  ],
  exports: [VoiceOrchestratorService],
})
export class VoiceOrchestratorModule {}
