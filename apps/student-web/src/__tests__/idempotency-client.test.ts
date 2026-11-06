import { newIdempotencyKey } from '../api/client';

describe('newIdempotencyKey', () => {
  it('returns distinct keys that satisfy the server pattern (8-128 of [A-Za-z0-9_\\-:.])', () => {
    const a = newIdempotencyKey();
    const b = newIdempotencyKey();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_\-:.]{8,128}$/);
  });
});
