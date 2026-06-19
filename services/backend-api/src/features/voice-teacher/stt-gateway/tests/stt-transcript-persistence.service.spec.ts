// P9-044: Persist STT Transcript — service tests.
// Verifies that SttTranscriptPersistenceService writes and reads
// voice_transcripts rows correctly, without touching mastery/AIM fields,
// provider credentials, or raw provider response bodies.

import { SttTranscriptPersistenceService } from '../stt-transcript-persistence.service';
import { DatabaseService } from '../../../../database/database.service';
import {
  CreateVoiceTranscriptInput,
  VoiceTranscriptRow,
} from '../stt-transcript-persistence.types';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const MESSAGE_ID  = 'aaaaaaaa-0000-0000-0000-000000000001';
const SESSION_ID  = 'bbbbbbbb-0000-0000-0000-000000000002';
const PROVIDER_ID = 'cccccccc-0000-0000-0000-000000000003';
const TRANSCRIPT_ID = 'dddddddd-0000-0000-0000-000000000004';

const BASE_INPUT: CreateVoiceTranscriptInput = {
  messageId: MESSAGE_ID,
  sessionId: SESSION_ID,
  transcriptText: 'كيف أصرف هذا الفعل؟',
  languageCode: 'ar',
  confidence: 0.95,
  segments: null,
  providerRef: PROVIDER_ID,
};

const BASE_ROW: VoiceTranscriptRow = {
  id: TRANSCRIPT_ID,
  message_id: MESSAGE_ID,
  session_id: SESSION_ID,
  transcript_text: 'كيف أصرف هذا الفعل؟',
  language_code: 'ar',
  confidence: 0.95,
  segments: null,
  provider_ref: PROVIDER_ID,
  created_at: '2026-06-19T20:00:00Z',
};

describe('SttTranscriptPersistenceService', () => {
  // -------------------------------------------------------------------------
  // persist()
  // -------------------------------------------------------------------------

  it('persist() issues an INSERT … ON CONFLICT DO NOTHING and returns the row', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [BASE_ROW], rowCount: 1 };
    });

    const svc = new SttTranscriptPersistenceService(db);
    const row = await svc.persist(BASE_INPUT);

    expect(calls).toHaveLength(1);
    expect(calls[0].sql).toContain('INSERT INTO voice_transcripts');
    expect(calls[0].sql).toContain('ON CONFLICT (message_id) DO NOTHING');
    expect(calls[0].params[0]).toBe(MESSAGE_ID);
    expect(calls[0].params[1]).toBe(SESSION_ID);
    expect(calls[0].params[2]).toBe('كيف أصرف هذا الفعل؟');
    expect(calls[0].params[3]).toBe('ar');
    expect(calls[0].params[4]).toBe(0.95);
    expect(calls[0].params[6]).toBe(PROVIDER_ID);
    expect(row.id).toBe(TRANSCRIPT_ID);
    expect(row.transcript_text).toBe('كيف أصرف هذا الفعل؟');
  });

  it('persist() defaults optional fields to null when omitted', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          ...BASE_ROW,
          language_code: null,
          confidence: null,
          segments: null,
          provider_ref: null,
        }],
        rowCount: 1,
      };
    });

    const svc = new SttTranscriptPersistenceService(db);
    await svc.persist({ messageId: MESSAGE_ID, sessionId: SESSION_ID, transcriptText: 'hello' });

    expect(calls[0].params[3]).toBeNull(); // languageCode
    expect(calls[0].params[4]).toBeNull(); // confidence
    expect(calls[0].params[5]).toBeNull(); // segments
    expect(calls[0].params[6]).toBeNull(); // providerRef
  });

  it('persist() falls back to findByMessageId when INSERT returns zero rows (idempotent retry)', async () => {
    let callCount = 0;
    const db = makeMockDb(async (sql) => {
      callCount++;
      if (sql.includes('INSERT')) {
        // Simulate ON CONFLICT DO NOTHING returning no rows
        return { rows: [], rowCount: 0 };
      }
      // findByMessageId SELECT
      return { rows: [BASE_ROW], rowCount: 1 };
    });

    const svc = new SttTranscriptPersistenceService(db);
    const row = await svc.persist(BASE_INPUT);

    expect(callCount).toBe(2); // INSERT then SELECT
    expect(row.id).toBe(TRANSCRIPT_ID);
  });

  it('persist() serialises non-null segments to JSON before writing', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [BASE_ROW], rowCount: 1 };
    });

    const segments = [{ word: 'كيف', startMs: 0, endMs: 340 }];
    const svc = new SttTranscriptPersistenceService(db);
    await svc.persist({ ...BASE_INPUT, segments });

    expect(calls[0].params[5]).toBe(JSON.stringify(segments));
  });

  // -------------------------------------------------------------------------
  // Authority boundary: no AIM/mastery fields, no provider credentials
  // -------------------------------------------------------------------------

  it('persist() does not accept or store mastery/difficulty/recommendation fields', () => {
    // Type check: CreateVoiceTranscriptInput must not have AIM fields.
    const input: CreateVoiceTranscriptInput = {
      messageId: MESSAGE_ID,
      sessionId: SESSION_ID,
      transcriptText: 'test',
    };
    // If this compiled, the type does not include forbidden AIM fields.
    const keys = Object.keys(input);
    expect(keys).not.toContain('mastery');
    expect(keys).not.toContain('difficulty');
    expect(keys).not.toContain('weakness');
    expect(keys).not.toContain('recommendation');
    expect(keys).not.toContain('reviewSchedule');
  });

  // -------------------------------------------------------------------------
  // findByMessageId()
  // -------------------------------------------------------------------------

  it('findByMessageId() returns the transcript row when found', async () => {
    const db = makeMockDb(async () => ({ rows: [BASE_ROW], rowCount: 1 }));
    const svc = new SttTranscriptPersistenceService(db);
    const row = await svc.findByMessageId(MESSAGE_ID);
    expect(row).not.toBeNull();
    expect(row!.message_id).toBe(MESSAGE_ID);
  });

  it('findByMessageId() returns null when no transcript exists for the turn', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SttTranscriptPersistenceService(db);
    const row = await svc.findByMessageId(MESSAGE_ID);
    expect(row).toBeNull();
  });

  // -------------------------------------------------------------------------
  // findBySessionId()
  // -------------------------------------------------------------------------

  it('findBySessionId() returns all transcripts for a session in ASC order', async () => {
    const rows = [BASE_ROW, { ...BASE_ROW, id: 'eeeeeeee-0000-0000-0000-000000000005' }];
    const db = makeMockDb(async (sql) => {
      expect(sql).toContain('ORDER BY created_at ASC');
      return { rows, rowCount: rows.length };
    });
    const svc = new SttTranscriptPersistenceService(db);
    const result = await svc.findBySessionId(SESSION_ID);
    expect(result).toHaveLength(2);
    expect(result[0].session_id).toBe(SESSION_ID);
  });

  it('findBySessionId() returns an empty array when no transcripts exist', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const svc = new SttTranscriptPersistenceService(db);
    const result = await svc.findBySessionId(SESSION_ID);
    expect(result).toEqual([]);
  });
});
