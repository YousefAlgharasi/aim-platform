/**
 * P9-044: Persist STT Transcript.
 * Writes a mapped, safety-filtered STT transcript from the STT Gateway
 * into the voice_transcripts table (P9-021 migration), keyed by the
 * voice_messages turn it belongs to.
 *
 * Authority boundary rules enforced here:
 *   - messageId and sessionId must be backend-resolved and ownership-
 *     validated by the caller before invoking this service; this service
 *     performs no JWT resolution or ownership check itself.
 *   - transcriptText must already be safety-filtered by the STT Gateway
 *     before reaching this service; raw provider response bodies must
 *     never be passed in.
 *   - confidence is stored as an advisory quality signal only; this
 *     service does not interpret, threshold, or forward it to the AIM
 *     Engine for any mastery, level, weakness, difficulty, recommendation,
 *     or review-schedule decision.
 *   - No STT/TTS/AI provider credentials are accepted or stored.
 *   - The UNIQUE(message_id) constraint on voice_transcripts is enforced
 *     at the DB layer; if a transcript already exists for a turn, the
 *     upsert returns the existing row silently rather than throwing.
 *
 * Dependency: P9-021 (voice_transcripts table), P9-041 (SttProviderResponse
 * type from stt-gateway.types.ts that callers map through before calling
 * this service).
 */

import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../../database/database.service';
import {
  CreateVoiceTranscriptInput,
  VoiceTranscriptRow,
} from './stt-transcript-persistence.types';

@Injectable()
export class SttTranscriptPersistenceService {
  private readonly logger = new Logger(SttTranscriptPersistenceService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Persist a mapped, safety-filtered transcript for a voice turn.
   *
   * Uses INSERT … ON CONFLICT DO NOTHING so that a duplicate call for
   * the same turn (e.g. from a retry) is idempotent: the existing row is
   * returned rather than an error being raised.
   *
   * The caller is responsible for:
   *  - Resolving and validating messageId/sessionId ownership before
   *    calling this method.
   *  - Ensuring transcriptText has already passed safety filtering.
   *  - Never passing raw provider response bodies, API keys, or AIM
   *    Engine internal fields in any parameter.
   */
  async persist(input: CreateVoiceTranscriptInput): Promise<VoiceTranscriptRow> {
    const {
      messageId,
      sessionId,
      transcriptText,
      languageCode = null,
      confidence = null,
      segments = null,
      providerRef = null,
    } = input;

    const result = await this.db.query<VoiceTranscriptRow>(
      `INSERT INTO voice_transcripts
         (message_id, session_id, transcript_text, language_code,
          confidence, segments, provider_ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (message_id) DO NOTHING
       RETURNING id, message_id, session_id, transcript_text,
                 language_code, confidence, segments, provider_ref,
                 created_at`,
      [
        messageId,
        sessionId,
        transcriptText,
        languageCode,
        confidence,
        segments != null ? JSON.stringify(segments) : null,
        providerRef,
      ],
    );

    if (result.rows.length > 0) {
      return result.rows[0] ?? null;
    }

    // ON CONFLICT DO NOTHING returned zero rows — a transcript already
    // exists for this turn. Fetch and return the existing row.
    this.logger.warn(
      `SttTranscriptPersistenceService.persist: transcript already exists for messageId=${messageId}; returning existing row`,
    );
    return this.findByMessageId(messageId) as Promise<VoiceTranscriptRow>;
  }

  /**
   * Look up the transcript for a specific voice turn by its message ID.
   * Returns null if no transcript has been persisted yet.
   *
   * The caller must have already validated that the requesting student
   * owns the session that contains this message.
   */
  async findByMessageId(messageId: string): Promise<VoiceTranscriptRow | null> {
    const result = await this.db.query<VoiceTranscriptRow>(
      `SELECT id, message_id, session_id, transcript_text,
              language_code, confidence, segments, provider_ref,
              created_at
       FROM voice_transcripts
       WHERE message_id = $1
       LIMIT 1`,
      [messageId],
    );

    return result.rows[0] ?? null;
  }

  /**
   * Return all transcripts for a session, ordered chronologically.
   * Useful for building conversation context or history views.
   *
   * The caller must have already validated that the requesting student
   * owns the session.
   */
  async findBySessionId(sessionId: string): Promise<VoiceTranscriptRow[]> {
    const result = await this.db.query<VoiceTranscriptRow>(
      `SELECT id, message_id, session_id, transcript_text,
              language_code, confidence, segments, provider_ref,
              created_at
       FROM voice_transcripts
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId],
    );

    return result.rows;
  }
}
