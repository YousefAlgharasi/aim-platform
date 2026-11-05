import { JobLockService } from './job-lock.service';

function makeDb(locked: boolean) {
  const calls: string[] = [];
  const client = { query: jest.fn(async (sql: string) => { calls.push(sql); return { rows: [{ locked }] }; }) };
  const db = { withClient: async (cb: (c: typeof client) => Promise<unknown>) => cb(client) } as any;
  return { db, calls };
}

describe('JobLockService.runExclusive', () => {
  it('runs the job and always releases the lock', async () => {
    const { db, calls } = makeDb(true);
    const job = jest.fn().mockResolvedValue(42);
    expect(await new JobLockService(db).runExclusive('j', job)).toEqual({ ran: true, value: 42 });
    expect(calls[0]).toContain('pg_try_advisory_lock');
    expect(calls[1]).toContain('pg_advisory_unlock');
  });

  it('releases the lock even when the job throws', async () => {
    const { db, calls } = makeDb(true);
    await expect(new JobLockService(db).runExclusive('j', async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(calls.some((c) => c.includes('pg_advisory_unlock'))).toBe(true);
  });

  it('skips the job when another instance holds the lock', async () => {
    const { db, calls } = makeDb(false);
    const job = jest.fn();
    expect(await new JobLockService(db).runExclusive('j', job)).toEqual({ ran: false });
    expect(job).not.toHaveBeenCalled();
    expect(calls).toHaveLength(1);
  });
});
