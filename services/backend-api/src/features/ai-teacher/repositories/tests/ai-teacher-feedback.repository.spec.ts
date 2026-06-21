// P8-027: Add AI Chat Repository Tests
// AiTeacherFeedbackRepository tests.

import { AiTeacherFeedbackRepository } from '../ai-teacher-feedback.repository';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const MESSAGE_ID = '990e8400-e29b-41d4-a716-446655440004';
const FEEDBACK_ID = 'dd0e8400-e29b-41d4-a716-446655440008';

describe('AiTeacherFeedbackRepository', () => {
  it('create() inserts message_id, student_id, rating and returns the row', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [{
          id: FEEDBACK_ID,
          message_id: MESSAGE_ID,
          student_id: STUDENT_ID,
          rating: 'helpful',
          created_at: '2026-06-18T00:00:00Z',
        }],
        rowCount: 1,
      };
    });
    const repo = new AiTeacherFeedbackRepository(db);
    const row = await repo.create(MESSAGE_ID, STUDENT_ID, 'helpful');

    expect(calls[0].sql).toContain('INSERT INTO ai_teacher_feedback');
    expect(calls[0].params).toEqual([MESSAGE_ID, STUDENT_ID, 'helpful']);
    expect(row.rating).toBe('helpful');
  });

  it('create() also accepts not_helpful ratings', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [{ id: FEEDBACK_ID, rating: 'not_helpful' }], rowCount: 1 };
    });
    const repo = new AiTeacherFeedbackRepository(db);
    await repo.create(MESSAGE_ID, STUDENT_ID, 'not_helpful');
    expect(calls[0].params[2]).toBe('not_helpful');
  });

  it('findByMessageId() returns null when no feedback exists for the message', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const repo = new AiTeacherFeedbackRepository(db);
    const row = await repo.findByMessageId(MESSAGE_ID);
    expect(row).toBeNull();
  });

  it('findByMessageId() scopes the query by message_id', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return { rows: [], rowCount: 0 };
    });
    const repo = new AiTeacherFeedbackRepository(db);
    await repo.findByMessageId(MESSAGE_ID);
    expect(calls[0].sql).toContain('WHERE message_id = $1');
    expect(calls[0].params).toEqual([MESSAGE_ID]);
  });
});
