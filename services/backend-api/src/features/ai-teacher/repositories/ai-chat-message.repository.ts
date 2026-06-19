// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_chat_messages.
// session_id/student_id ownership must be validated by the caller before
// invoking this repository; text must already be safety-filtered.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiChatMessageRow } from './ai-chat-repository.types';

@Injectable()
export class AiChatMessageRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    sessionId: string,
    studentId: string,
    role: 'student' | 'ai_teacher',
    text: string,
  ): Promise<AiChatMessageRow> {
    const result = await this.db.query<AiChatMessageRow>(
      `INSERT INTO ai_chat_messages (session_id, student_id, role, text)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_id, student_id, role, text, created_at`,
      [sessionId, studentId, role, text],
    );

    return result.rows[0];
  }

  async findById(messageId: string): Promise<AiChatMessageRow | null> {
    const result = await this.db.query<AiChatMessageRow>(
      `SELECT id, session_id, student_id, role, text, created_at
       FROM ai_chat_messages
       WHERE id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  async findBySessionId(sessionId: string): Promise<AiChatMessageRow[]> {
    const result = await this.db.query<AiChatMessageRow>(
      `SELECT id, session_id, student_id, role, text, created_at
       FROM ai_chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId],
    );

    return result.rows;
  }
}
