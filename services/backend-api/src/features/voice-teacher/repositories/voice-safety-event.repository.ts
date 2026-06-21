import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceSafetyEventRow } from './voice-repository.types';

@Injectable()
export class VoiceSafetyEventRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    sessionId: string,
    messageId: string | null,
    direction: 'input' | 'output',
    decision: 'allowed' | 'rejected',
    reasonCategory: string | null,
  ): Promise<VoiceSafetyEventRow> {
    const result = await this.db.query<VoiceSafetyEventRow>(
      `INSERT INTO voice_safety_events (session_id, message_id, direction, decision, reason_category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, session_id, message_id, direction, decision, reason_category, created_at`,
      [sessionId, messageId, direction, decision, reasonCategory],
    );

    return result.rows[0];
  }

  async findBySessionId(sessionId: string): Promise<VoiceSafetyEventRow[]> {
    const result = await this.db.query<VoiceSafetyEventRow>(
      `SELECT id, session_id, message_id, direction, decision, reason_category, created_at
       FROM voice_safety_events
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId],
    );

    return result.rows;
  }

  // ---------------------------------------------------------------------
  // P18-071: Parent AI Safety Summary UI — count-only, read-only rollup
  // for a parent-facing summary. Never returns reason_category or any
  // rejected raw audio/transcript/response content to this caller.
  // ---------------------------------------------------------------------

  async countRejectedByStudentId(studentId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM voice_safety_events e
       JOIN voice_sessions s ON s.id = e.session_id
       WHERE s.student_id = $1 AND e.decision = 'rejected'`,
      [studentId],
    );

    return Number(result.rows[0]?.count ?? 0);
  }
}
