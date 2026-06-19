/**
 * P9-053: Generate AI Teacher Text Response for Voice — module wiring.
 * Wires `VoiceSessionContextLinkModule` (P9-052) and the existing AI
 * Teacher Orchestrator (P8-062) behind `TranscriptToAiTeacherService`
 * (P9-051) to produce `VoiceResponseGenerationService`. Not yet wired into
 * the top-level `VoiceTeacherModule` since no controller/API route exists
 * to invoke it directly — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.module';
import { VoiceSessionContextLinkModule } from '../context-link/voice-session-context-link.module';
import { TranscriptToAiTeacherService } from '../transcript-pipeline/transcript-to-ai-teacher.service';
import { VoiceResponseGenerationService } from './voice-response-generation.service';

@Module({
  imports: [VoiceSessionContextLinkModule, AiTeacherOrchestratorModule],
  providers: [TranscriptToAiTeacherService, VoiceResponseGenerationService],
  exports: [VoiceResponseGenerationService],
})
export class VoiceResponseGenerationModule {}
