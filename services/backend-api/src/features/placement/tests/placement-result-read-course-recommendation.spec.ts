// P20-014: PlacementResultReadService course recommendation tests.
//
// Ties placement, gating (P20-001/002/010), and recommendation together:
// after placement, the student should be told "start here" while remaining
// free to pick anything at or below it.

import { PlacementResultReadService } from '../placement-result-read.service';
import { DatabaseService } from '../../../database/database.service';

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';
const ATTEMPT_ID = '880e8400-e29b-41d4-a716-446655440003';

interface QueryResult {
  rows: unknown[];
  rowCount: number;
}

function makeDb(handler: (sql: string, params: readonly unknown[]) => QueryResult | undefined) {
  const query = jest.fn(async (sql: string, params: readonly unknown[] = []) => {
    const custom = handler(sql, params);
    if (custom) return custom;

    if (sql.includes('FROM placement_attempts') && sql.includes('WHERE id = $1 AND student_id = $2')) {
      return {
        rows: [{ id: ATTEMPT_ID, student_id: STUDENT_ID, status: 'completed', completed_at: '2026-06-01T00:00:00Z' }],
        rowCount: 1,
      };
    }
    if (sql.includes('FROM placement_results')) {
      return {
        rows: [
          {
            id: 'result-1',
            placement_attempt_id: ATTEMPT_ID,
            estimated_level: 'beginner',
            skill_mastery_map: {},
            weakness_map: { weaknesses: [] },
            initial_path_id: null,
            created_at: '2026-06-01T00:00:00Z',
          },
        ],
        rowCount: 1,
      };
    }
    return { rows: [], rowCount: 0 };
  });
  return { query, db: { query } as unknown as DatabaseService };
}

describe('PlacementResultReadService — P20-014 course recommendation', () => {
  it('recommends the exact-rank published course when one exists (beginner -> A1)', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [{ track_slug: 'english', cefr_rank: 1 }], rowCount: 1 };
      }
      if (sql.includes("cefr_rank = $2 AND status = 'published'")) {
        return { rows: [{ id: 'course-a1', cefr_rank: 1 }], rowCount: 1 };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.recommended_course_id).toBe('course-a1');
    expect(result.note).toBeNull();
  });

  it('falls back to the closest lower published rank when the exact-rank course is archived', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [{ track_slug: 'english', cefr_rank: 3 }], rowCount: 1 };
      }
      if (sql.includes("cefr_rank = $2 AND status = 'published'")) {
        return { rows: [], rowCount: 0 }; // rank 3 exists but is archived
      }
      if (sql.includes('cefr_rank < $2')) {
        return { rows: [{ id: 'course-a2', cefr_rank: 2 }], rowCount: 1 };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.recommended_course_id).toBe('course-a2');
    expect(result.note).toContain('closest lower-level course');
  });

  it('falls back to the highest-ranked published course when no course exists at all for the mapped cefr_code (the real advanced/upper_intermediate -> B1 gap)', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM placement_results')) {
        return {
          rows: [
            {
              id: 'result-1',
              placement_attempt_id: ATTEMPT_ID,
              estimated_level: 'advanced',
              skill_mastery_map: {},
              weakness_map: { weaknesses: [] },
              initial_path_id: null,
              created_at: '2026-06-01T00:00:00Z',
            },
          ],
          rowCount: 1,
        };
      }
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [], rowCount: 0 }; // no course authored for 'B1' at all
      }
      if (sql.includes('FROM student_level_state WHERE student_id = $1 ORDER BY updated_at')) {
        return { rows: [{ track_slug: 'english' }], rowCount: 1 };
      }
      if (sql.includes("ORDER BY cefr_rank DESC LIMIT 1") && sql.includes('track_slug = $1')) {
        return { rows: [{ id: 'course-a3', cefr_rank: 3 }], rowCount: 1 };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.recommended_course_id).toBe('course-a3');
    expect(result.note).toContain('most advanced course currently available');
  });

  it('never recommends a course that does not exist: returns null with an explanatory note when no courses exist at all', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('FROM student_level_state WHERE student_id = $1 ORDER BY updated_at')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('ORDER BY cefr_rank DESC LIMIT 1') && !sql.includes('track_slug = $1')) {
        return { rows: [], rowCount: 0 };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.recommended_course_id).toBeNull();
    expect(result.note).toBe('No course is available for this level yet.');
  });

  it('returns null recommendation/note for an unmapped estimated_level, without querying courses', async () => {
    const { db, query } = makeDb((sql) => {
      if (sql.includes('FROM placement_results')) {
        return {
          rows: [
            {
              id: 'result-1',
              placement_attempt_id: ATTEMPT_ID,
              estimated_level: 'not_a_real_level',
              skill_mastery_map: {},
              weakness_map: { weaknesses: [] },
              initial_path_id: null,
              created_at: '2026-06-01T00:00:00Z',
            },
          ],
          rowCount: 1,
        };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.recommended_course_id).toBeNull();
    expect(result.note).toBeNull();
    expect(result.unlocked_course_ids).toEqual([]);
    expect(query.mock.calls.some(([sql]) => sql.includes('FROM courses'))).toBe(false);
  });

  it('lists every published course at or below the student max_unlocked_cefr_rank', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [{ track_slug: 'english', cefr_rank: 1 }], rowCount: 1 };
      }
      if (sql.includes("cefr_rank = $2 AND status = 'published'")) {
        return { rows: [{ id: 'course-a1', cefr_rank: 1 }], rowCount: 1 };
      }
      if (sql.includes('FROM student_level_state WHERE student_id = $1 AND track_slug = $2')) {
        return { rows: [{ max_unlocked_cefr_rank: 2 }], rowCount: 1 };
      }
      if (sql.includes('cefr_rank <= $2')) {
        return {
          rows: [
            { id: 'course-a1', cefr_rank: 1 },
            { id: 'course-a2', cefr_rank: 2 },
          ],
          rowCount: 2,
        };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.unlocked_course_ids).toEqual(['course-a1', 'course-a2']);
  });

  it('defaults to only rank-1 unlocked when the student has no student_level_state row yet', async () => {
    const { db } = makeDb((sql) => {
      if (sql.includes('FROM courses WHERE cefr_code')) {
        return { rows: [{ track_slug: 'english', cefr_rank: 1 }], rowCount: 1 };
      }
      if (sql.includes("cefr_rank = $2 AND status = 'published'")) {
        return { rows: [{ id: 'course-a1', cefr_rank: 1 }], rowCount: 1 };
      }
      if (sql.includes('FROM student_level_state WHERE student_id = $1 AND track_slug = $2')) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('cefr_rank <= $2')) {
        return { rows: [{ id: 'course-a1', cefr_rank: 1 }], rowCount: 1 };
      }
      return undefined;
    });
    const service = new PlacementResultReadService(db);

    const result = await service.getResult(ATTEMPT_ID, STUDENT_ID);

    expect(result.unlocked_course_ids).toEqual(['course-a1']);
  });
});
