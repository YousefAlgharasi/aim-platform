import { acceptsMp3, TtsAudioDeliveryService } from '../tts-audio-delivery.service';
import { FakeTranscoder, makeMp3, makeWav } from './fakes';

describe('acceptsMp3', () => {
  it.each([
    ['audio/mpeg', true],
    ['audio/mpeg, audio/wav;q=0.5', true],
    ['audio/wav;q=0.9, AUDIO/MP3', true],
    ['audio/mpeg;q=0.4', true],
    ['audio/mpeg;q=0', false],
    ['*/*', false], // generic clients, including app versions that save every clip as .wav
    ['audio/*', false],
    ['application/json', false],
    [undefined, false],
    ['', false],
  ])('%s -> %s', (accept, expected) => {
    expect(acceptsMp3(accept)).toBe(expected);
  });
});

describe('TtsAudioDeliveryService', () => {
  const mp3Audio = () => ({ data: makeMp3(4), contentType: 'audio/mpeg' });

  it('sends the stored MP3 to clients that ask for it, without decoding', async () => {
    const transcoder = new FakeTranscoder();
    const audio = mp3Audio();
    const out = await new TtsAudioDeliveryService(transcoder as any).forClient(audio, 'audio/mpeg, audio/wav;q=0.5');
    expect(out).toBe(audio);
    expect(transcoder.mp3ToWavCalls).toBe(0);
  });

  it('sends WAV to clients that did not opt in, decoding each clip only once', async () => {
    const transcoder = new FakeTranscoder();
    const svc = new TtsAudioDeliveryService(transcoder as any);
    const audio = mp3Audio();

    const first = await svc.forClient(audio, undefined);
    const second = await svc.forClient({ ...audio }, 'application/json');
    expect(first.contentType).toBe('audio/wav');
    expect(second.data).toBe(first.data);
    expect(transcoder.mp3ToWavCalls).toBe(1);
  });

  it('falls back to the MP3 when decoding fails rather than failing the request', async () => {
    const transcoder = new FakeTranscoder();
    transcoder.failWith = 'unavailable';
    const audio = mp3Audio();
    expect(await new TtsAudioDeliveryService(transcoder as any).forClient(audio, undefined)).toBe(audio);
  });

  it('passes WAV assets through untouched for every client', async () => {
    const transcoder = new FakeTranscoder();
    const wav = { data: makeWav(), contentType: 'audio/wav' };
    const svc = new TtsAudioDeliveryService(transcoder as any);
    expect(await svc.forClient(wav, undefined)).toBe(wav);
    expect(await svc.forClient(wav, 'audio/mpeg')).toBe(wav);
    expect(transcoder.mp3ToWavCalls).toBe(0);
  });

  it('send() sets the delivered type and Vary: Accept', async () => {
    const headers: Record<string, string> = {};
    let body: Buffer | undefined;
    interface FakeRes {
      status: jest.Mock;
      set: jest.Mock;
      send: jest.Mock;
    }
    const res: FakeRes = {
      status: jest.fn(() => res),
      set: jest.fn((name: string, value: string) => {
        headers[name] = value;
        return res;
      }),
      send: jest.fn((data: Buffer) => {
        body = data;
      }),
    };
    await new TtsAudioDeliveryService(new FakeTranscoder() as any).send(res as any, mp3Audio(), 'audio/mpeg');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(headers).toEqual({ 'Content-Type': 'audio/mpeg', Vary: 'Accept' });
    expect(body && body.length).toBeGreaterThan(0);
  });
});
