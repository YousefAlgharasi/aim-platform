// P10-023: AssessmentService unit tests.

import { AssessmentService } from './assessment.service';

const now = new Date();
const past = new Date(now.getTime() - 3600_000);
const future = new Date(now.getTime() + 3600_000);
const farFuture = new Date(now.getTime() + 7 * 86400_000);

const mockDb = { query: jest.fn().mockResolvedValue({ rows: [{ max_attempts: 2, time_limit_seconds: 900 }] }) };

function makeRepo(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    findAllPublished: jest.fn().mockResolvedValue([
      { id: 'a-1', type: 'quiz', title: 'Unit Quiz', description: null, status: 'published', created_by: 'u-1', created_at: now, updated_at: now },
    ]),
    findPublishedById: jest.fn().mockResolvedValue(
      { id: 'a-1', type: 'quiz', title: 'Unit Quiz', description: null, status: 'published', created_by: 'u-1', created_at: now, updated_at: now },
    ),
    findSectionsByAssessment: jest.fn().mockResolvedValue([
      { id: 's-1', assessment_id: 'a-1', title: 'Grammar', order: 1, weight: 1.0 },
    ]),
    countQuestionsPerSection: jest.fn().mockResolvedValue(new Map([['s-1', 10]])),
    findEffectiveDeadline: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

describe('AssessmentService', () => {
  describe('deriveDeadlineStatus (backend-only)', () => {
    const svc = new AssessmentService(makeRepo() as any, mockDb as any);
    it('upcoming when now < opensAt', () => {
      expect(svc.deriveDeadlineStatus(future, farFuture, null)).toBe('upcoming');
    });
    it('open when now between opens and closes', () => {
      expect(svc.deriveDeadlineStatus(past, farFuture, null)).toBe('open');
    });
    it('extended when extendedClosesAt set and still open', () => {
      expect(svc.deriveDeadlineStatus(past, past, farFuture)).toBe('extended');
    });
    it('closed when past effective close', () => {
      expect(svc.deriveDeadlineStatus(past, past, null)).toBe('closed');
    });
  });

  describe('listForStudent', () => {
    it('returns list with null deadlineStatus when no deadline', async () => {
      const svc = new AssessmentService(makeRepo() as any, mockDb as any);
      const results = await svc.listForStudent('stu-1');
      expect(results[0].deadlineStatus).toBeNull();
    });
    it('returns computed deadlineStatus when deadline exists', async () => {
      const repo = makeRepo({
        findEffectiveDeadline: jest.fn().mockResolvedValue({
          id: 'd-1', opens_at: past, closes_at: farFuture,
          extended_closes_at: null, late_window_seconds: null, late_penalty_percent: 0, is_active: true,
        }),
      });
      const svc = new AssessmentService(repo as any, mockDb as any);
      const results = await svc.listForStudent('stu-1');
      expect(results[0].deadlineStatus).toBe('open');
    });
    it('response never contains passThreshold or sectionWeight', async () => {
      const svc = new AssessmentService(makeRepo() as any, mockDb as any);
      const results = await svc.listForStudent('stu-1');
      const item = results[0] as unknown as Record<string, unknown>;
      expect(item).not.toHaveProperty('passThreshold');
      expect(item).not.toHaveProperty('sectionWeight');
      expect(item).not.toHaveProperty('latePenaltyPercent');
    });
  });

  describe('getDetailWithDeadline', () => {
    it('returns deadline: null when no deadlineService is provided', async () => {
      const svc = new AssessmentService(makeRepo() as any, mockDb as any);
      const detail = await svc.getDetailWithDeadline('a-1', 'stu-1');
      expect(detail.deadline).toBeNull();
    });

    it('returns deadline: null when deadlineService resolves no deadline', async () => {
      const deadlineService = { getDeadlineStatus: jest.fn().mockResolvedValue(null) };
      const svc = new AssessmentService(makeRepo() as any, mockDb as any, deadlineService as any);
      const detail = await svc.getDetailWithDeadline('a-1', 'stu-1');
      expect(deadlineService.getDeadlineStatus).toHaveBeenCalledWith('a-1', 'stu-1');
      expect(detail.deadline).toBeNull();
    });

    it('returns the backend-computed deadline status from AssessmentDeadlineService', async () => {
      const deadlineResult = {
        deadlineId: 'd-1', opensAt: past, closesAt: farFuture,
        extendedClosesAt: null, status: 'open' as const,
      };
      const deadlineService = { getDeadlineStatus: jest.fn().mockResolvedValue(deadlineResult) };
      const svc = new AssessmentService(makeRepo() as any, mockDb as any, deadlineService as any);
      const detail = await svc.getDetailWithDeadline('a-1', 'stu-1');
      expect(detail.deadline).toEqual(deadlineResult);
    });

    it('never leaks late_window_seconds or late_penalty_percent in the response', async () => {
      const deadlineResult = {
        deadlineId: 'd-1', opensAt: past, closesAt: past,
        extendedClosesAt: null, status: 'late' as const,
      };
      const deadlineService = { getDeadlineStatus: jest.fn().mockResolvedValue(deadlineResult) };
      const svc = new AssessmentService(makeRepo() as any, mockDb as any, deadlineService as any);
      const detail = await svc.getDetailWithDeadline('a-1', 'stu-1') as unknown as Record<string, unknown>;
      expect(detail).not.toHaveProperty('late_window_seconds');
      expect(detail).not.toHaveProperty('late_penalty_percent');
      expect(detail).not.toHaveProperty('latePenaltyPercent');
    });
  });

  describe('getDetail', () => {
    it('returns sections with questionCount', async () => {
      const svc = new AssessmentService(makeRepo() as any, mockDb as any);
      const detail = await svc.getDetail('a-1', 'stu-1');
      expect(detail.sections[0].questionCount).toBe(10);
    });
    it('detail never contains passThreshold or weight', async () => {
      const svc = new AssessmentService(makeRepo() as any, mockDb as any);
      const detail = await svc.getDetail('a-1', 'stu-1') as unknown as Record<string, unknown>;
      expect(detail).not.toHaveProperty('passThreshold');
      const sec = detail['sections'] as Record<string, unknown>[];
      expect(sec[0]).not.toHaveProperty('weight');
    });
  });
});
