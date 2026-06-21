// P8-027: Add AI Chat Repository Tests
// AiChatSessionRepository tests.

import { AiChatSessionRepository } from '../ai-chat-session.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';

describe('AiChatSessionRepository', () => {
  it('create() inserts with student_id and context_ref and returns the row', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: SESSION_ID,
          student_id: STUDENT_ID,
          context_ref: 'lesson:p1:l3',
          status: 'active',
          created_at: '2026-06-18T00:00:00Z',
          updated_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatSessionRepository(db);
    const row = await repo.create(STUDENT_ID, 'lesson:p1:l3');

    expect(calls).toHaveLength(1);
    expect(calls[0].sql).toContain('INSERT INTO ai_chat_sessions');
    expect(calls[0].params).toEqual([STUDENT_ID, 'lesson:p1:l3']);
    expect(row.id).toBe(SESSION_ID);
    expect(row.status).toBe('active');
  });

  it('findById() returns null when no row matches', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const repo = new AiChatSessionRepository(db);
    const row = await repo.findById(SESSION_ID);
    expect(row).toBeNull();
  });

  it('findById() returns the row when found, scoped by id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: SESSION_ID,
          student_id: STUDENT_ID,
          context_ref: 'lesson:p1:l3',
          status: 'active',
          created_at: '2026-06-18T00:00:00Z',
          updated_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiChatSessionRepository(db);
    const row = await repo.findById(SESSION_ID);
    expect(calls[0].params).toEqual([SESSION_ID]);
    expect(row?.id).toBe(SESSION_ID);
  });

  it('findActiveByStudentId() filters by student_id and status = active', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiChatSessionRepository(db);
    await repo.findActiveByStudentId(STUDENT_ID);
    expect(calls[0].sql).toContain("status = 'active'");
    expect(calls[0].params).toEqual([STUDENT_ID]);
  });

  it('closeSession() updates status to closed scoped by id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiChatSessionRepository(db);
    await repo.closeSession(SESSION_ID);
    expect(calls[0].sql).toContain("SET status = 'closed'");
    expect(calls[0].params).toEqual([SESSION_ID]);
  });
});
