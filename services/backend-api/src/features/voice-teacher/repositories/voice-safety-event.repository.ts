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
}
