/**
 * P21-021: `voice_transcripts` no longer receives new writes as of Phase
 * 21. `create()`'s only caller, `VoiceMessagePersistenceService`, is not
 * wired into any module (see that service's own file header) and is
 * never invoked at runtime — new voice-turn transcripts are persisted
 * directly onto `ai_chat_messages` rows via
 * `AiTeacherOrchestratorService.handleTurn()` (P21-010) instead.
 * `findByMessageId`/`findBySessionId` currently have no callers either
 * (grep-verified) — this table is fully historical/read-only, retained
 * for its existing rows only. Do not delete this table, its rows, or this
 * repository — that is a separate future cleanup decision.
 */
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import { VoiceTranscriptRow } from './voice-repository.types';

@Injectable()
export class VoiceTranscriptRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    messageId: string,
    sessionId: string,
    transcriptText: string,
    languageCode: string | null,
    confidence: number | null,
    segments: unknown | null,
    providerRef: string | null,
  ): Promise<VoiceTranscriptRow> {
    const result = await this.db.query<VoiceTranscriptRow>(
      `INSERT INTO voice_transcripts (message_id, session_id, transcript_text, language_code, confidence, segments, provider_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, message_id, session_id, transcript_text, language_code, confidence, segments, provider_ref, created_at`,
      [messageId, sessionId, transcriptText, languageCode, confidence, segments ? JSON.stringify(segments) : null, providerRef],
    );

    return result.rows[0] ?? null;
  }

  async findByMessageId(messageId: string): Promise<VoiceTranscriptRow | null> {
    const result = await this.db.query<VoiceTranscriptRow>(
      `SELECT id, message_id, session_id, transcript_text, language_code, confidence, segments, provider_ref, created_at
       FROM voice_transcripts
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  async findBySessionId(sessionId: string): Promise<VoiceTranscriptRow[]> {
    const result = await this.db.query<VoiceTranscriptRow>(
      `SELECT id, message_id, session_id, transcript_text, language_code, confidence, segments, provider_ref, created_at
       FROM voice_transcripts
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId],
    );

    return result.rows;
  }
}
