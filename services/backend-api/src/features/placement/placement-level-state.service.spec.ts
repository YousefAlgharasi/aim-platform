// P20-006: PlacementLevelStateService — seeds student_level_state from a
// completed placement result.

import { PlacementLevelStateService } from './placement-level-state.service';
import { DatabaseService } from '../../database/database.service';

function makeMockDb(
  handler: (sql: string, params: readonly unknown[]) => Promise<{ rows: any[]; rowCount: number }>,
) {
  return { query: handler } as unknown as DatabaseService;
}

const STUDENT_ID = 'student-1';

describe('PlacementLevelStateService.upsertFromPlacement', () => {
  it('upserts current_cefr_rank and max_unlocked_cefr_rank equal, seeded from the matched course', async () => {
    const calls: { sql: string; params: readonly unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      if (sql.includes('FROM courses')) {
        return { rows: [{ cefr_rank: 2, track_slug: 'english' }], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO student_level_state')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const service = new PlacementLevelStateService(db);
    await service.upsertFromPlacement(STUDENT_ID, 'intermediate');

    const insertCall = calls.find((c) => c.sql.includes('INSERT INTO student_level_state'));
    expect(insertCall).toBeDefined();
    // studentId, trackSlug, cefrRank (used for both current and max via $3)
    expect(insertCall?.params).toEqual([STUDENT_ID, 'english', 2]);
  });

  it('does not overwrite max_unlocked_cefr_rank on conflict (retake safety)', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM courses')) return { rows: [{ cefr_rank: 1, track_slug: 'english' }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    });

    let insertSql = '';
    const dbSpy = makeMockDb(async (sql, params) => {
      if (sql.includes('FROM courses')) return { rows: [{ cefr_rank: 1, track_slug: 'english' }], rowCount: 1 };
      if (sql.includes('INSERT INTO student_level_state')) {
        insertSql = sql;
        return { rows: [], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    });

    const service = new PlacementLevelStateService(dbSpy);
    await service.upsertFromPlacement(STUDENT_ID, 'beginner');

    expect(insertSql).not.toContain('max_unlocked_cefr_rank = EXCLUDED.max_unlocked_cefr_rank');
    expect(insertSql).toContain('current_cefr_rank = EXCLUDED.current_cefr_rank');
  });

  it('skips the upsert (no throw) when estimatedLevel does not map to a known CEFR code', async () => {
    const db = makeMockDb(async () => ({ rows: [], rowCount: 0 }));
    const service = new PlacementLevelStateService(db);
    await expect(service.upsertFromPlacement(STUDENT_ID, 'not_a_real_level')).resolves.toBeUndefined();
  });

  it('skips the upsert (no throw) when no course exists yet for the mapped CEFR code', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM courses')) return { rows: [], rowCount: 0 };
      return { rows: [], rowCount: 0 };
    });
    const service = new PlacementLevelStateService(db);
    // upper_intermediate/advanced map to 'B1', which has no course yet.
    await expect(service.upsertFromPlacement(STUDENT_ID, 'advanced')).resolves.toBeUndefined();
  });
});
