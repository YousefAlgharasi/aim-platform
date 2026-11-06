import { ClientThrottlerGuard } from './client-throttler.guard';

function guardWith(verify: (t: string) => Promise<{ id: string }>) {
  const g = Object.create(ClientThrottlerGuard.prototype) as any;
  g.moduleRef = { get: () => ({ verify }) };
  return g as { getTracker(req: any): Promise<string> };
}

describe('ClientThrottlerGuard.getTracker', () => {
  it('keys a valid bearer token by user, so shared IPs do not share a bucket', async () => {
    const g = guardWith(async () => ({ id: 'u1' }));
    expect(await g.getTracker({ headers: { authorization: 'Bearer abc' }, ip: '10.0.0.1' })).toBe('user:u1');
    expect(await g.getTracker({ headers: { authorization: 'Bearer abc' }, ip: '10.0.0.2' })).toBe('user:u1');
  });

  it('falls back to the client IP for anonymous or invalid tokens (a forged token gets no fresh bucket)', async () => {
    const g = guardWith(async () => { throw new Error('bad signature'); });
    expect(await g.getTracker({ headers: {}, ip: '203.0.113.7' })).toBe('ip:203.0.113.7');
    expect(await g.getTracker({ headers: { authorization: 'Bearer forged' }, ip: '203.0.113.7' })).toBe('ip:203.0.113.7');
  });
});
