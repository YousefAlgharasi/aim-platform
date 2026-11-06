import { lastValueFrom, of, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { IDEMPOTENT_KEY } from './idempotent.decorator';

function setup(claim: any, opts: any = { scope: 'x' }, headers: Record<string, string> = { 'idempotency-key': 'key-12345678' }) {
  const service = { claim: jest.fn(async () => claim), complete: jest.fn(async () => undefined), release: jest.fn(async () => undefined) };
  const reflector = { get: (k: string) => (k === IDEMPOTENT_KEY ? opts : undefined) } as unknown as Reflector;
  const res: any = { statusCode: 201, setHeader: jest.fn(), status: jest.fn() };
  const ctx: any = {
    getHandler: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ headers, method: 'POST', path: '/p', body: { a: 1 }, user: { id: 'u1' } }), getResponse: () => res }),
  };
  return { interceptor: new IdempotencyInterceptor(reflector, service as any), service, ctx, res };
}

describe('IdempotencyInterceptor', () => {
  it('passes straight through when no Idempotency-Key header is sent (backwards compatible)', async () => {
    const { interceptor, service, ctx } = setup({ kind: 'claimed', id: 'i' }, { scope: 'x' }, {});
    const out = await interceptor.intercept(ctx, { handle: () => of('ok') });
    expect(await lastValueFrom(out)).toBe('ok');
    expect(service.claim).not.toHaveBeenCalled();
  });

  it('runs the handler once on a fresh key and stores the response', async () => {
    const { interceptor, service, ctx } = setup({ kind: 'claimed', id: 'i1' });
    const out = await interceptor.intercept(ctx, { handle: () => of({ done: true }) });
    expect(await lastValueFrom(out)).toEqual({ done: true });
    expect(service.complete).toHaveBeenCalledWith('i1', 201, { done: true });
  });

  it('replays the stored response without running the handler', async () => {
    const { interceptor, ctx, res } = setup({ kind: 'replay', status: 201, body: { saved: 1 } });
    const handle = jest.fn(() => of('SHOULD NOT RUN'));
    const out = await interceptor.intercept(ctx, { handle });
    expect(await lastValueFrom(out)).toEqual({ saved: 1 });
    expect(handle).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Idempotent-Replayed', 'true');
  });

  it('releases the key when the handler fails so the client can retry', async () => {
    const { interceptor, service, ctx } = setup({ kind: 'claimed', id: 'i2' });
    const out = await interceptor.intercept(ctx, { handle: () => throwError(() => new Error('boom')) });
    await expect(lastValueFrom(out)).rejects.toThrow('boom');
    expect(service.release).toHaveBeenCalledWith('i2');
    expect(service.complete).not.toHaveBeenCalled();
  });

  it.each([
    [{ kind: 'in_progress' }, 409],
    [{ kind: 'conflict' }, 422],
  ])('rejects %j with %i', async (claim, status) => {
    const { interceptor, ctx } = setup(claim);
    await expect(interceptor.intercept(ctx, { handle: () => of(1) })).rejects.toMatchObject({ statusCode: status });
  });

  it('rejects malformed keys with 400', async () => {
    const { interceptor, ctx } = setup({ kind: 'claimed', id: 'i' }, { scope: 'x' }, { 'idempotency-key': 'short' });
    await expect(interceptor.intercept(ctx, { handle: () => of(1) })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('stream mode: a repeat of a finished stream gets 409 instead of a replay', async () => {
    const { interceptor, ctx } = setup({ kind: 'replay', status: 200, body: null }, { scope: 's', mode: 'once' });
    await expect(interceptor.intercept(ctx, { handle: () => of(1) })).rejects.toMatchObject({ statusCode: 409 });
  });
});
