import { CourseAccessService, COURSE_PAYMENT_REQUIRED } from './course-access.service';

type Row = Record<string, unknown>;

interface FakeState {
  prices?: Row[];
  accessLatest?: Row[];
  requestsLatest?: Row[];
  activeWindows?: Row[];
  completion?: Row;
}

function makeDb(state: FakeState) {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  const db = {
    calls,
    query: jest.fn(async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params });
      if (sql.includes('FROM users u')) return { rows: [{ user_id: 'u1', supabase_auth_uid: 'sb1', profile_id: 'p1' }] };
      if (sql.includes("FROM course_access WHERE student_id = $1 AND status = 'active'")) return { rows: state.activeWindows ?? [] };
      if (sql.includes('FROM course_prices')) return { rows: state.prices ?? [] };
      if (sql.includes('FROM course_access') && sql.includes('DISTINCT ON')) return { rows: state.accessLatest ?? [] };
      if (sql.includes('FROM course_payment_requests') && sql.includes('DISTINCT ON')) return { rows: state.requestsLatest ?? [] };
      if (sql.includes('lessons_in_course')) return { rows: [state.completion ?? { lesson_count: '3', completed_lesson_count: '1', quizzes_passed: false, exams_passed: false, finished_at: null }] };
      if (sql.startsWith('UPDATE') || sql.startsWith('DELETE') || sql.includes('DELETE FROM')) return { rows: [], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    }),
  };
  return db;
}

const NOW = new Date('2026-11-15T12:00:00Z');
const PAID = { course_id: 'c1', amount: '5000', currency: 'YER', discount_type: 'none', discount_value: '0', discount_starts_at: null, discount_ends_at: null, access_days: 30 };

describe('CourseAccessService', () => {
  it('opens free courses without payment', async () => {
    const svc = new CourseAccessService(makeDb({}) as any);
    const b = await svc.getBilling('u1', 'c1', NOW);
    expect(b.access).toMatchObject({ status: 'free', hasAccess: true });
  });

  it('requires payment for a priced course', async () => {
    const svc = new CourseAccessService(makeDb({ prices: [PAID] }) as any);
    const b = await svc.getBilling('u1', 'c1', NOW);
    expect(b.price.amount).toBe(5000);
    expect(b.access).toMatchObject({ status: 'none', hasAccess: false });
  });

  it('shows a pending payment', async () => {
    const svc = new CourseAccessService(
      makeDb({ prices: [PAID], requestsLatest: [{ id: 'r1', course_id: 'c1', status: 'pending', admin_note: null, created_at: NOW }] }) as any,
    );
    expect((await svc.getBilling('u1', 'c1', NOW)).access).toMatchObject({ status: 'pending', pendingRequestId: 'r1', hasAccess: false });
  });

  it('shows a rejected payment with the admin note', async () => {
    const svc = new CourseAccessService(
      makeDb({ prices: [PAID], requestsLatest: [{ id: 'r1', course_id: 'c1', status: 'rejected', admin_note: 'Wrong amount', created_at: NOW }] }) as any,
    );
    expect((await svc.getBilling('u1', 'c1', NOW)).access).toMatchObject({ status: 'rejected', rejectionNote: 'Wrong amount' });
  });

  it('gives access during an active window with days left', async () => {
    const expires = new Date('2026-11-25T12:00:00Z');
    const window = { id: 'a1', course_id: 'c1', status: 'active', starts_at: new Date('2026-10-26T12:00:00Z'), expires_at: expires, created_at: NOW };
    const svc = new CourseAccessService(makeDb({ prices: [PAID], accessLatest: [window], activeWindows: [window] }) as any);
    const b = await svc.getBilling('u1', 'c1', NOW);
    expect(b.access).toMatchObject({ status: 'active', hasAccess: true, daysLeft: 10, expiresAt: expires.toISOString() });
  });

  it('fails an expired unfinished window and resets that course progress', async () => {
    const window = { id: 'a1', course_id: 'c1', status: 'active', starts_at: new Date('2026-10-01T00:00:00Z'), expires_at: new Date('2026-10-31T00:00:00Z'), created_at: new Date('2026-10-01T00:00:00Z') };
    const db = makeDb({ prices: [PAID], activeWindows: [window], accessLatest: [{ ...window, status: 'failed' }] });
    const svc = new CourseAccessService(db as any);
    const b = await svc.getBilling('u1', 'c1', NOW);

    expect(b.access).toMatchObject({ status: 'failed', hasAccess: false });
    const sqls = db.calls.map((c) => c.sql);
    expect(sqls.some((s) => s.includes("SET status = 'failed'"))).toBe(true);
    const lessonReset = db.calls.find((c) => c.sql.includes('DELETE FROM lesson_progress'));
    const attemptReset = db.calls.find((c) => c.sql.includes('DELETE FROM assessment_attempts'));
    expect(lessonReset?.params).toEqual(['c1', ['u1', 'sb1', 'p1']]);
    expect(attemptReset?.params).toEqual(['c1', ['u1', 'sb1', 'p1']]);
  });

  it('completes a window finished before the deadline (even when read later)', async () => {
    const window = { id: 'a1', course_id: 'c1', status: 'active', starts_at: new Date('2026-10-01T00:00:00Z'), expires_at: new Date('2026-10-31T00:00:00Z'), created_at: new Date('2026-10-01T00:00:00Z') };
    const db = makeDb({
      prices: [PAID],
      activeWindows: [window],
      accessLatest: [{ ...window, status: 'completed' }],
      completion: { lesson_count: '3', completed_lesson_count: '3', quizzes_passed: true, exams_passed: true, finished_at: new Date('2026-10-20T00:00:00Z') },
    });
    const svc = new CourseAccessService(db as any);
    const b = await svc.getBilling('u1', 'c1', NOW);
    expect(b.access).toMatchObject({ status: 'completed', hasAccess: true });
    expect(db.calls.some((c) => c.sql.includes("SET status = 'completed'"))).toBe(true);
    expect(db.calls.some((c) => c.sql.includes('DELETE FROM lesson_progress'))).toBe(false);
  });

  it('fails a window finished only after the deadline', async () => {
    const window = { id: 'a1', course_id: 'c1', status: 'active', starts_at: new Date('2026-10-01T00:00:00Z'), expires_at: new Date('2026-10-31T00:00:00Z'), created_at: new Date('2026-10-01T00:00:00Z') };
    const db = makeDb({
      prices: [PAID],
      activeWindows: [window],
      completion: { lesson_count: '3', completed_lesson_count: '3', quizzes_passed: true, exams_passed: true, finished_at: new Date('2026-11-02T00:00:00Z') },
    });
    await new CourseAccessService(db as any).getBilling('u1', 'c1', NOW);
    expect(db.calls.some((c) => c.sql.includes("SET status = 'failed'"))).toBe(true);
  });

  it('assertAccess throws COURSE_PAYMENT_REQUIRED (402) without access', async () => {
    const svc = new CourseAccessService(makeDb({ prices: [PAID] }) as any);
    await expect(svc.assertAccess('u1', 'c1')).rejects.toMatchObject({ code: COURSE_PAYMENT_REQUIRED, statusCode: 402 });
  });

  it('assertAccess allows content that is not part of a course', async () => {
    const svc = new CourseAccessService(makeDb({ prices: [PAID] }) as any);
    await expect(svc.assertAccess('u1', null)).resolves.toBeUndefined();
  });
});
