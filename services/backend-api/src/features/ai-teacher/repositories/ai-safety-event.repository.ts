// P8-026: Add Backend AI Chat Repositories
// Backend-only persistence abstraction for ai_safety_events.
// Records that a safety check ran and its outcome only — never the
// rejected raw message/response content.

import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { AiSafetyEventRow } from './ai-chat-repository.types';

export interface CreateAiSafetyEventInput {
  readonly sessionId: string;
  readonly direction: 'input' | 'output';
  readonly decision: 'allowed' | 'rejected';
  readonly reasonCategory?: string | null;
}

@Injectable()
export class AiSafetyEventRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(input: CreateAiSafetyEventInput): Promise<AiSafetyEventRow> {
    const result = await this.db.query<AiSafetyEventRow>(
      `INSERT INTO ai_safety_events (session_id, direction, decision, reason_category)
       VALUES ($1, $2, $3, $4)
       RETURNING id, session_id, direction, decision, reason_category, created_at`,
      [input.sessionId, input.direction, input.decision, input.reasonCategory ?? null],
    );

    return result.rows[0] ?? null;
  }

  async findBySessionId(sessionId: string): Promise<AiSafetyEventRow[]> {
    const result = await this.db.query<AiSafetyEventRow>(
      `SELECT id, session_id, direction, decision, reason_category, created_at
       FROM ai_safety_events
       WHERE session_id = $1
       ORDER BY created_at DESC`,
      [sessionId],
    );

    return result.rows;
  }

  // ---------------------------------------------------------------------
  // P18-051: Admin AI Safety Review API — read-only listing for admins.
  // Only the recorded decision/reason_category is exposed, never the
  // rejected raw message/response content.
  // ---------------------------------------------------------------------

  async listRecentRejected(limit: number): Promise<AiSafetyEventRow[]> {
    const result = await this.db.query<AiSafetyEventRow>(
      `SELECT id, session_id, direction, decision, reason_category, created_at
       FROM ai_safety_events
       WHERE decision = 'rejected'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );

    return result.rows;
  }

  // ---------------------------------------------------------------------
  // P18-071: Parent AI Safety Summary UI — count-only, read-only rollup
  // for a parent-facing summary. Never returns reason_category or any
  // rejected raw message/response content to this caller.
  // ---------------------------------------------------------------------

  async countRejectedByStudentId(studentId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM ai_safety_events e
       JOIN ai_chat_sessions s ON s.id = e.session_id
       WHERE s.student_id = $1 AND e.decision = 'rejected'`,
      [studentId],
    );

    return Number(result.rows[0]?.count ?? 0);
  }
}
