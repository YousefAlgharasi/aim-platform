/**
 * P21-021: `voice_sessions` no longer receives new writes as of Phase 21.
 * `VoiceSessionStartService` (P21-007) now delegates session creation to
 * `ChatSessionStartService`'s get-or-create-by-(studentId, contextRef) path
 * against `ai_chat_sessions` — new voice conversations live there, not
 * here. `create()`/`endSession()` below are dead code paths kept only so
 * this repository still compiles against its existing read call sites;
 * nothing in this codebase calls them anymore (verified by grep).
 *
 * What still reads this table (inventory, current as of this comment):
 *   - `parent-ai-usage-summary.service.ts` (`findByStudentId`) — parent
 *     activity summary still surfaces historical voice session counts.
 *   - `voice-session-context-link.service.ts` (`findById`) — resolves a
 *     legacy voice_sessions row's contextRef for old audio/session links.
 *   - `admin-stats.service.ts` reads a raw `voice_sessions` count directly
 *     (not through this repository) for admin analytics.
 * All of the above are read-only historical reporting; none of them
 * expect this table to grow going forward. Do not delete this table, its
 * rows, or these read paths — that is a separate future cleanup decision,
 * not this task's scope.
 */
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

    return result.rows[0] ?? null;
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
