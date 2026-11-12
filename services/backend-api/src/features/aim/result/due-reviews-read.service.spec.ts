import { DueReviewsReadService, WEAK_MASTERY_THRESHOLD } from './due-reviews-read.service';

type Row = Record<string, unknown>;

function makeDb(rows: Row[]) {
  const calls: { sql: string; params: unknown[] }[] = [];
  const db = {
    query: jest.fn(async (sql: string, params: unknown[]) => {
      calls.push({ sql, params });
      return { rows, rowCount: rows.length };
    }),
  };
  return { db: db as unknown as import('../../../database/database.service').DatabaseService, calls };
}

const STUDENT = '770e8400-e29b-41d4-a716-446655440002';

describe('DueReviewsReadService', () => {
  it('asks only for this student and uses the weak-mastery threshold', async () => {
    const { db, calls } = makeDb([]);
    await new DueReviewsReadService(db).getDueReviewsForStudent(STUDENT);

    expect(calls).toHaveLength(1);
    expect(calls[0].params).toEqual([STUDENT, WEAK_MASTERY_THRESHOLD]);
  });

  it('the query keeps only due, still-open reviews of weak skills', async () => {
    const { db, calls } = makeDb([]);
    await new DueReviewsReadService(db).getDueReviewsForStudent(STUDENT);
    const sql = calls[0].sql;

    expect(sql).toContain("rs.status NOT IN ('completed', 'cancelled', 'skipped')");
    expect(sql).toContain('rs.due_at <= now()');
    // weak = open/improving weakness record OR low mastery
    expect(sql).toContain("wr.status IN ('open', 'improving')");
    expect(sql).toContain('w.skill_id IS NOT NULL');
    expect(sql).toContain('ss.mastery_score < $2');
    // one review per skill
    expect(sql).toContain('DISTINCT ON (rs.skill_id)');
  });

  it('maps rows: numbers parsed, title and lesson passed through, nulls kept', async () => {
    const { db } = makeDb([
      {
        id: 'r1',
        skill_id: 'en.a1.gra.possessive_adj',
        skill_title: 'Possessive Adjectives',
        due_at: '2026-11-01T09:00:00.000Z',
        severity: 'critical',
        mastery_score: '0.350',
        lesson_id: 'l1',
        lesson_title: 'My Family',
      },
      {
        id: 'r2',
        skill_id: 'unknown.skill',
        skill_title: null,
        due_at: '2026-11-02T09:00:00.000Z',
        severity: null,
        mastery_score: null,
        lesson_id: null,
        lesson_title: null,
      },
    ]);

    const res = await new DueReviewsReadService(db).getDueReviewsForStudent(STUDENT);

    expect(res.studentId).toBe(STUDENT);
    expect(res.dueReviews).toEqual([
      {
        scheduleId: 'r1',
        skillId: 'en.a1.gra.possessive_adj',
        skillTitle: 'Possessive Adjectives',
        dueAt: '2026-11-01T09:00:00.000Z',
        severity: 'critical',
        masteryScore: 0.35,
        lessonId: 'l1',
        lessonTitle: 'My Family',
      },
      {
        scheduleId: 'r2',
        skillId: 'unknown.skill',
        skillTitle: null,
        dueAt: '2026-11-02T09:00:00.000Z',
        severity: null,
        masteryScore: null,
        lessonId: null,
        lessonTitle: null,
      },
    ]);
  });

  it('no due weak reviews is an empty list, not an error', async () => {
    const { db } = makeDb([]);
    const res = await new DueReviewsReadService(db).getDueReviewsForStudent(STUDENT);
    expect(res.dueReviews).toEqual([]);
  });
});
