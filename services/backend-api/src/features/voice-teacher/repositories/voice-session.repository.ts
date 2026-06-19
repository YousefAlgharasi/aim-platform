import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceSessionRow } from './voice-repository.types';

@Injectable()
export class VoiceSessionRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(studentId: string, contextRef: string): Promise<VoiceSessionRow> {
    const result = await this.db.query<VoiceSessionRow>(
      `INSERT INTO voice_sessions (student_id, context_ref)
       VALUES ($1, $2)
       RETURNING id, student_id, context_ref, status, created_at, updated_at`,
      [studentId, contextRef],
    );

    return result.rows[0];
  }

  async findById(sessionId: string): Promise<VoiceSessionRow | null> {
    const result = await this.db.query<VoiceSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM voice_sessions
       WHERE id = $1
       LIMIT 1`,
      [sessionId],
    );

    return result.rows[0] ?? null;
  }

  async findActiveByStudentId(studentId: string): Promise<VoiceSessionRow[]> {
    const result = await this.db.query<VoiceSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM voice_sessions
       WHERE student_id = $1 AND status = 'active'
       ORDER BY updated_at DESC`,
      [studentId],
    );

    return result.rows;
  }

  async findByStudentId(studentId: string): Promise<VoiceSessionRow[]> {
    const result = await this.db.query<VoiceSessionRow>(
      `SELECT id, student_id, context_ref, status, created_at, updated_at
       FROM voice_sessions
       WHERE student_id = $1
       ORDER BY updated_at DESC`,
      [studentId],
    );

    return result.rows;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.db.query(
      `UPDATE voice_sessions
       SET status = 'ended', updated_at = now()
       WHERE id = $1`,
      [sessionId],
    );
  }
}
