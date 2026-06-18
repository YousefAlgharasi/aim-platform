// P8-027: Add AI Chat Repository Tests
// AiProviderLogRepository tests.

import { AiProviderLogRepository } from '../ai-provider-log.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const SESSION_ID = '880e8400-e29b-41d4-a716-446655440003';
const LOG_ID = 'bb0e8400-e29b-41d4-a716-446655440006';

describe('AiProviderLogRepository', () => {
  it('create() inserts session_id, provider, model, status, error_category, latency_ms', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: LOG_ID,
          session_id: SESSION_ID,
          provider: 'openai',
          model: 'gpt-test',
          status: 'success',
          error_category: null,
          latency_ms: 420,
          created_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiProviderLogRepository(db);
    const row = await repo.create({
      sessionId: SESSION_ID,
      provider: 'openai',
      model: 'gpt-test',
      status: 'success',
      latencyMs: 420,
    });

    expect(calls[0].sql).toContain('INSERT INTO ai_provider_logs');
    expect(calls[0].params).toEqual([SESSION_ID, 'openai', 'gpt-test', 'success', null, 420]);
    expect(row.status).toBe('success');
  });

  it('create() defaults errorCategory and latencyMs to null when omitted', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [{ id: LOG_ID }], rowCount: 1 };
    });
    const repo = new AiProviderLogRepository(db);
    await repo.create({
      sessionId: SESSION_ID,
      provider: 'openai',
      model: 'gpt-test',
      status: 'timeout',
    });
    expect(calls[0].params).toEqual([SESSION_ID, 'openai', 'gpt-test', 'timeout', null, null]);
  });

  it('findBySessionId() orders by created_at descending and scopes by session_id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiProviderLogRepository(db);
    await repo.findBySessionId(SESSION_ID);
    expect(calls[0].sql).toContain('ORDER BY created_at DESC');
    expect(calls[0].params).toEqual([SESSION_ID]);
  });
});
