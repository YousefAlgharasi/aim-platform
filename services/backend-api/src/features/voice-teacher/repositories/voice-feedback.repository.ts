import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceFeedbackRow } from './voice-repository.types';

@Injectable()
export class VoiceFeedbackRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    messageId: string,
    sessionId: string,
    studentId: string,
    rating: 'helpful' | 'not_helpful',
  ): Promise<VoiceFeedbackRow> {
    const result = await this.db.query<VoiceFeedbackRow>(
      `INSERT INTO voice_feedback (message_id, session_id, student_id, rating)
       VALUES ($1, $2, $3, $4)
       RETURNING id, message_id, session_id, student_id, rating, created_at`,
      [messageId, sessionId, studentId, rating],
    );

    return result.rows[0];
  }

  async findByMessageId(messageId: string): Promise<VoiceFeedbackRow | null> {
    const result = await this.db.query<VoiceFeedbackRow>(
      `SELECT id, message_id, session_id, student_id, rating, created_at
       FROM voice_feedback
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }
}
