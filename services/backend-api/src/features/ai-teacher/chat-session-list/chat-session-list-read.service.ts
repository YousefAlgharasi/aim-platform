/**
 * P8-074: Create Chat Session List API.
 * Lists the authenticated student's active AI Teacher chat sessions via
 * `AiChatSessionRepository.findActiveByStudentId` (P8-026). Performs no
 * AI provider call and computes no mastery/level/weakness/difficulty/
 * recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { ListChatSessionsInput, ListChatSessionsResult } from './chat-session-list-read.types';

@Injectable()
export class ChatSessionListReadService {
  constructor(private readonly chatSessionRepository: AiChatSessionRepository) {}

  async listSessions(input: ListChatSessionsInput): Promise<ListChatSessionsResult> {
    const studentId = input.studentId?.trim();

    if (!studentId) {
      throw new BadRequestException('Cannot list chat sessions: studentId is missing.');
    }

    const rows = await this.chatSessionRepository.findActiveByStudentId(studentId);

    return {
      sessions: rows.map((row) => ({
        sessionId: row.id,
        contextRef: row.context_ref,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  }
}
