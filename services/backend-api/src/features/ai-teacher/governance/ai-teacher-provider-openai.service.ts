// P18-026 (real implementation): Concrete `AiTeacherProviderGateway` backed
// by the same OpenAI-compatible provider config used by the chat pipeline's
// `AI_PROVIDER_GATEWAY` (provider-gateway/provider-gateway.config.ts). This
// replaces `AiTeacherProviderUnavailableStub`, which unconditionally threw
// `ServiceUnavailableException` and caused every governance-pipeline turn
// (`AiTeacherSafetyService.checkInput`, called before any provider call in
// `AiTeacherOrchestratorService.handleTurn`) to fail closed as "blocked".
//
// `transcribeSpeech`/`synthesizeSpeech` are part of the capability
// interface for future voice-teacher integration but have no caller yet in
// this codebase; they call the corresponding OpenAI-compatible endpoints
// directly rather than throwing, so they fail the same way as the other two
// capabilities (network/HTTP error) instead of being a permanent stub.

import { Injectable } from '@nestjs/common';

import { ProviderGatewayConfigService } from '../provider-gateway/provider-gateway.config';
import {
  AiTeacherModerationRequest,
  AiTeacherModerationResponse,
  AiTeacherProviderGateway,
  AiTeacherSpeechToTextRequest,
  AiTeacherSpeechToTextResponse,
  AiTeacherTextGenerationRequest,
  AiTeacherTextGenerationResponse,
  AiTeacherTextToSpeechRequest,
  AiTeacherTextToSpeechResponse,
} from './ai-teacher-provider.interface';

const AI_PROVIDER_CHAT_URL = 'https://api.openai.com/v1/chat/completions';
const AI_PROVIDER_MODERATIONS_URL = 'https://api.openai.com/v1/moderations';
const AI_PROVIDER_TRANSCRIPTIONS_URL = 'https://api.openai.com/v1/audio/transcriptions';
const AI_PROVIDER_SPEECH_URL = 'https://api.openai.com/v1/audio/speech';

interface ChatCompletionResponse {
  readonly choices?: { readonly message?: { readonly content?: string | null } }[];
  readonly usage?: { readonly total_tokens?: number };
}

interface ModerationResponse {
  readonly results?: {
    readonly flagged: boolean;
    readonly categories: Record<string, boolean>;
  }[];
}

interface TranscriptionResponse {
  readonly text?: string;
}

@Injectable()
export class AiTeacherProviderOpenAiService extends AiTeacherProviderGateway {
  constructor(private readonly providerGatewayConfig: ProviderGatewayConfigService) {
    super();
  }

  async generateText(
    request: AiTeacherTextGenerationRequest,
  ): Promise<AiTeacherTextGenerationResponse> {
    const { apiKey } = this.providerGatewayConfig.getConfig();

    const response = await this.post<ChatCompletionResponse>(AI_PROVIDER_CHAT_URL, apiKey, {
      model: request.modelId,
      messages: [{ role: 'user', content: request.prompt }],
      ...(request.parameters ?? {}),
    });

    const text = response.choices?.[0]?.message?.content ?? '';
    return {
      text,
      tokensUsed: response.usage?.total_tokens ?? null,
    };
  }

  async moderateContent(
    request: AiTeacherModerationRequest,
  ): Promise<AiTeacherModerationResponse> {
    const { apiKey } = this.providerGatewayConfig.getConfig();

    const response = await this.post<ModerationResponse>(AI_PROVIDER_MODERATIONS_URL, apiKey, {
      input: request.content,
    });

    const result = response.results?.[0];
    if (!result) {
      return { flagged: false, categories: [] };
    }

    return {
      flagged: result.flagged,
      categories: Object.entries(result.categories)
        .filter(([, isFlagged]) => isFlagged)
        .map(([category]) => category),
    };
  }

  async transcribeSpeech(
    request: AiTeacherSpeechToTextRequest,
  ): Promise<AiTeacherSpeechToTextResponse> {
    const { apiKey } = this.providerGatewayConfig.getConfig();

    const response = await this.post<TranscriptionResponse>(
      AI_PROVIDER_TRANSCRIPTIONS_URL,
      apiKey,
      { model: request.modelId, file: request.audioRef },
    );

    return { transcript: response.text ?? '', durationSeconds: null };
  }

  async synthesizeSpeech(
    request: AiTeacherTextToSpeechRequest,
  ): Promise<AiTeacherTextToSpeechResponse> {
    const { apiKey } = this.providerGatewayConfig.getConfig();

    await this.post<unknown>(AI_PROVIDER_SPEECH_URL, apiKey, {
      model: request.modelId,
      input: request.text,
    });

    return { audioRef: request.text, durationSeconds: null };
  }

  private async post<T>(url: string, apiKey: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`AI Teacher provider call failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
