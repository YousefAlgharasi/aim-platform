/**
 * P8-063: Build Chat Session Start Service (Group G — AI Teacher Backend
 * Pipeline). Creates a new, student-owned `ai_chat_sessions` row via
 * `AiChatSessionRepository` (P8-026). `studentId` ownership is resolved
 * by the caller (e.g. from the authenticated JWT, in a later API task);
 * this service never validates ownership itself, only that the inputs it
 * is given are present. Performs no AI provider call and computes no
 * mastery/level/weakness/difficulty/recommendation/review-schedule value
 * (docs/phase-8/no-aim-replacement-rule.md).
 */
import { Injectable } from '@nestjs/common';

import { AiChatSessionRepository } from '../repositories/ai-chat-session.repository';
import { StartChatSessionInput, StartChatSessionResult } from './chat-session-start.types';

@Injectable()
export class ChatSessionStartService {
  constructor(private readonly chatSessionRepository: AiChatSessionRepository) {}

  async startSession(input: StartChatSessionInput): Promise<StartChatSessionResult> {
    const studentId = input.studentId?.trim();
    const contextRef = input.contextRef?.trim();

    if (!studentId) {
      throw new Error('Cannot start an AI chat session: studentId is missing.');
    }

    if (!contextRef) {
      throw new Error('Cannot start an AI chat session: contextRef is missing.');
    }

    const session = await this.chatSessionRepository.create(studentId, contextRef);

    return {
      sessionId: session.id,
      studentId: session.student_id,
      contextRef: session.context_ref,
      status: session.status,
      createdAt: session.created_at,
    };
  }
}
