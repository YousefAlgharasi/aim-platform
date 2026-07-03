/**
 * P9-048: Voice Orchestrator (Group F — Voice Orchestration With Phase 8 AI
 * Teacher). Wires the STT Gateway (Group E), the TTS Gateway (Group G), and
 * the Phase 8 AI Teacher Orchestrator (P8-062) together behind
 * `VoiceOrchestratorService`.
 *
 * Dependency: SttGatewayModule, TtsGatewayModule, AiTeacherOrchestratorModule.
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.module';
import { SttGatewayModule } from '../stt-gateway/stt-gateway.module';
import { TtsGatewayModule } from '../tts-gateway/tts-gateway.module';
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
    SttGatewayModule,
    TtsGatewayModule,
  ],
  providers: [VoiceOrchestratorService],
  exports: [VoiceOrchestratorService, TtsGatewayModule],
})
export class VoiceOrchestratorModule {}
