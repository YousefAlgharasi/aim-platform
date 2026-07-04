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

  it('findActiveByStudentIdWithContextTitle() joins lessons for lesson: context refs', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiChatSessionRepository(db);
    await repo.findActiveByStudentIdWithContextTitle(STUDENT_ID);
    expect(calls[0].sql).toContain('LEFT JOIN lessons');
    expect(calls[0].sql).toContain("status = 'active'");
    expect(calls[0].params).toEqual([STUDENT_ID]);
  });

  describe('getOrCreateForContext()', () => {
    it('returns the existing active session and created: false when one exists', async () => {
      const calls: { sql: string; params: readonly unknown[] }[] = [];
      const existingRow = {
        id: SESSION_ID,
        student_id: STUDENT_ID,
        context_ref: 'lesson:p1:l3',
        status: 'active',
        created_at: '2026-06-18T00:00:00Z',
        updated_at: '2026-06-18T00:00:00Z',
      };
      const db = makeMockDb(async (sql, params) => {
        calls.push({ sql, params });
        return { rows: [existingRow], rowCount: 1 };
      });
      const repo = new AiChatSessionRepository(db);

      const result = await repo.getOrCreateForContext(STUDENT_ID, 'lesson:p1:l3');

      expect(calls).toHaveLength(1);
      expect(calls[0].sql).toContain('SELECT');
      expect(calls[0].sql).toContain("status = 'active'");
      expect(calls[0].params).toEqual([STUDENT_ID, 'lesson:p1:l3']);
      expect(result).toEqual({ session: existingRow, created: false });
    });

    it('creates a new session and returns created: true when none exists', async () => {
      const calls: { sql: string; params: readonly unknown[] }[] = [];
      const newRow = {
        id: SESSION_ID,
        student_id: STUDENT_ID,
        context_ref: 'lesson:p1:l3',
        status: 'active',
        created_at: '2026-06-18T00:00:00Z',
        updated_at: '2026-06-18T00:00:00Z',
      };
      const db = makeMockDb(async (sql, params) => {
        calls.push({ sql, params });
        if (sql.includes('SELECT')) {
          return { rows: [], rowCount: 0 };
        }
        return { rows: [newRow], rowCount: 1 };
      });
      const repo = new AiChatSessionRepository(db);

      const result = await repo.getOrCreateForContext(STUDENT_ID, 'lesson:p1:l3');

      expect(calls).toHaveLength(2);
      expect(calls[1].sql).toContain('INSERT INTO ai_chat_sessions');
      expect(result).toEqual({ session: newRow, created: true });
    });

    it('resolves the same session id for the same (studentId, contextRef) on repeated calls', async () => {
      const existingRow = {
        id: SESSION_ID,
        student_id: STUDENT_ID,
        context_ref: 'lesson:p1:l3',
        status: 'active',
        created_at: '2026-06-18T00:00:00Z',
        updated_at: '2026-06-18T00:00:00Z',
      };
      const db = makeMockDb(async () => ({ rows: [existingRow], rowCount: 1 }));
      const repo = new AiChatSessionRepository(db);

      const first = await repo.getOrCreateForContext(STUDENT_ID, 'lesson:p1:l3');
      const second = await repo.getOrCreateForContext(STUDENT_ID, 'lesson:p1:l3');

      expect(first.session.id).toBe(second.session.id);
    });

    it('never collides two different contextRef values for the same student', async () => {
      let insertCount = 0;
      const db2 = makeMockDb(async (sql, params) => {
        if (sql.includes('SELECT')) return { rows: [], rowCount: 0 };
        insertCount += 1;
        return {
          rows: [{
            id: `session-${insertCount}`,
            student_id: params[0],
            context_ref: params[1],
            status: 'active',
            created_at: '2026-06-18T00:00:00Z',
            updated_at: '2026-06-18T00:00:00Z',
          }],
          rowCount: 1,
        };
      });
      const repo2 = new AiChatSessionRepository(db2);

      const a = await repo2.getOrCreateForContext(STUDENT_ID, 'lesson:a');
      const b = await repo2.getOrCreateForContext(STUDENT_ID, 'lesson:b');

      expect(a.session.id).not.toBe(b.session.id);
      expect(a.session.context_ref).toBe('lesson:a');
      expect(b.session.context_ref).toBe('lesson:b');
    });
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
