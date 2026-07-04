/**
 * P8-063: Build Chat Session Start Service — module skeleton.
 * P8-071: Wires `ChatSessionStartController` (POST /ai-teacher/sessions)
 * onto this module, backed by `AiChatRepositoriesModule` (P8-026).
 */
import { Module } from '@nestjs/common';

import { AuthModule } from '../../../auth/auth.module';
import { RolesModule } from '../../roles';
import { UsersModule } from '../../users';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { AiTeacherOrchestratorModule } from '../orchestrator/ai-teacher-orchestrator.module';
import { ContextBuilderModule } from '../context-builder/context-builder.module';
import { TtsGatewayModule } from '../../voice-teacher/tts-gateway/tts-gateway.module';
import { AimModule } from '../../aim/aim.module';
import { ChatSessionStartService } from './chat-session-start.service';
import { ChatSessionStartController } from './chat-session-start.controller';
import { FocusRecapModule } from './focus-recap.module';
import { LastSessionRecapService } from './last-session-recap.service';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    UsersModule,
    AiChatRepositoriesModule,
    // P21-008/P21-009: greeting generation + eager TTS synthesis on new
    // session creation.
    AiTeacherOrchestratorModule,
    ContextBuilderModule,
    TtsGatewayModule,
    // P21-012: focusRecap field on the session-start response.
    FocusRecapModule,
    // P21-013: last-session recap needs StudentSkillStateReadService /
    // WeaknessRecordsReadService (both already exported by AimModule for
    // the context builder's own adapters).
    AimModule,
  ],
  controllers: [ChatSessionStartController],
  providers: [ChatSessionStartService, LastSessionRecapService],
  exports: [ChatSessionStartService],
})
export class ChatSessionStartModule {}
