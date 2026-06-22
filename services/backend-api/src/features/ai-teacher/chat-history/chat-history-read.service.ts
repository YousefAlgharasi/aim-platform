/**
 * P8-073: Create Chat History API.
 * Reads the persisted message history for an AI Teacher chat session via
 * `AiChatSessionRepository` and `AiChatMessageRepository` (P8-026).
 * Ownership is enforced by the caller (controller) before this service is
 * invoked; this service itself only checks that the session it is given
 * belongs to the given studentId, as defense in depth. Performs no AI
 * provider call and computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { AiChatMessageRepository } from '../repositories/ai-chat-message.repository';
import { GetChatHistoryInput, GetChatHistoryResult } from './chat-history-read.types';

@Injectable()
export class ChatHistoryReadService {
  constructor(
    private readonly chatSessionRepository: AiChatSessionRepository,
    private readonly chatMessageRepository: AiChatMessageRepository,
  ) {}

  async getHistory(input: GetChatHistoryInput): Promise<GetChatHistoryResult | null> {
    const studentId = input.studentId?.trim();
    const sessionId = input.sessionId?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot read chat history: studentId is missing.');
    }

    if (!sessionId) {
      throw new BadRequestException('Cannot read chat history: sessionId is missing.');
    }

    const session = await this.chatSessionRepository.findById(sessionId);

    if (!session || session.student_id !== studentId) {
      return null;
    }

    const rows = await this.chatMessageRepository.findBySessionId(sessionId);

    return {
      sessionId: session.id,
      messages: rows.map((row) => ({
        id: row.id,
        role: row.role,
        text: row.text,
        createdAt: row.created_at,
      })),
    };
  }
}
