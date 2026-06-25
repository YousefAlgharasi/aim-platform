import { AdminDataService } from './admin-data.service';

function createDb(results: Array<{ rows: Record<string, unknown>[] }>) {
  const queue = [...results];
  return {
    query: jest.fn().mockImplementation(() => {
      const result = queue.shift() ?? { rows: [] };
      return Promise.resolve({
        rowCount: result.rows.length,
        rows: result.rows,
      });
    }),
  };
}

describe('AdminDataService', () => {
  it('listAssessments returns paginated data with camelCase fields', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'a1',
            title: 'Quiz 1',
            type: 'quiz',
            status: 'published',
            question_count: 5,
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAssessments(1, 20);

    expect(result).toEqual({
      data: [
        {
          id: 'a1',
          title: 'Quiz 1',
          type: 'quiz',
          status: 'published',
          questionCount: 5,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(db.query).toHaveBeenCalledTimes(2);
  });

  it('listAssessments with type filter uses correct parameter indices', async () => {
    const db = createDb([
      { rows: [{ count: '0' }] },
      { rows: [] },
    ]);
    const service = new AdminDataService(db as never);
    await service.listAssessments(1, 20, 'quiz');

    expect(db.query.mock.calls[0][0]).toContain('$1');
    expect(db.query.mock.calls[0][1]).toEqual(['quiz']);
    expect(db.query.mock.calls[1][0]).toContain('LIMIT $2 OFFSET $3');
    expect(db.query.mock.calls[1][1]).toEqual(['quiz', 20, 0]);
  });

  it('listAuditLogs maps actor_id to userId and event_type to action', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'log-1',
            user_id: 'u1',
            action: 'grade_updated',
            entity_type: 'assessment',
            entity_id: 'a1',
            created_at: '2026-01-01',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAuditLogs(1, 20);

    expect(result.data[0]).toEqual({
      id: 'log-1',
      userId: 'u1',
      action: 'grade_updated',
      entityType: 'assessment',
      entityId: 'a1',
      createdAt: '2026-01-01',
    });
  });

  it('getAssessmentReport returns aggregate stats', async () => {
    const db = createDb([
      {
        rows: [{ total: '10', passed: '7', failed: '3', avg_score: '72.5' }],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.getAssessmentReport();

    expect(result).toEqual({
      totalAttempts: 10,
      passed: 7,
      failed: 3,
      avgScore: 72.5,
      period: 'all-time',
    });
  });

  it('clamps page and limit to safe values', async () => {
    const db = createDb([
      { rows: [{ count: '0' }] },
      { rows: [] },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAssessments(-1, 500);

    expect(result.page).toBe(1);
    expect(result.limit).toBe(100);
  });

  it('listAssessmentResults with filters uses separate param arrays for count and data', async () => {
    const db = createDb([
      { rows: [{ count: '0' }] },
      { rows: [] },
    ]);
    const service = new AdminDataService(db as never);
    await service.listAssessmentResults(1, 20, { studentId: 's1' });

    expect(db.query.mock.calls[0][1]).toEqual(['s1']);
    expect(db.query.mock.calls[1][1]).toEqual(['s1', 20, 0]);
    expect(db.query.mock.calls[1][0]).toContain('LIMIT $2 OFFSET $3');
  });

  it('listDeadlines returns correct camelCase mapping', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'd1',
            assessment_id: 'a1',
            due_at: '2026-06-01',
            course_id: null,
            chapter_id: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listDeadlines(1, 20);

    expect(result.data[0]).toEqual({
      id: 'd1',
      assessmentId: 'a1',
      dueAt: '2026-06-01',
      courseId: null,
      chapterId: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });
});
