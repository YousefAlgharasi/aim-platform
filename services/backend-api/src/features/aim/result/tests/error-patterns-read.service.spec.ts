// P8-037: Add Recent Mistakes Context
// Minimal coverage for ErrorPatternsReadService.getActiveErrorPatternsForStudent,
// added to support the AI Teacher recent-mistakes context adapter.

import { ErrorPatternsReadService } from '../error-patterns-read.service';
import { DatabaseService } from '../../../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('ErrorPatternsReadService.getActiveErrorPatternsForStudent', () => {
  it('returns an empty array when the student has no active error patterns', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const service = new ErrorPatternsReadService(db);
    const result = await service.getActiveErrorPatternsForStudent(STUDENT_ID);
    expect(result).toEqual({ studentId: STUDENT_ID, errorPatterns: [] });
  });

  it('maps active error pattern rows to camelCase fields', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      return {
        rows: [
          {
            id: 'pattern-1',
            skill_id: 'skill-1',
            pattern_type: 'grammar_rule_misapplication',
            pattern_code: null,
            occurrence_count: 4,
            confidence: '0.750',
            last_seen_at: '2026-06-01T00:00:00Z',
          },
        ],
        rowCount: 1,
      };
    });
    const service = new ErrorPatternsReadService(db);
    const result = await service.getActiveErrorPatternsForStudent(STUDENT_ID);

    expect(calls[0].params).toEqual([STUDENT_ID]);
    expect(result.errorPatterns).toEqual([
      {
        patternId: 'pattern-1',
        skillId: 'skill-1',
        patternType: 'grammar_rule_misapplication',
        patternCode: null,
        occurrenceCount: 4,
        confidence: 0.75,
        lastSeenAt: '2026-06-01T00:00:00Z',
      },
    ]);
  });
});
