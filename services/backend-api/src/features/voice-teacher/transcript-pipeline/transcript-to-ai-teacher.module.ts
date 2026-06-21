/**
 * P9-051: Connect Transcript to Phase 8 AI Teacher Pipeline — module wiring.
 * Wires the existing Phase 8 AI Teacher Orchestrator (P8-062) behind
 * `TranscriptToAiTeacherService`. Not yet wired into the top-level
 * `VoiceTeacherModule` since no controller/API route exists to invoke it
 * directly — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { AiTeacherOrchestratorModule } from '../../ai-teacher/orchestrator/ai-teacher-orchestrator.module';
import { TranscriptToAiTeacherService } from './transcript-to-ai-teacher.service';

@Module({
  imports: [AiTeacherOrchestratorModule],
  providers: [TranscriptToAiTeacherService],
  exports: [TranscriptToAiTeacherService],
})
export class TranscriptToAiTeacherModule {}
