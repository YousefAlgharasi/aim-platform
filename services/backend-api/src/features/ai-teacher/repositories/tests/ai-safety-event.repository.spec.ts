// P8-027: Add AI Chat Repository Tests
// AiSafetyEventRepository tests.

import { AiSafetyEventRepository } from '../ai-safety-event.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const EVENT_ID = 'cc0e8400-e29b-41d4-a716-446655440007';

describe('AiSafetyEventRepository', () => {
  it('create() inserts an allowed decision with reason_category null', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: EVENT_ID,
          session_id: SESSION_ID,
          direction: 'input',
          decision: 'allowed',
          reason_category: null,
          created_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiSafetyEventRepository(db);
    const row = await repo.create({ sessionId: SESSION_ID, direction: 'input', decision: 'allowed' });

    expect(calls[0].sql).toContain('INSERT INTO ai_safety_events');
    expect(calls[0].params).toEqual([SESSION_ID, 'input', 'allowed', null]);
    expect(row.decision).toBe('allowed');
  });

  it('create() inserts a rejected decision with a reason_category', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [{ id: EVENT_ID }], rowCount: 1 };
    });
    const repo = new AiSafetyEventRepository(db);
    await repo.create({
      sessionId: SESSION_ID,
      direction: 'output',
      decision: 'rejected',
      reasonCategory: 'unsafe_content',
    });
    expect(calls[0].params).toEqual([SESSION_ID, 'output', 'rejected', 'unsafe_content']);
  });

  it('findBySessionId() orders by created_at descending and scopes by session_id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiSafetyEventRepository(db);
    await repo.findBySessionId(SESSION_ID);
    expect(calls[0].sql).toContain('ORDER BY created_at DESC');
    expect(calls[0].params).toEqual([SESSION_ID]);
  });
});
