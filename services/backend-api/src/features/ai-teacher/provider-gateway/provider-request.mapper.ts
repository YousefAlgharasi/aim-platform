/**
 * P8-055: Create AI Provider Request Mapper.
 * Converts an internal `AiProviderRequest` (Group F contract,
 * provider-gateway.types.ts) carrying a backend-built `AiTeacherPrompt`
 * (Group E) into a provider-specific `ProviderCompletionRequest`. This
 * mapper performs no database access, no AI provider call, and computes
 * no mastery/level/weakness/difficulty/recommendation/review-schedule
 * value; it only restates the prompt's existing fields in the provider's
 * expected shape (docs/phase-8/no-aim-replacement-rule.md). The model
 * name is read from `ProviderGatewayConfigService`, never hard-coded; the
 * provider API key is never read or included here, since the HTTP client
 * (a later Group F task) attaches it out-of-band, never inside the
 * request body.
 */
import { Injectable } from '@nestjs/common';

import { AiProviderRequest } from './provider-gateway.types';
import { ProviderGatewayConfigService } from './provider-gateway.config';
import { ProviderChatMessage, ProviderCompletionRequest } from './provider-request-mapper.types';

@Injectable()
export class ProviderRequestMapperService {
  constructor(private readonly providerGatewayConfig: ProviderGatewayConfigService) {}

  mapRequest(request: AiProviderRequest): ProviderCompletionRequest {
    const { model } = this.providerGatewayConfig.getConfig();
    const { prompt } = request;

    const sectionsText = prompt.sections
      .map((section) => `[${section.key}]\n${section.content}`)
      .join('\n\n');

    const userContent = [sectionsText, `Student: ${prompt.studentMessage}`]
      .filter((part) => part.length > 0)
      .join('\n\n');

    const messages: ProviderChatMessage[] = [
      { role: 'system', content: prompt.systemInstructions },
      { role: 'user', content: userContent },
    ];

    return { model, messages };
  }
}
