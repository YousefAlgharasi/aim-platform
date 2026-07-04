// P20-023 — StudentAimProgressReportService tests.
//
// Covers:
//   - Builds a Skill Mastery table section from student_skill_states rows
//   - Builds a Weaknesses table section including open + recently-resolved
//     rows, excluding weaknesses resolved outside the 14-day window
//   - Builds an Upcoming Reviews table section from review_schedules rows
//   - Omits a section entirely when its underlying query returns no rows
//   - Every query is scoped by student_id = studentId

import { StudentAimProgressReportService } from './student-aim-progress-report.service';

function makeMockDb(
  handler: (sql: string, params: unknown[]) => Promise<{ rows: unknown[] }>,
) {
  return { query: handler } as unknown as import('../../database/database.service').DatabaseService;
}

const STUDENT_ID = '770e8400-e29b-41d4-a716-446655440002';

describe('StudentAimProgressReportService.buildSections', () => {
  it('builds a Skill Mastery section from student_skill_states', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM student_skill_states')) {
        return {
          rows: [
            {
              skill_id: 'skill:english:a1:vocab.daily-routines',
              mastery_score: '0.72',
              mastery_trend: 'improving',
              previous_mastery_score: '0.60',
              last_evaluated_at: '2026-06-17T10:00:00Z',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new StudentAimProgressReportService(db);

    const sections = await svc.buildSections(STUDENT_ID);

    const skillSection = sections.find((s) => s.title === 'Skill Mastery');
    expect(skillSection).toBeDefined();
    expect(skillSection?.type).toBe('table');
    expect(skillSection?.data).toEqual([
      {
        skillId: 'skill:english:a1:vocab.daily-routines',
        masteryScore: 0.72,
        masteryTrend: 'improving',
        previousMasteryScore: 0.6,
        lastEvaluatedAt: '2026-06-17T10:00:00Z',
      },
    ]);
  });

  it('includes open and recently-resolved weaknesses via the resolved_at window in the SQL', async () => {
    const calls: { sql: string; params: unknown[] }[] = [];
    const db = makeMockDb(async (sql, params) => {
      calls.push({ sql, params });
      if (sql.includes('FROM weakness_records')) {
        return {
          rows: [
            {
              skill_id: 'skill:a',
              severity: 'developing',
              status: 'open',
              detected_at: '2026-06-10T00:00:00Z',
              resolved_at: null,
            },
            {
              skill_id: 'skill:b',
              severity: 'emerging',
              status: 'resolved',
              detected_at: '2026-06-01T00:00:00Z',
              resolved_at: '2026-06-20T00:00:00Z',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new StudentAimProgressReportService(db);

    const sections = await svc.buildSections(STUDENT_ID);

    const weaknessCall = calls.find((c) => c.sql.includes('FROM weakness_records'));
    expect(weaknessCall?.sql).toContain("status <> 'resolved'");
    expect(weaknessCall?.sql).toContain('make_interval');
    expect(weaknessCall?.params).toEqual([STUDENT_ID, 14]);

    const weaknessSection = sections.find((s) => s.title === 'Weaknesses');
    expect(weaknessSection?.data).toEqual([
      {
        skillId: 'skill:a',
        severity: 'developing',
        status: 'open',
        detectedAt: '2026-06-10T00:00:00Z',
        resolvedAt: null,
      },
      {
        skillId: 'skill:b',
        severity: 'emerging',
        status: 'resolved',
        detectedAt: '2026-06-01T00:00:00Z',
        resolvedAt: '2026-06-20T00:00:00Z',
      },
    ]);
  });

  it('builds an Upcoming Reviews section from review_schedules', async () => {
    const db = makeMockDb(async (sql) => {
      if (sql.includes('FROM review_schedules')) {
        return {
          rows: [
            {
              skill_id: 'skill:a',
              due_at: '2026-06-24T10:00:00Z',
              status: 'pending',
              repetition_count: 1,
            },
          ],
        };
      }
      return { rows: [] };
    });
    const svc = new StudentAimProgressReportService(db);

    const sections = await svc.buildSections(STUDENT_ID);

    const reviewSection = sections.find((s) => s.title === 'Upcoming Reviews');
    expect(reviewSection).toBeDefined();
    expect(reviewSection?.type).toBe('table');
    expect(reviewSection?.data).toEqual([
      {
        skillId: 'skill:a',
        dueAt: '2026-06-24T10:00:00Z',
        status: 'pending',
        repetitionCount: 1,
      },
    ]);
  });

  it('omits a section entirely when its query returns no rows', async () => {
    const db = makeMockDb(async () => ({ rows: [] }));
    const svc = new StudentAimProgressReportService(db);

    const sections = await svc.buildSections(STUDENT_ID);

    expect(sections).toEqual([]);
  });

  it('scopes every query by student_id = studentId', async () => {
    const calls: unknown[][] = [];
    const db = makeMockDb(async (_sql, params) => {
      calls.push(params);
      return { rows: [] };
    });
    const svc = new StudentAimProgressReportService(db);

    await svc.buildSections(STUDENT_ID);

    expect(calls).toHaveLength(3);
    for (const params of calls) {
      expect(params[0]).toBe(STUDENT_ID);
    }
  });
});
