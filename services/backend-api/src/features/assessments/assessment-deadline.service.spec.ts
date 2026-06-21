// P10-024: AssessmentDeadlineService tests.

import { AssessmentDeadlineService, DeadlineRow } from './assessment-deadline.service';

function makeRow(overrides: Partial<DeadlineRow> = {}): DeadlineRow {
  return {
    id: 'd-1', assessment_id: 'a-1', student_id: null, is_active: true,
    opens_at: new Date('2026-06-20T00:00:00Z'),
    closes_at: new Date('2026-06-27T23:59:00Z'),
    extended_closes_at: null,
    late_window_seconds: null,
    late_penalty_percent: 0,
    ...overrides,
  };
}

function makeDb(row: DeadlineRow | null = null) {
  return {
    query: jest.fn().mockResolvedValue({ rows: row ? [row] : [] }),
  };
}

describe('AssessmentDeadlineService', () => {
  describe('computeStatus — backend-only status derivation', () => {
    const svc = new AssessmentDeadlineService({ query: jest.fn() } as any);

    it('upcoming before opens_at', () => {
      const row = makeRow();
      expect(svc.computeStatus(row, new Date('2026-06-19T12:00:00Z'))).toBe('upcoming');
    });

    it('open during window', () => {
      const row = makeRow();
      expect(svc.computeStatus(row, new Date('2026-06-23T12:00:00Z'))).toBe('open');
    });

    it('closed after closes_at with no late window', () => {
      const row = makeRow();
      expect(svc.computeStatus(row, new Date('2026-06-28T12:00:00Z'))).toBe('closed');
    });

    it('late when within late window', () => {
      const row = makeRow({ late_window_seconds: 3600 });
      // 30 min after close
      expect(svc.computeStatus(row, new Date('2026-06-28T00:29:00Z'))).toBe('late');
    });

    it('expired when past late window', () => {
      const row = makeRow({ late_window_seconds: 3600 });
      // 2h after close
      expect(svc.computeStatus(row, new Date('2026-06-28T02:00:00Z'))).toBe('expired');
    });

    it('extended when extended_closes_at is set and within it', () => {
      const row = makeRow({
        extended_closes_at: new Date('2026-06-29T23:59:00Z'),
      });
      expect(svc.computeStatus(row, new Date('2026-06-28T12:00:00Z'))).toBe('extended');
    });
  });

  describe('getDeadlineStatus', () => {
    it('returns null when no deadline configured', async () => {
      const svc = new AssessmentDeadlineService(makeDb(null) as any);
      const result = await svc.getDeadlineStatus('a-1', 's-1');
      expect(result).toBeNull();
    });

    it('returns status with opensAt/closesAt but no late_penalty_percent', async () => {
      const row = makeRow({ late_penalty_percent: 10 });
      const svc = new AssessmentDeadlineService(makeDb(row) as any);
      const result = await svc.getDeadlineStatus('a-1', 's-1', new Date('2026-06-23T12:00:00Z'));
      expect(result?.status).toBe('open');
      expect(result).not.toHaveProperty('latePenaltyPercent');
      expect(result).not.toHaveProperty('lateWindowSeconds');
    });
  });

  describe('checkSubmissionEligibility', () => {
    it('eligible with no penalty when no deadline', async () => {
      const svc = new AssessmentDeadlineService(makeDb(null) as any);
      const result = await svc.checkSubmissionEligibility('a-1', 's-1');
      expect(result.eligible).toBe(true);
      expect(result.isLate).toBe(false);
      expect(result.latePenaltyPercent).toBe(0);
    });

    it('ineligible when upcoming', async () => {
      const row = makeRow();
      const svc = new AssessmentDeadlineService(makeDb(row) as any);
      const result = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-19T00:00:00Z'));
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('DEADLINE_NOT_OPEN');
    });

    it('eligible, not late when open', async () => {
      const row = makeRow();
      const svc = new AssessmentDeadlineService(makeDb(row) as any);
      const result = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-23T12:00:00Z'));
      expect(result.eligible).toBe(true);
      expect(result.isLate).toBe(false);
    });

    it('eligible, late with penalty when within late window', async () => {
      const row = makeRow({ late_window_seconds: 3600, late_penalty_percent: 15 });
      const svc = new AssessmentDeadlineService(makeDb(row) as any);
      const result = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-28T00:29:00Z'));
      expect(result.eligible).toBe(true);
      expect(result.isLate).toBe(true);
      expect(result.latePenaltyPercent).toBe(15); // for grading service only
    });

    it('ineligible when closed', async () => {
      const row = makeRow();
      const svc = new AssessmentDeadlineService(makeDb(row) as any);
      const result = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-07-01T00:00:00Z'));
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('DEADLINE_CLOSED');
    });
  });
});
