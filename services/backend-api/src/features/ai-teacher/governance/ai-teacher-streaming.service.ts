// P18-034: Create AI Streaming Service
// Streams AI Teacher responses to the client in chunks, but only after the
// full response has passed output safety checking — chunks are never
// emitted ahead of moderation. This keeps the fail-closed safety guarantee
// (P18-029) intact: a blocked response yields no content chunks at all,
// only a blocked outcome.

import { Injectable } from '@nestjs/common';

import { AiTeacherProviderGateway } from './ai-teacher-provider.interface';
import { AiTeacherSafetyService } from './ai-teacher-safety.service';

const DEFAULT_CHUNK_SIZE = 40;

export interface StreamGenerationRequest {
  readonly providerKeyRef: string;
  readonly modelId: string;
  readonly prompt: string;
  readonly parameters?: Record<string, unknown>;
  readonly targetType: 'message' | 'voice_segment';
  readonly targetId: string;
}

export type StreamChunk =
  | { readonly type: 'chunk'; readonly text: string }
  | { readonly type: 'done'; readonly tokensUsed: number | null }
  | { readonly type: 'blocked'; readonly category: string };

@Injectable()
export class AiTeacherStreamingService {
  constructor(
    private readonly providerGateway: AiTeacherProviderGateway,
    private readonly safetyService: AiTeacherSafetyService,
  ) {}

  async *stream(
    request: StreamGenerationRequest,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
  ): AsyncGenerator<StreamChunk> {
    const generation = await this.providerGateway.generateText({
      providerKeyRef: request.providerKeyRef,
      modelId: request.modelId,
      prompt: request.prompt,
      parameters: request.parameters,
    });

    const safetyOutcome = await this.safetyService.checkOutput(
      request.targetType,
      request.targetId,
      generation.text,
      request.providerKeyRef,
    );

    if (safetyOutcome.action === 'blocked') {
      yield { type: 'blocked', category: safetyOutcome.category };
      return;
    }

    for (let offset = 0; offset < generation.text.length; offset += chunkSize) {
      yield { type: 'chunk', text: generation.text.slice(offset, offset + chunkSize) };
    }

    yield { type: 'done', tokensUsed: generation.tokensUsed };
  }
}
