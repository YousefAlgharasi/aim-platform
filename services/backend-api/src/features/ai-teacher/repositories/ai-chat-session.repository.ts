// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_chat_sessions.
// student_id must always be resolved by the caller from the authenticated
// JWT — this repository never validates ownership itself, it only persists
// what it is given.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiChatSessionRow, AiChatSessionWithContextTitleRow } from './ai-chat-repository.types';

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

    return result.rows[0] ?? null;
  }

  /**
   * P21-007: Single source of truth for "which ai_chat_sessions row does
   * this (student, contextRef) pair map to". Both the AI Teacher chat entry
   * point and the Voice Teacher entry point call this instead of each
   * creating their own session row, so a lesson's chat and voice turns
   * resolve to one conversation.
   *
   * Returns the most recent *active* session for (studentId, contextRef) if
   * one exists; otherwise creates a new one, identical to create()'s
   * behavior. `created` tells the caller whether a brand-new session was
   * made (used by P21-008 to decide whether to generate an opening
   * greeting).
   */
  async getOrCreateForContext(
    studentId: string,
    contextRef: string,
  ): Promise<{ session: AiChatSessionRow; created: boolean }> {
    const existing = await this.db.query<AiChatSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM ai_chat_sessions
       WHERE student_id = $1 AND context_ref = $2 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId, contextRef],
    );

    if (existing.rows[0]) {
      return { session: existing.rows[0], created: false };
    }

    const session = await this.create(studentId, contextRef);
    return { session, created: true };
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

  /**
   * Same as findActiveByStudentId, but also resolves a display title for
   * `lesson:<uuid>` context refs by joining `lessons`, so the session list
   * can show the actual lesson name instead of a raw UUID slug. Other
   * context_ref shapes (e.g. `general`) yield contextTitle: null.
   */
  async findActiveByStudentIdWithContextTitle(
    studentId: string,
  ): Promise<AiChatSessionWithContextTitleRow[]> {
    const result = await this.db.query<AiChatSessionWithContextTitleRow>(
      `SELECT s.id, s.student_id, s.context_ref, s.status, s.created_at, s.updated_at,
              l.title AS context_title
       FROM ai_chat_sessions s
       LEFT JOIN lessons l
         ON s.context_ref LIKE 'lesson:%'
        AND l.id = substring(s.context_ref FROM 8)::uuid
       WHERE s.student_id = $1 AND s.status = 'active'
       ORDER BY s.updated_at DESC`,
      [studentId],
    );

    return result.rows;
  }

  async findByStudentId(studentId: string): Promise<AiChatSessionRow[]> {
    const result = await this.db.query<AiChatSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM ai_chat_sessions
       WHERE student_id = $1
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
