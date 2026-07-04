// P8-027: Add AI Chat Repository Tests
// AiChatMessageRepository tests.

import { AiChatMessageRepository } from '../ai-chat-message.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const MESSAGE_ID = '990e8400-e29b-41d4-a716-446655440004';

describe('AiChatMessageRepository', () => {
  it('create() inserts session_id, student_id, role, text and defaults channel/is_greeting/audio and returns the row', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: MESSAGE_ID,
          session_id: SESSION_ID,
          student_id: STUDENT_ID,
          role: 'student',
          text: 'How do I conjugate this verb?',
          created_at: '2026-06-18T00:00:00Z',
          channel: 'text',
          audio_ref: null,
          audio_duration_ms: null,
          is_greeting: false,
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.create(SESSION_ID, STUDENT_ID, 'student', 'How do I conjugate this verb?');

    expect(calls[0].sql).toContain('INSERT INTO ai_chat_messages');
    expect(calls[0].params).toEqual([
      SESSION_ID,
      STUDENT_ID,
      'student',
      'How do I conjugate this verb?',
      'text',
      false,
      null,
      null,
    ]);
    expect(row.role).toBe('student');
    expect(row.channel).toBe('text');
    expect(row.is_greeting).toBe(false);
  });

  it('create() persists ai_teacher role replies as well', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: MESSAGE_ID,
          session_id: SESSION_ID,
          student_id: STUDENT_ID,
          role: 'ai_teacher',
          text: 'Here is how it works...',
          created_at: '2026-06-18T00:00:00Z',
          channel: 'text',
          audio_ref: null,
          audio_duration_ms: null,
          is_greeting: false,
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.create(SESSION_ID, STUDENT_ID, 'ai_teacher', 'Here is how it works...');
    expect(calls[0].params[2]).toBe('ai_teacher');
    expect(row.role).toBe('ai_teacher');
  });

  it('create() accepts channel/isGreeting/audioRef/audioDurationMs options', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: MESSAGE_ID,
          session_id: SESSION_ID,
          student_id: STUDENT_ID,
          role: 'ai_teacher',
          text: 'Welcome!',
          created_at: '2026-06-18T00:00:00Z',
          channel: 'text',
          audio_ref: 'audio-ref-1',
          audio_duration_ms: 1200,
          is_greeting: true,
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.create(SESSION_ID, STUDENT_ID, 'ai_teacher', 'Welcome!', {
      isGreeting: true,
      audioRef: 'audio-ref-1',
      audioDurationMs: 1200,
    });

    expect(calls[0].params).toEqual([
      SESSION_ID,
      STUDENT_ID,
      'ai_teacher',
      'Welcome!',
      'text',
      true,
      'audio-ref-1',
      1200,
    ]);
    expect(row.is_greeting).toBe(true);
    expect(row.audio_ref).toBe('audio-ref-1');
  });

  it('updateAudio() sets audio_ref and audio_duration_ms scoped by id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: MESSAGE_ID,
          session_id: SESSION_ID,
          student_id: STUDENT_ID,
          role: 'ai_teacher',
          text: 'Welcome!',
          created_at: '2026-06-18T00:00:00Z',
          channel: 'text',
          audio_ref: 'audio-ref-2',
          audio_duration_ms: 900,
          is_greeting: true,
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.updateAudio(MESSAGE_ID, 'audio-ref-2', 900);

    expect(calls[0].sql).toContain('UPDATE ai_chat_messages');
    expect(calls[0].params).toEqual([MESSAGE_ID, 'audio-ref-2', 900]);
    expect(row?.audio_ref).toBe('audio-ref-2');
  });

  // P21-021b: updateText() lets the voice turn path fill in a placeholder
  // student row's real transcript in place, instead of inserting a second
  // student row.
  it('updateText() sets text scoped by id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: MESSAGE_ID,
          session_id: SESSION_ID,
          student_id: STUDENT_ID,
          role: 'student',
          text: 'What is the past tense of go?',
          created_at: '2026-06-18T00:00:00Z',
          channel: 'voice',
          audio_ref: null,
          audio_duration_ms: null,
          is_greeting: false,
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.updateText(MESSAGE_ID, 'What is the past tense of go?');

    expect(calls[0].sql).toContain('UPDATE ai_chat_messages');
    expect(calls[0].params).toEqual([MESSAGE_ID, 'What is the past tense of go?']);
    expect(row?.text).toBe('What is the past tense of go?');
  });

  it('updateText() returns null when no row matches', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const repo = new AiChatMessageRepository(db);
    const row = await repo.updateText(MESSAGE_ID, 'text');
    expect(row).toBeNull();
  });

  it('findById() returns null when no row matches', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const repo = new AiChatMessageRepository(db);
    const row = await repo.findById(MESSAGE_ID);
    expect(row).toBeNull();
  });

  it('findBySessionId() orders by created_at ascending and scopes by session_id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiChatMessageRepository(db);
    await repo.findBySessionId(SESSION_ID);
    expect(calls[0].sql).toContain('ORDER BY created_at ASC');
    expect(calls[0].params).toEqual([SESSION_ID]);
  });

  // P21-021b: voice rate-limit helpers — VoiceRateLimitPolicyService counts
  // via these instead of the legacy VoiceMessageRepository.
  describe('voice rate limit helpers (P21-021b)', () => {
    it("countVoiceStudentTurnsBySession() scopes by session_id, role='student', channel='voice'", async () => {
      const calls: { sql: string; params: readonly unknown[] }[] = [];
      const db = makeMockDb(async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [{ count: '3' }], rowCount: 1 };
      });
      const repo = new AiChatMessageRepository(db);
      const count = await repo.countVoiceStudentTurnsBySession(SESSION_ID);

      expect(calls[0].sql).toContain("role = 'student'");
      expect(calls[0].sql).toContain("channel = 'voice'");
      expect(calls[0].params).toEqual([SESSION_ID]);
      expect(count).toBe(3);
    });

    it('countVoiceStudentTurnsSince() scopes by student_id, channel=voice, and the window start', async () => {
      const calls: { sql: string; params: readonly unknown[] }[] = [];
      const db = makeMockDb(async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [{ count: '5' }], rowCount: 1 };
      });
      const repo = new AiChatMessageRepository(db);
      const windowStart = new Date('2026-06-18T00:00:00Z');
      const count = await repo.countVoiceStudentTurnsSince(STUDENT_ID, windowStart);

      expect(calls[0].sql).toContain("channel = 'voice'");
      expect(calls[0].params).toEqual([STUDENT_ID, windowStart]);
      expect(count).toBe(5);
    });

    it('findLastVoiceStudentTurnCreatedAt() returns null when no voice student turn exists', async () => {
      const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
      const repo = new AiChatMessageRepository(db);
      const result = await repo.findLastVoiceStudentTurnCreatedAt(SESSION_ID);
      expect(result).toBeNull();
    });
  });
});
