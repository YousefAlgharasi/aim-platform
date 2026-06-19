/**
 * P8-062: Build AI Teacher Orchestrator — module skeleton.
 * Wires the Group D (Context Builder), Group E (Prompt Builder), Group F
 * (AI Provider Gateway helper services), the response safety filter
 * (P8-066), and the chat repositories together behind
 * `AiTeacherOrchestratorService`. `AI_PROVIDER_GATEWAY` is bound by
 * `ProviderGatewayModule` (P8-065); this module is still not wired into
 * the top-level `AiTeacherModule` since no controller/API route exists
 * yet to invoke it — that integration is a separate, later task.
 */
import { Module } from '@nestjs/common';

import { ContextBuilderModule } from '../context-builder/context-builder.module';
import { PromptBuilderModule } from '../prompt-builder/prompt-builder.module';
import { ProviderGatewayModule } from '../provider-gateway/provider-gateway.module';
import { ResponseSafetyFilterModule } from '../response-safety/response-safety-filter.module';
import { AiChatRepositoriesModule } from '../repositories/ai-chat-repositories.module';
import { ProviderGatewayLoggingService } from '../provider-gateway/provider-gateway-logging.service';
import { AiTeacherOrchestratorService } from './ai-teacher-orchestrator.service';

@Module({
  imports: [
    ContextBuilderModule,
    PromptBuilderModule,
    ProviderGatewayModule,
    ResponseSafetyFilterModule,
    AiChatRepositoriesModule,
  ],
  providers: [AiTeacherOrchestratorService, ProviderGatewayLoggingService],
  exports: [AiTeacherOrchestratorService],
})
export class AiTeacherOrchestratorModule {}
