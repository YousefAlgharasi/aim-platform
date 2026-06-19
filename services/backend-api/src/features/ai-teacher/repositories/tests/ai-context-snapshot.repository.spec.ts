// P8-027: Add AI Chat Repository Tests
// AiContextSnapshotRepository tests.

import { AiContextSnapshotRepository } from '../ai-context-snapshot.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const MESSAGE_ID = '990e8400-e29b-41d4-a716-446655440004';
const SNAPSHOT_ID = 'aa0e8400-e29b-41d4-a716-446655440005';

describe('AiContextSnapshotRepository', () => {
  it('create() serializes context_data as JSON and binds it as ::jsonb', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: SNAPSHOT_ID,
          session_id: SESSION_ID,
          message_id: MESSAGE_ID,
          student_id: STUDENT_ID,
          context_data: { currentLesson: { id: 'lesson:p1:l3' } },
          created_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiContextSnapshotRepository(db);
    const row = await repo.create(SESSION_ID, MESSAGE_ID, STUDENT_ID, {
      currentLesson: { id: 'lesson:p1:l3' },
    });

    expect(calls[0].sql).toContain('INSERT INTO ai_context_snapshots');
    expect(calls[0].sql).toContain('::jsonb');
    expect(calls[0].params[0]).toBe(SESSION_ID);
    expect(calls[0].params[1]).toBe(MESSAGE_ID);
    expect(calls[0].params[2]).toBe(STUDENT_ID);
    expect(JSON.parse(calls[0].params[3] as string)).toEqual({ currentLesson: { id: 'lesson:p1:l3' } });
    expect(row.id).toBe(SNAPSHOT_ID);
  });

  it('findByMessageId() returns null when no snapshot exists for the message', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const repo = new AiContextSnapshotRepository(db);
    const row = await repo.findByMessageId(MESSAGE_ID);
    expect(row).toBeNull();
  });

  it('findByMessageId() scopes the query by message_id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiContextSnapshotRepository(db);
    await repo.findByMessageId(MESSAGE_ID);
    expect(calls[0].sql).toContain('WHERE message_id = $1');
    expect(calls[0].params).toEqual([MESSAGE_ID]);
  });
});
