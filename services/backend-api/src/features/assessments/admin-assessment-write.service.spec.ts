import { NotFoundException } from '@nestjs/common';
import { AdminAssessmentWriteService } from './admin-assessment-write.service';

function createDb(handler: (sql: string, params: readonly unknown[]) => { rows: Record<string, unknown>[] } | undefined) {
  return {
    query: jest.fn().mockImplementation((sql: string, params: readonly unknown[] = []) => {
      const result = handler(sql, params) ?? { rows: [] };
      return Promise.resolve({ rowCount: result.rows.length, rows: result.rows });
    }),
  };
}

const DETAIL_ROW = {
  id: 'a1',
  title: 'Quiz 1',
  type: 'quiz',
  status: 'draft',
  course_id: null,
  chapter_id: null,
  question_count: 3,
  created_at: '2026-01-01',
  updated_at: '2026-01-02',
};

describe('AdminAssessmentWriteService', () => {
  it('throws NotFoundException when the assessment does not exist', async () => {
    const db = createDb(() => ({ rows: [] }));
    const service = new AdminAssessmentWriteService(db as never);
    await expect(service.update('missing', { title: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('updates title/status/course-chapter link and returns the refreshed detail', async () => {
    const db = createDb((sql) => {
      if (sql.includes('SELECT id FROM assessments')) return { rows: [{ id: 'a1' }] };
      if (sql.startsWith('UPDATE assessments')) return { rows: [] };
      if (sql.includes('FROM assessments a')) return { rows: [{ ...DETAIL_ROW, title: 'Renamed', status: 'archived', course_id: 'course-1' }] };
      if (sql.includes('FROM assessment_settings')) return { rows: [] };
      return undefined;
    });
    const service = new AdminAssessmentWriteService(db as never);

    const result = await service.update('a1', { title: 'Renamed', status: 'archived', courseId: 'course-1' });

    expect(result.title).toBe('Renamed');
    expect(result.status).toBe('archived');
    expect(result.courseId).toBe('course-1');

    const updateCall = db.query.mock.calls.find(([sql]) => (sql as string).startsWith('UPDATE assessments'));
    expect(updateCall?.[0]).toContain('title = $1');
    expect(updateCall?.[0]).toContain('status = $2');
    expect(updateCall?.[0]).toContain('course_id = $3');
    expect(updateCall?.[1]).toEqual(['Renamed', 'archived', 'course-1', 'a1']);
  });

  it('upserts settings, converting time limit minutes to seconds', async () => {
    const db = createDb((sql) => {
      if (sql.includes('SELECT id FROM assessments')) return { rows: [{ id: 'a1' }] };
      if (sql.startsWith('INSERT INTO assessment_settings')) return { rows: [] };
      if (sql.includes('FROM assessments a')) return { rows: [DETAIL_ROW] };
      if (sql.includes('FROM assessment_settings')) return { rows: [{ time_limit_seconds: 600, pass_threshold: '70.00', randomize_questions: true }] };
      return undefined;
    });
    const service = new AdminAssessmentWriteService(db as never);

    const result = await service.update('a1', { settings: { timeLimitMinutes: 10, passMark: 70, shuffleQuestions: true } });

    const insertCall = db.query.mock.calls.find(([sql]) => (sql as string).startsWith('INSERT INTO assessment_settings'));
    expect(insertCall?.[1]).toEqual(['a1', 600, 70, true]);
    expect(result.settings).toEqual({ timeLimitMinutes: 10, passMark: 70, shuffleQuestions: true });
  });

  it('publish sets status to published', async () => {
    const db = createDb((sql) => {
      if (sql.includes('SELECT id FROM assessments')) return { rows: [{ id: 'a1' }] };
      if (sql.startsWith('UPDATE assessments')) return { rows: [] };
      if (sql.includes('FROM assessments a')) return { rows: [{ ...DETAIL_ROW, status: 'published' }] };
      if (sql.includes('FROM assessment_settings')) return { rows: [] };
      return undefined;
    });
    const service = new AdminAssessmentWriteService(db as never);

    const result = await service.publish('a1');

    expect(result.status).toBe('published');
    const updateCall = db.query.mock.calls.find(([sql]) => (sql as string).startsWith('UPDATE assessments'));
    expect(updateCall?.[0]).toContain("status = 'published'");
  });

  it('unpublish sets status back to draft', async () => {
    const db = createDb((sql) => {
      if (sql.includes('SELECT id FROM assessments')) return { rows: [{ id: 'a1' }] };
      if (sql.startsWith('UPDATE assessments')) return { rows: [] };
      if (sql.includes('FROM assessments a')) return { rows: [{ ...DETAIL_ROW, status: 'draft' }] };
      if (sql.includes('FROM assessment_settings')) return { rows: [] };
      return undefined;
    });
    const service = new AdminAssessmentWriteService(db as never);

    const result = await service.unpublish('a1');

    expect(result.status).toBe('draft');
    const updateCall = db.query.mock.calls.find(([sql]) => (sql as string).startsWith('UPDATE assessments'));
    expect(updateCall?.[0]).toContain("status = 'draft'");
  });
});
