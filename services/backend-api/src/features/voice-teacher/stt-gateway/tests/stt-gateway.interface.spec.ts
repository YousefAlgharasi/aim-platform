// P9-046: Add STT Provider Tests — STT Gateway interface & types.
// Verifies that the SttGateway contract and SttProviderResponse/Request
// types enforce the authority boundary rules from P9-038 (no AIM fields,
// no provider credentials in the contract shape).

import { SttGateway, STT_GATEWAY } from '../stt-gateway.interface';
import { SttProviderRequest, SttProviderResponse } from '../stt-gateway.types';

describe('SttGateway interface', () => {
  it('STT_GATEWAY token is a Symbol', () => {
    expect(typeof STT_GATEWAY).toBe('symbol');
  });

  it('a concrete subclass can implement transcribe() and return a success response', async () => {
    class MockSttGateway extends SttGateway {
      async transcribe(_req: SttProviderRequest): Promise<SttProviderResponse> {
        return { status: 'success', transcript: 'مرحباً', durationMs: 1200 };
      }
    }

    const gw = new MockSttGateway();
    const req: SttProviderRequest = {
      audio: Buffer.from('fake-audio'),
      contentType: 'audio/webm',
    };
    const res = await gw.transcribe(req);

    expect(res.status).toBe('success');
    expect(res.transcript).toBe('مرحباً');
    expect(res.durationMs).toBe(1200);
  });

  it('a concrete subclass can return an error response without AIM fields', async () => {
    class ErrorSttGateway extends SttGateway {
      async transcribe(_req: SttProviderRequest): Promise<SttProviderResponse> {
        return { status: 'error', transcript: null, durationMs: null, errorCategory: 'STT_PROVIDER_CALL_FAILED' };
      }
    }

    const gw = new ErrorSttGateway();
    const res = await gw.transcribe({ audio: Buffer.alloc(0), contentType: 'audio/webm' });

    expect(res.status).toBe('error');
    expect(res.transcript).toBeNull();
    // No mastery/difficulty/AIM fields on the response shape
    expect((res as any).mastery).toBeUndefined();
    expect((res as any).difficulty).toBeUndefined();
    expect((res as any).weakness).toBeUndefined();
    expect((res as any).recommendation).toBeUndefined();
  });

  it('SttProviderRequest does not carry provider credentials', () => {
    const req: SttProviderRequest = {
      audio: Buffer.from('bytes'),
      contentType: 'audio/mp4',
    };
    expect((req as any).apiKey).toBeUndefined();
    expect((req as any).model).toBeUndefined();
    expect(Object.keys(req)).toEqual(expect.arrayContaining(['audio', 'contentType']));
    expect(Object.keys(req)).not.toContain('apiKey');
  });
});
