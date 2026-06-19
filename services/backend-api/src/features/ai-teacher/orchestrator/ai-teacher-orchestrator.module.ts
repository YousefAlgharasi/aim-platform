/**
 * P8-062: Build AI Teacher Orchestrator — module skeleton.
 * Wires the Group D (Context Builder), Group E (Prompt Builder), Group F
 * (AI Provider Gateway helper services), and the chat repositories
 * together behind `AiTeacherOrchestratorService`. `AI_PROVIDER_GATEWAY`
 * is still unbound (no concrete provider HTTP client exists yet — a
 * later Group F/G task provides it); this module is therefore not yet
 * wired into the top-level `AiTeacherModule`, the same pattern already
 * used for `PromptBuilderModule` and `ProviderGatewayModule`.
 */
import { Module } from '@nestjs/common';

import { ContextBuilderModule } from '../context-builder/context-builder.module';
import { PromptBuilderModule } from '../prompt-builder/prompt-builder.module';
import { ProviderGatewayModule } from '../provider-gateway/provider-gateway.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ProviderGatewayLoggingService } from '../provider-gateway/provider-gateway-logging.service';
import { AiTeacherOrchestratorService } from './ai-teacher-orchestrator.service';

@Module({
  imports: [
    ContextBuilderModule,
    PromptBuilderModule,
    ProviderGatewayModule,
    AiChatRepositoriesModule,
  ],
  providers: [AiTeacherOrchestratorService, ProviderGatewayLoggingService],
  exports: [AiTeacherOrchestratorService],
})
export class AiTeacherOrchestratorModule {}
