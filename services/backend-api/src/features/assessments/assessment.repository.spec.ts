// P10-022: AssessmentRepository unit tests.

import { NotFoundException } from '@nestjs/common';
import { AssessmentRepository } from './assessment.repository';

function makeDb(rows: unknown[] = []) {
  return { query: jest.fn().mockResolvedValue({ rows }) };
}

const ASSESSMENT = {
  id: 'a-1', type: 'quiz', title: 'Test', description: null,
  status: 'published', created_by: 'u-1', created_at: new Date(), updated_at: new Date(),
};

describe('AssessmentRepository', () => {
  describe('findPublishedById', () => {
    it('returns assessment when found', async () => {
      const repo = new AssessmentRepository(makeDb([ASSESSMENT]) as any);
      const result = await repo.findPublishedById('a-1');
      expect(result.id).toBe('a-1');
    });
    it('throws NotFoundException when not found', async () => {
      const repo = new AssessmentRepository(makeDb([]) as any);
      await expect(repo.findPublishedById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPublished', () => {
    it('returns list', async () => {
      const repo = new AssessmentRepository(makeDb([ASSESSMENT, ASSESSMENT]) as any);
      const results = await repo.findAllPublished();
      expect(results).toHaveLength(2);
    });
  });

  describe('countAttemptsByStudent', () => {
    it('returns parsed count', async () => {
      const repo = new AssessmentRepository(makeDb([{ count: '3' }]) as any);
      const count = await repo.countAttemptsByStudent('a-1', 's-1');
      expect(count).toBe(3);
    });
    it('returns 0 when no rows', async () => {
      const repo = new AssessmentRepository(makeDb([]) as any);
      const count = await repo.countAttemptsByStudent('a-1', 's-1');
      expect(count).toBe(0);
    });
  });

  describe('createAttempt', () => {
    it('returns new attempt row', async () => {
      const attempt = {
        id: 'att-1', assessment_id: 'a-1', student_id: 's-1',
        attempt_number: 1, status: 'started',
        started_at: new Date(), submitted_at: null, expires_at: null,
      };
      const repo = new AssessmentRepository(makeDb([attempt]) as any);
      const result = await repo.createAttempt('a-1', 's-1', 1, null);
      expect(result.id).toBe('att-1');
      expect(result.status).toBe('started');
    });
  });

  describe('upsertAnswer — no correctness field', () => {
    it('returns answer id', async () => {
      const repo = new AssessmentRepository(makeDb([{ id: 'ans-1' }]) as any);
      const id = await repo.upsertAnswer('att-1', 'ql-1', 'A');
      expect(id).toBe('ans-1');
    });
    it('SQL never includes is_correct or score in insert', async () => {
      const db = makeDb([{ id: 'ans-1' }]);
      const repo = new AssessmentRepository(db as any);
      await repo.upsertAnswer('att-1', 'ql-1', 'B');
      const sql: string = db.query.mock.calls[0][0];
      expect(sql).not.toContain('is_correct');
      expect(sql).not.toContain('score');
      expect(sql).not.toContain('passed');
    });
  });

  describe('findEffectiveDeadline', () => {
    it('returns null when no deadline', async () => {
      const repo = new AssessmentRepository(makeDb([]) as any);
      const result = await repo.findEffectiveDeadline('a-1', 's-1');
      expect(result).toBeNull();
    });
    it('returns deadline row', async () => {
      const dl = {
        id: 'd-1', assessment_id: 'a-1', student_id: null,
        opens_at: new Date(), closes_at: new Date(), extended_closes_at: null,
        late_window_seconds: null, late_penalty_percent: 0, is_active: true,
      };
      const repo = new AssessmentRepository(makeDb([dl]) as any);
      const result = await repo.findEffectiveDeadline('a-1', 's-1');
      expect(result?.id).toBe('d-1');
    });
  });
});
