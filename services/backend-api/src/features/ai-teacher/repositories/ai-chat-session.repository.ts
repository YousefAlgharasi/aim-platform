// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_chat_sessions.
// student_id must always be resolved by the caller from the authenticated
// JWT — this repository never validates ownership itself, it only persists
// what it is given.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiChatSessionRow } from './ai-chat-repository.types';

@Injectable()
export class AiChatSessionRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(studentId: string, contextRef: string): Promise<AiChatSessionRow> {
    const result = await this.db.query<AiChatSessionRow>(
      `INSERT INTO ai_chat_sessions (student_id, context_ref)
       VALUES ($1, $2)
       RETURNING id, student_id, context_ref, status, created_at, updated_at`,
      [studentId, contextRef],
    );

    return result.rows[0];
  }

  async findById(sessionId: string): Promise<AiChatSessionRow | null> {
    const result = await this.db.query<AiChatSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM ai_chat_sessions
       WHERE id = $1
       LIMIT 1`,
      [sessionId],
    );

    return result.rows[0] ?? null;
  }

  async findActiveByStudentId(studentId: string): Promise<AiChatSessionRow[]> {
    const result = await this.db.query<AiChatSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM ai_chat_sessions
       WHERE student_id = $1 AND status = 'active'
       ORDER BY updated_at DESC`,
      [studentId],
    );

    return result.rows;
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.db.query(
      `UPDATE ai_chat_sessions
       SET status = 'closed', updated_at = now()
       WHERE id = $1`,
      [sessionId],
    );
  }
}
