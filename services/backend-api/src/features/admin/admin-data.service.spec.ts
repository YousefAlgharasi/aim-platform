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

  it('listAuditLogs maps user_id/action/category and resolves user name', async () => {
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
            category: 'assessment',
            display_name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAuditLogs(1, 20);

    expect(result.data[0]).toEqual({
      id: 'log-1',
      userId: 'u1',
      userName: 'Jane Doe',
      action: 'grade_updated',
      entityType: 'assessment',
      entityId: 'a1',
      category: 'assessment',
      createdAt: '2026-01-01',
    });
    expect(db.query.mock.calls[0][0]).toContain('UNION ALL');
    expect(db.query.mock.calls[1][0]).toContain('UNION ALL');
  });

  it('listAuditLogs unions across audit tables and applies filters per-branch', async () => {
    const db = createDb([
      { rows: [{ count: '0' }] },
      { rows: [] },
    ]);
    const service = new AdminDataService(db as never);
    await service.listAuditLogs(1, 20, { userId: 'u1', action: 'created', from: '2026-01-01', to: '2026-01-31' });

    const countSql = db.query.mock.calls[0][0] as string;
    expect(countSql).toContain('assessment_audit_logs');
    expect(countSql).toContain('curriculum_audit_logs');
    expect(countSql).toContain('placement_audit_log');
    expect(countSql).toContain('auth_audit_logs');
    expect(countSql).toContain('notification_audit_logs');
    expect(countSql).toContain('billing_audit_logs');
    expect(countSql).not.toContain('aim_audit_log');
    expect(countSql).not.toContain('operations_audit_logs');
    expect(db.query.mock.calls[0][1]).toEqual(['u1', 'created', '2026-01-01', '2026-01-31']);

    const dataSql = db.query.mock.calls[1][0] as string;
    expect(dataSql).toContain('LIMIT $5 OFFSET $6');
    expect(db.query.mock.calls[1][1]).toEqual(['u1', 'created', '2026-01-01', '2026-01-31', 20, 0]);
  });

  it('listAuditLogs falls back to email, then null, when no display name is set', async () => {
    const db = createDb([
      { rows: [{ count: '2' }] },
      {
        rows: [
          {
            id: 'log-1',
            user_id: 'u1',
            action: 'login',
            entity_type: null,
            entity_id: null,
            created_at: '2026-01-02',
            category: 'auth',
            display_name: null,
            email: 'jane@example.com',
          },
          {
            id: 'log-2',
            user_id: 'u2',
            action: 'login',
            entity_type: null,
            entity_id: null,
            created_at: '2026-01-01',
            category: 'auth',
            display_name: null,
            email: null,
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAuditLogs(1, 20);

    expect(result.data[0].userName).toBe('jane@example.com');
    expect(result.data[1].userName).toBeNull();
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

  it('listPlacementResults returns correct camelCase mapping and resolves student name', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'r1',
            student_id: 's1',
            estimated_level: 'B1',
            skill_mastery_map: { reading: 0.7 },
            weakness_map: { grammar: true },
            initial_path_id: 'p1',
            created_at: '2026-01-01',
            display_name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listPlacementResults(1, 20);

    expect(result).toEqual({
      data: [
        {
          id: 'r1',
          studentId: 's1',
          studentName: 'Jane Doe',
          estimatedLevel: 'B1',
          skillMasteryMap: { reading: 0.7 },
          skillSummary: [{ skillCode: 'reading', skillName: 'Reading', signal: 'developing' }],
          weaknessMap: { grammar: true },
          initialPathId: 'p1',
          createdAt: '2026-01-01',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it('listPlacementResults derives skill signal from mastery_score using strong/developing/emerging thresholds', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'r1',
            student_id: 's1',
            estimated_level: 'B1',
            skill_mastery_map: {
              reading: { mastery_score: 0.8 },
              grammar: { mastery_score: 0.5 },
              listening: { mastery_score: 0.1 },
            },
            weakness_map: {},
            initial_path_id: null,
            created_at: '2026-01-01',
            display_name: null,
            email: null,
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listPlacementResults(1, 20);

    expect(result.data[0].skillSummary).toEqual([
      { skillCode: 'reading', skillName: 'Reading', signal: 'strong' },
      { skillCode: 'grammar', skillName: 'Grammar', signal: 'developing' },
      { skillCode: 'listening', skillName: 'Listening', signal: 'emerging' },
    ]);
  });

  it('listPlacementResults falls back to email, then null, when no display name is set', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'r1',
            student_id: 's1',
            estimated_level: 'B1',
            skill_mastery_map: {},
            weakness_map: {},
            initial_path_id: null,
            created_at: '2026-01-01',
            display_name: null,
            email: 'jane@example.com',
          },
          {
            id: 'r2',
            student_id: 's2',
            estimated_level: 'A2',
            skill_mastery_map: {},
            weakness_map: {},
            initial_path_id: null,
            created_at: '2026-01-01',
            display_name: null,
            email: null,
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listPlacementResults(1, 20);

    expect(result.data[0].studentName).toBe('jane@example.com');
    expect(result.data[1].studentName).toBeNull();
  });

  it('listPlacementResults with level filter uses correct parameter indices', async () => {
    const db = createDb([
      { rows: [{ count: '0' }] },
      { rows: [] },
    ]);
    const service = new AdminDataService(db as never);
    await service.listPlacementResults(1, 20, 'B1');

    expect(db.query.mock.calls[0][0]).toContain('$1');
    expect(db.query.mock.calls[0][1]).toEqual(['B1']);
    expect(db.query.mock.calls[1][0]).toContain('LIMIT $2 OFFSET $3');
    expect(db.query.mock.calls[1][1]).toEqual(['B1', 20, 0]);
  });

  it('listDeadlines returns correct camelCase mapping for a global deadline (no student_id)', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'd1',
            assessment_id: 'a1',
            student_id: null,
            opens_at: '2026-05-01',
            due_at: '2026-06-01',
            extended_closes_at: null,
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
            display_name: null,
            email: null,
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listDeadlines(1, 20);

    expect(result.data[0]).toEqual({
      id: 'd1',
      assessmentId: 'a1',
      studentId: null,
      studentName: null,
      opensAt: '2026-05-01',
      dueAt: '2026-06-01',
      extendedClosesAt: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
    expect(db.query.mock.calls[1][0]).toContain('assessment_deadlines');
  });

  it('listDeadlines resolves student name for a per-student deadline extension', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'd2',
            assessment_id: 'a1',
            student_id: 's1',
            opens_at: '2026-05-01',
            due_at: '2026-06-01',
            extended_closes_at: '2026-06-10',
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
            display_name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listDeadlines(1, 20);

    expect(result.data[0].studentId).toBe('s1');
    expect(result.data[0].studentName).toBe('Jane Doe');
    expect(result.data[0].extendedClosesAt).toBe('2026-06-10');
  });

  it('getAssessmentDetail returns camelCase fields for a found assessment', async () => {
    const db = createDb([
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
    const result = await service.getAssessmentDetail('a1');

    expect(result).toEqual({
      id: 'a1',
      title: 'Quiz 1',
      type: 'quiz',
      status: 'published',
      courseId: null,
      chapterId: null,
      questionCount: 5,
      questionIds: [],
      settings: {
        timeLimitMinutes: null,
        passMark: null,
        shuffleQuestions: false,
      },
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });

  it('getAssessmentDetail returns ordered questionIds and resolved settings', async () => {
    const db = createDb([
      {
        rows: [
          {
            id: 'a1',
            title: 'Quiz 1',
            type: 'quiz',
            status: 'published',
            question_count: 2,
            created_at: '2026-01-01',
            updated_at: '2026-01-02',
          },
        ],
      },
      { rows: [{ question_id: 'q1' }, { question_id: 'q2' }] },
      { rows: [{ time_limit_seconds: 600, pass_threshold: '70.00', randomize_questions: true }] },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.getAssessmentDetail('a1');

    expect(result.questionIds).toEqual(['q1', 'q2']);
    expect(result.settings).toEqual({
      timeLimitMinutes: 10,
      passMark: 70,
      shuffleQuestions: true,
    });
  });

  it('getAssessmentDetail throws a NOT_FOUND AppError when no row matches', async () => {
    const db = createDb([{ rows: [] }]);
    const service = new AdminDataService(db as never);

    await expect(service.getAssessmentDetail('missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('listAssessmentResults coerces NUMERIC score/max_score strings to numbers and resolves names', async () => {
    const db = createDb([
      { rows: [{ count: '1' }] },
      {
        rows: [
          {
            id: 'res-1',
            student_id: 's1',
            assessment_id: 'a1',
            score: '8.00',
            max_score: '10.00',
            passed: true,
            attempted_at: '2026-01-01',
            completed_at: '2026-01-01',
            assessment_title: 'Quiz 1',
            display_name: 'Jane Doe',
            email: 'jane@example.com',
          },
        ],
      },
    ]);
    const service = new AdminDataService(db as never);
    const result = await service.listAssessmentResults(1, 20);

    expect(result.data[0]).toEqual({
      id: 'res-1',
      studentId: 's1',
      studentName: 'Jane Doe',
      assessmentId: 'a1',
      assessmentTitle: 'Quiz 1',
      score: 8,
      maxScore: 10,
      passed: true,
      attemptedAt: '2026-01-01',
      completedAt: '2026-01-01',
    });
    expect(typeof result.data[0].score).toBe('number');
    expect(typeof result.data[0].maxScore).toBe('number');
  });
});
