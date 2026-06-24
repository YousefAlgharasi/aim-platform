// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_context_snapshots.
// context_data must be assembled by the Context Builder (Group D) from
// backend-approved, read-only AIM Engine outputs only; this repository
// never inspects or computes that payload.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiContextSnapshotRow } from './ai-chat-repository.types';

@Injectable()
export class AiContextSnapshotRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    sessionId: string,
    messageId: string,
    studentId: string,
    contextData: Record<string, unknown>,
  ): Promise<AiContextSnapshotRow> {
    const result = await this.db.query<AiContextSnapshotRow>(
      `INSERT INTO ai_context_snapshots (session_id, message_id, student_id, context_data)
       VALUES ($1, $2, $3, $4::jsonb)
       RETURNING id, session_id, message_id, student_id, context_data, created_at`,
      [sessionId, messageId, studentId, JSON.stringify(contextData)],
    );

    return result.rows[0] ?? null;
  }

  async findByMessageId(messageId: string): Promise<AiContextSnapshotRow | null> {
    const result = await this.db.query<AiContextSnapshotRow>(
      `SELECT id, session_id, message_id, student_id, context_data, created_at
       FROM ai_context_snapshots
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }
}
