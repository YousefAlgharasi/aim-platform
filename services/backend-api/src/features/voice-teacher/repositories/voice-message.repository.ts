import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceMessageRow } from './voice-repository.types';

@Injectable()
export class VoiceMessageRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(sessionId: string, studentId: string): Promise<VoiceMessageRow> {
    const result = await this.db.query<VoiceMessageRow>(
      `INSERT INTO voice_messages (session_id, student_id)
       VALUES ($1, $2)
       RETURNING id, session_id, student_id, transcript, reply, audio_ref, status, created_at`,
      [sessionId, studentId],
    );

    return result.rows[0];
  }

  async findById(messageId: string): Promise<VoiceMessageRow | null> {
    const result = await this.db.query<VoiceMessageRow>(
      `SELECT id, session_id, student_id, transcript, reply, audio_ref, status, created_at
       FROM voice_messages
       WHERE id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  async findBySessionId(sessionId: string): Promise<VoiceMessageRow[]> {
    const result = await this.db.query<VoiceMessageRow>(
      `SELECT id, session_id, student_id, transcript, reply, audio_ref, status, created_at
       FROM voice_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId],
    );

    return result.rows;
  }

  async updateTranscript(messageId: string, transcript: string): Promise<void> {
    await this.db.query(
      `UPDATE voice_messages
       SET transcript = $2, status = 'transcribed'
       WHERE id = $1`,
      [messageId, transcript],
    );
  }

  async updateReply(messageId: string, reply: string): Promise<void> {
    await this.db.query(
      `UPDATE voice_messages
       SET reply = $2, status = 'replied'
       WHERE id = $1`,
      [messageId, reply],
    );
  }

  async updateAudioRef(messageId: string, audioRef: string): Promise<void> {
    await this.db.query(
      `UPDATE voice_messages
       SET audio_ref = $2, status = 'synthesized'
       WHERE id = $1`,
      [messageId, audioRef],
    );
  }

  async markFailed(messageId: string): Promise<void> {
    await this.db.query(
      `UPDATE voice_messages
       SET status = 'failed'
       WHERE id = $1`,
      [messageId],
    );
  }

  // -------------------------------------------------------------------------
  // P9-055: Voice rate limit policy helpers
  // -------------------------------------------------------------------------

  /** Count voice messages recorded for a given session (one per voice
   *  turn from the student's side). */
  async countBySessionId(sessionId: string): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM voice_messages
       WHERE session_id = $1`,
      [sessionId],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /** Count voice messages for a given student within a rolling time
   *  window (defined by `windowStart`). */
  async countByStudentIdSince(studentId: string, windowStart: Date): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) AS count
       FROM voice_messages
       WHERE student_id = $1
         AND created_at >= $2`,
      [studentId, windowStart],
    );
    return parseInt(result.rows[0]?.count ?? '0', 10);
  }

  /** Return the most recent voice message timestamp for a given session,
   *  or null if no voice message exists yet. */
  async findLastCreatedAtBySessionId(sessionId: string): Promise<Date | null> {
    const result = await this.db.query<{ created_at: Date }>(
      `SELECT created_at
       FROM voice_messages
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessionId],
    );
    return result.rows[0]?.created_at ?? null;
  }
}
