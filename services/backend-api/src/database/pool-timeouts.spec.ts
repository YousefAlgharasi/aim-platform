import { readPoolTimeouts } from './database.service';

describe('readPoolTimeouts', () => {
  it('has safe defaults', () => {
    expect(readPoolTimeouts({})).toEqual({ poolMax: 10, statementTimeoutMs: 30_000, idleInTransactionTimeoutMs: 60_000 });
  });
  it('accepts overrides and ignores junk', () => {
    expect(readPoolTimeouts({ DB_POOL_MAX: '20', DB_STATEMENT_TIMEOUT_MS: '5000' } as any))
      .toMatchObject({ poolMax: 20, statementTimeoutMs: 5000 });
    expect(readPoolTimeouts({ DB_STATEMENT_TIMEOUT_MS: 'abc', DB_POOL_MAX: '-3' } as any))
      .toMatchObject({ poolMax: 10, statementTimeoutMs: 30_000 });
  });
});
