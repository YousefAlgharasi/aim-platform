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

  // -------------------------------------------------------------------------
  // P8-069: Rate limit policy helpers
  // -------------------------------------------------------------------------

  /** Count student-role messages in a given session (one per AI Teacher
   *  turn from the student's side). */
  async countStudentTurnsBySession(sessionId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM ai_chat_messages
       WHERE session_id = $1
         AND role = 'student'`,
      [sessionId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /** Count student-role messages for a given student within a rolling
   *  time window (defined by `windowStart`). */
  async countStudentTurnsSince(studentId: string, windowStart: Date): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM ai_chat_messages
       WHERE student_id = $1
         AND role = 'student'
         AND created_at >= $2`,
      [studentId, windowStart],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /** Return the most recent student-role message timestamp for a given
   *  session, or null if no student message exists yet. */
  async findLastStudentTurnCreatedAt(sessionId: string): Promise<Date | null> {
    const result = await this.db.query<{ created_at: Date }>(
      `SELECT created_at
       FROM ai_chat_messages
       WHERE session_id = $1
         AND role = 'student'
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessionId],
    );
    return result.rows[0]?.created_at ?? null;
  }
}
