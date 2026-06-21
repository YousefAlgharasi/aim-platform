// P10-042: Deadline enforcement tests.
//
// Scope: Exhaustive tests for all deadline windows (upcoming, open, closed,
//        late, missed, extended, expired) to verify backend deadline authority.
//
// Security rules verified:
//   - Status is always backend-derived via computeStatus — never client-supplied.
//   - late_penalty_percent and late_window_seconds never leak to the response.
//   - Submission eligibility is always backend-evaluated.

import { AssessmentDeadlineService, DeadlineRow } from './assessment-deadline.service';

function makeDeadline(overrides: Partial<DeadlineRow> = {}): DeadlineRow {
  return {
    id: 'd-1', assessment_id: 'a-1', student_id: null, is_active: true,
    opens_at: new Date('2026-06-20T08:00:00Z'),
    closes_at: new Date('2026-06-20T18:00:00Z'),
    extended_closes_at: null,
    late_window_seconds: null,
    late_penalty_percent: 0,
    ...overrides,
  };
}

function mockDb(row: DeadlineRow | null) {
  return { query: jest.fn().mockResolvedValue({ rows: row ? [row] : [] }) } as any;
}

describe('Deadline Enforcement (P10-042)', () => {
  // -----------------------------------------------------------------------
  // computeStatus — edge cases at exact boundaries
  // -----------------------------------------------------------------------
  describe('computeStatus boundary precision', () => {
    const svc = new AssessmentDeadlineService({ query: jest.fn() } as any);

    it('upcoming 1ms before opens_at', () => {
      const d = makeDeadline();
      expect(svc.computeStatus(d, new Date('2026-06-20T07:59:59.999Z'))).toBe('upcoming');
    });

    it('open at exact opens_at', () => {
      const d = makeDeadline();
      expect(svc.computeStatus(d, new Date('2026-06-20T08:00:00.000Z'))).toBe('open');
    });

    it('open at exact closes_at (inclusive boundary)', () => {
      const d = makeDeadline();
      expect(svc.computeStatus(d, new Date('2026-06-20T18:00:00.000Z'))).toBe('open');
    });

    it('closed 1ms after closes_at with no late window', () => {
      const d = makeDeadline();
      expect(svc.computeStatus(d, new Date('2026-06-20T18:00:00.001Z'))).toBe('closed');
    });

    it('late at 1ms after closes_at when late window configured', () => {
      const d = makeDeadline({ late_window_seconds: 1800 });
      expect(svc.computeStatus(d, new Date('2026-06-20T18:00:00.001Z'))).toBe('late');
    });

    it('late at exact end of late window (inclusive)', () => {
      const d = makeDeadline({ late_window_seconds: 1800 }); // 30 min
      expect(svc.computeStatus(d, new Date('2026-06-20T18:30:00.000Z'))).toBe('late');
    });

    it('expired 1ms after late window ends', () => {
      const d = makeDeadline({ late_window_seconds: 1800 });
      expect(svc.computeStatus(d, new Date('2026-06-20T18:30:00.001Z'))).toBe('expired');
    });

    it('extended at exact extended_closes_at (inclusive)', () => {
      const d = makeDeadline({ extended_closes_at: new Date('2026-06-21T18:00:00Z') });
      expect(svc.computeStatus(d, new Date('2026-06-21T18:00:00.000Z'))).toBe('extended');
    });

    it('closed after extended_closes_at with no late window', () => {
      const d = makeDeadline({ extended_closes_at: new Date('2026-06-21T18:00:00Z') });
      expect(svc.computeStatus(d, new Date('2026-06-21T18:00:00.001Z'))).toBe('closed');
    });
  });

  // -----------------------------------------------------------------------
  // Extended window overrides standard close
  // -----------------------------------------------------------------------
  describe('extended window behavior', () => {
    const svc = new AssessmentDeadlineService({ query: jest.fn() } as any);

    it('extended overrides standard close — student gets extra time', () => {
      const d = makeDeadline({ extended_closes_at: new Date('2026-06-22T00:00:00Z') });
      // After standard close but within extension
      expect(svc.computeStatus(d, new Date('2026-06-21T12:00:00Z'))).toBe('extended');
    });

    it('extended with late window: late starts after extended_closes_at', () => {
      const d = makeDeadline({
        extended_closes_at: new Date('2026-06-21T18:00:00Z'),
        late_window_seconds: 3600,
      });
      // After extended close, within late window
      expect(svc.computeStatus(d, new Date('2026-06-21T18:30:00Z'))).toBe('late');
    });

    it('expired after extended + late window', () => {
      const d = makeDeadline({
        extended_closes_at: new Date('2026-06-21T18:00:00Z'),
        late_window_seconds: 3600,
      });
      expect(svc.computeStatus(d, new Date('2026-06-21T19:00:00.001Z'))).toBe('expired');
    });
  });

  // -----------------------------------------------------------------------
  // checkSubmissionEligibility — all windows
  // -----------------------------------------------------------------------
  describe('submission eligibility across all windows', () => {
    it('ineligible during upcoming window', async () => {
      const d = makeDeadline();
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-20T07:00:00Z'));
      expect(r.eligible).toBe(false);
      expect(r.reason).toBe('DEADLINE_NOT_OPEN');
    });

    it('eligible during open window, no penalty', async () => {
      const d = makeDeadline();
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-20T12:00:00Z'));
      expect(r.eligible).toBe(true);
      expect(r.isLate).toBe(false);
      expect(r.latePenaltyPercent).toBe(0);
    });

    it('eligible during extended window, no penalty', async () => {
      const d = makeDeadline({ extended_closes_at: new Date('2026-06-21T18:00:00Z') });
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-21T12:00:00Z'));
      expect(r.eligible).toBe(true);
      expect(r.isLate).toBe(false);
    });

    it('eligible during late window with penalty from DB', async () => {
      const d = makeDeadline({ late_window_seconds: 3600, late_penalty_percent: 20 });
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-20T18:30:00Z'));
      expect(r.eligible).toBe(true);
      expect(r.isLate).toBe(true);
      expect(r.latePenaltyPercent).toBe(20);
    });

    it('ineligible after closed (no late window)', async () => {
      const d = makeDeadline();
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-21T00:00:00Z'));
      expect(r.eligible).toBe(false);
      expect(r.reason).toBe('DEADLINE_CLOSED');
    });

    it('ineligible after expired (past late window)', async () => {
      const d = makeDeadline({ late_window_seconds: 1800 });
      const svc = new AssessmentDeadlineService(mockDb(d));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1', new Date('2026-06-20T19:00:00Z'));
      expect(r.eligible).toBe(false);
      expect(r.reason).toBe('DEADLINE_CLOSED');
    });

    it('always eligible when no deadline configured', async () => {
      const svc = new AssessmentDeadlineService(mockDb(null));
      const r = await svc.checkSubmissionEligibility('a-1', 's-1');
      expect(r.eligible).toBe(true);
      expect(r.isLate).toBe(false);
      expect(r.latePenaltyPercent).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // getDeadlineStatus never leaks backend-only fields
  // -----------------------------------------------------------------------
  describe('getDeadlineStatus never leaks backend-only fields', () => {
    it('late_penalty_percent never in response', async () => {
      const d = makeDeadline({ late_penalty_percent: 25 });
      const svc = new AssessmentDeadlineService(mockDb(d));
      const result = await svc.getDeadlineStatus('a-1', 's-1', new Date('2026-06-20T12:00:00Z'));
      const json = JSON.stringify(result);
      expect(json).not.toContain('late_penalty_percent');
      expect(json).not.toContain('latePenaltyPercent');
      expect(json).not.toContain('late_window_seconds');
      expect(json).not.toContain('lateWindowSeconds');
    });

    it('response only contains allowed keys', async () => {
      const d = makeDeadline({ late_penalty_percent: 50, late_window_seconds: 7200 });
      const svc = new AssessmentDeadlineService(mockDb(d));
      const result = await svc.getDeadlineStatus('a-1', 's-1', new Date('2026-06-20T12:00:00Z'));
      const keys = Object.keys(result!);
      expect(keys.sort()).toEqual(['closesAt', 'deadlineId', 'extendedClosesAt', 'opensAt', 'status']);
    });
  });

  // -----------------------------------------------------------------------
  // Per-student extension takes precedence
  // -----------------------------------------------------------------------
  describe('per-student deadline resolution', () => {
    it('SQL query orders student-specific before global (NULLS LAST)', async () => {
      const d = makeDeadline({ student_id: 's-1' });
      const db = mockDb(d);
      const svc = new AssessmentDeadlineService(db);
      await svc.getDeadlineStatus('a-1', 's-1');
      const sql: string = db.query.mock.calls[0][0];
      expect(sql).toContain('NULLS LAST');
    });
  });
});
