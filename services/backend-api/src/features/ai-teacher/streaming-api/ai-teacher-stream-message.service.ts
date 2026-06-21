// P18-043: Create AI Streaming Message API
//
// Streams an already safety-filtered AI Teacher reply to the client in
// fixed-size chunks. This service never streams unsafety-checked content:
// the full reply is produced by AiTeacherOrchestratorService.handleTurn —
// which enforces rate limiting, runs the provider call, and applies the
// response safety filter (P8-066) — before a single chunk is emitted
// (the same buffered/safety-gated streaming pattern used by
// AiTeacherStreamingService in governance/).
//
// Computes no mastery/level/weakness/difficulty/recommendation/
// review-schedule value (docs/phase-8/no-aim-replacement-rule.md).

import { Injectable } from '@nestjs/common';

import { AiTeacherOrchestratorService } from '../orchestrator/ai-teacher-orchestrator.service';
import { ChatTurnInput } from '../orchestrator/ai-teacher-orchestrator.types';

const DEFAULT_CHUNK_SIZE = 40;

export type StreamMessageEvent =
  | { readonly type: 'chunk'; readonly text: string }
  | {
      readonly type: 'done';
      readonly isFallback: boolean;
      readonly provider: string;
      readonly model: string;
    };

@Injectable()
export class AiTeacherStreamMessageService {
  constructor(private readonly orchestrator: AiTeacherOrchestratorService) {}

  async *streamTurn(
    input: ChatTurnInput,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
  ): AsyncGenerator<StreamMessageEvent> {
    const result = await this.orchestrator.handleTurn(input);

    for (let offset = 0; offset < result.text.length; offset += chunkSize) {
      yield { type: 'chunk', text: result.text.slice(offset, offset + chunkSize) };
    }

    yield {
      type: 'done',
      isFallback: result.isFallback,
      provider: result.provider,
      model: result.model,
    };
  }
}
