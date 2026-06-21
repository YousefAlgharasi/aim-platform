// P9-046: Add STT Provider Tests — SttRequestMapperService.
// Verifies that the request mapper (P9-040) translates a
// SttProviderRequest into the provider-specific SttCompletionRequest
// without embedding provider credentials or AIM fields.

import { SttRequestMapperService } from '../stt-request.mapper';
import { SttGatewayConfigService } from '../stt-gateway.config';

function makeConfigService(model = 'whisper-1'): SttGatewayConfigService {
  return {
    getConfig: () => ({ apiKey: 'sk-REDACTED', model }),
  } as unknown as SttGatewayConfigService;
}

describe('SttRequestMapperService', () => {
  it('mapRequest() includes model from config', () => {
    const svc = new SttRequestMapperService(makeConfigService('whisper-1'));
    const audio = Buffer.from('audio-bytes');
    const result = svc.mapRequest({ audio, contentType: 'audio/webm' });

    expect(result.model).toBe('whisper-1');
  });

  it('mapRequest() passes audio buffer through unchanged', () => {
    const svc = new SttRequestMapperService(makeConfigService());
    const audio = Buffer.from([0x00, 0x01, 0x02]);
    const result = svc.mapRequest({ audio, contentType: 'audio/mp4' });

    expect(result.audio).toBe(audio);
    expect(result.contentType).toBe('audio/mp4');
  });

  it('mapRequest() does NOT embed the provider API key in the request body', () => {
    const svc = new SttRequestMapperService(makeConfigService());
    const result = svc.mapRequest({ audio: Buffer.alloc(4), contentType: 'audio/webm' });

    expect((result as any).apiKey).toBeUndefined();
  });

  it('mapRequest() does not add mastery, difficulty, or AIM fields', () => {
    const svc = new SttRequestMapperService(makeConfigService());
    const result = svc.mapRequest({ audio: Buffer.alloc(4), contentType: 'audio/webm' });

    expect((result as any).mastery).toBeUndefined();
    expect((result as any).difficulty).toBeUndefined();
    expect((result as any).weakness).toBeUndefined();
  });

  it('mapRequest() uses the model name from config, not a hard-coded value', () => {
    const svcA = new SttRequestMapperService(makeConfigService('whisper-1'));
    const svcB = new SttRequestMapperService(makeConfigService('nova-2'));

    const audio = Buffer.alloc(1);
    expect(svcA.mapRequest({ audio, contentType: 'audio/webm' }).model).toBe('whisper-1');
    expect(svcB.mapRequest({ audio, contentType: 'audio/webm' }).model).toBe('nova-2');
  });
});
