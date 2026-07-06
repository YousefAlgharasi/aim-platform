// P8-032: Add Placement Result Context
// Minimal coverage for PlacementResultReadService.getLatestResultForStudent,
// added to support the AI Teacher placement result context adapter.

import { PlacementResultReadService } from '../placement-result-read.service';
import { DatabaseService } from '../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const ATTEMPT_ID = '880e8400-e29b-41d4-a716-446655440003';

describe('PlacementResultReadService.getLatestResultForStudent', () => {
  it('returns null when the student has no completed placement attempt', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const service = new PlacementResultReadService(db);
    const result = await service.getLatestResultForStudent(STUDENT_ID);
    expect(result).toBeNull();
  });

  it('resolves the latest completed attempt id and delegates to getResult', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      if (sql.includes('FROM placement_attempts') && sql.includes('ORDER BY completed_at DESC')) {
        return { rows: [{ id: ATTEMPT_ID }], rowCount: 1 };
      }
      if (sql.includes('FROM placement_attempts') && sql.includes('WHERE id = $1 AND student_id = $2')) {
        return {
          rows: [
            { id: ATTEMPT_ID, student_id: STUDENT_ID, status: 'completed', completed_at: '2026-06-01T00:00:00Z' },
          ],
          rowCount: 1,
        };
      }
      if (sql.includes('FROM placement_results')) {
        return {
          rows: [
            {
              id: 'result-1',
              placement_attempt_id: ATTEMPT_ID,
              estimated_level: 'B1',
              skill_mastery_map: { grammar: { total_questions: 10, correct_answers: 8, mastery_score: 0.8 } },
              weakness_map: { weaknesses: [] },
              initial_path_id: 'path-1',
              created_at: '2026-06-01T00:00:00Z',
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const service = new PlacementResultReadService(db);
    const result = await service.getLatestResultForStudent(STUDENT_ID);

    expect(calls[0].params).toEqual([STUDENT_ID]);
    expect(result).not.toBeNull();
    expect(result?.estimated_level).toBe('B1');
    expect(result?.skill_mastery_map).toEqual({
      grammar: { total_questions: 10, correct_answers: 8, mastery_score: 0.8, signal: 'strong' },
    });
  });
});

describe('PlacementResultReadService.getLatestAttemptStatus', () => {
  it('returns status "none" when the student has never started an attempt', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const service = new PlacementResultReadService(db);
    const status = await service.getLatestAttemptStatus(STUDENT_ID);
    expect(status).toEqual({ status: 'none', attemptId: null, result: null });
  });

  it('returns status "active" (never "completed") without fetching a result when the latest attempt is still in progress', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('ORDER BY started_at DESC')) {
        return { rows: [{ id: ATTEMPT_ID, status: 'active' }], rowCount: 1 };
      }
      throw new Error(`Unexpected query in in-progress case: ${sql}`);
    });
    const service = new PlacementResultReadService(db);
    const status = await service.getLatestAttemptStatus(STUDENT_ID);
    expect(status).toEqual({ status: 'active', attemptId: ATTEMPT_ID, result: null });
  });

  it('returns status "submitted" while the backend is still scoring', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('ORDER BY started_at DESC')) {
        return { rows: [{ id: ATTEMPT_ID, status: 'submitted' }], rowCount: 1 };
      }
      throw new Error(`Unexpected query in submitted case: ${sql}`);
    });
    const service = new PlacementResultReadService(db);
    const status = await service.getLatestAttemptStatus(STUDENT_ID);
    expect(status).toEqual({ status: 'submitted', attemptId: ATTEMPT_ID, result: null });
  });

  it('returns status "completed" with the full result when the latest attempt is done', async () => {
    const db = makeMockDb(async (sql, params) => {
      if (sql.includes('ORDER BY started_at DESC')) {
        return { rows: [{ id: ATTEMPT_ID, status: 'completed' }], rowCount: 1 };
      }
      if (sql.includes('FROM placement_attempts') && sql.includes('WHERE id = $1 AND student_id = $2')) {
        return {
          rows: [
            { id: ATTEMPT_ID, student_id: STUDENT_ID, status: 'completed', completed_at: '2026-06-01T00:00:00Z' },
          ],
          rowCount: 1,
        };
      }
      if (sql.includes('FROM placement_results')) {
        return {
          rows: [
            {
              id: 'result-1',
              placement_attempt_id: ATTEMPT_ID,
              estimated_level: 'B1',
              skill_mastery_map: { grammar: { total_questions: 10, correct_answers: 8, mastery_score: 0.8 } },
              weakness_map: { weaknesses: [] },
              initial_path_id: 'path-1',
              created_at: '2026-06-01T00:00:00Z',
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    });
    const service = new PlacementResultReadService(db);
    const status = await service.getLatestAttemptStatus(STUDENT_ID);

    expect(status.status).toBe('completed');
    expect(status.attemptId).toBe(ATTEMPT_ID);
    expect(status.result?.estimated_level).toBe('B1');
  });
});
