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
  it('create() inserts session_id, student_id, role, text and returns the row', async () => {
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
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.create(SESSION_ID, STUDENT_ID, 'student', 'How do I conjugate this verb?');

    expect(calls[0].sql).toContain('INSERT INTO ai_chat_messages');
    expect(calls[0].params).toEqual([SESSION_ID, STUDENT_ID, 'student', 'How do I conjugate this verb?']);
    expect(row.role).toBe('student');
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
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatMessageRepository(db);
    const row = await repo.create(SESSION_ID, STUDENT_ID, 'ai_teacher', 'Here is how it works...');
    expect(calls[0].params[2]).toBe('ai_teacher');
    expect(row.role).toBe('ai_teacher');
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
});
