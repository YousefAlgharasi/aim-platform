import { spawnSync } from 'child_process';
import { EventEmitter } from 'events';
import { PassThrough } from 'stream';

import { buildWav, parseWav } from '../../wav-audio.util';
import { AudioTranscodeError, AudioTranscoderService, SpawnFn } from '../audio-transcoder.service';
import { estimateMp3DurationMs, looksLikeMp3 } from '../mp3-audio.util';
import { makeMp3, makeWav } from './fakes';

type Behaviour =
  | { kind: 'output'; data: Buffer; code?: number }
  | { kind: 'enoent' }
  | { kind: 'hang' };

/** A child process double: replays `behaviour` once its stdin is closed. */
function fakeSpawn(behaviour: Behaviour) {
  const calls: string[][] = [];
  const kills: string[] = [];
  const spawn = ((_cmd: string, args: string[]) => {
    calls.push(args);
    const child = new EventEmitter() as EventEmitter & { stdin: PassThrough; stdout: PassThrough; stderr: PassThrough; kill: (s: string) => void };
    child.stdin = new PassThrough();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = (signal: string) => kills.push(signal);
    child.stdin.on('finish', () => {
      if (behaviour.kind === 'enoent') {
        child.emit('error', Object.assign(new Error('spawn ffmpeg ENOENT'), { code: 'ENOENT' }));
      } else if (behaviour.kind === 'output') {
        child.stdout.write(behaviour.data);
        child.stdout.end();
        child.emit('close', behaviour.code ?? 0);
      }
    });
    child.stdin.resume();
    return child;
  }) as unknown as SpawnFn;
  return { spawn, calls, kills };
}

const reasonOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error instanceof AudioTranscodeError ? error.reason : 'other';
  }
  return 'resolved';
};

describe('AudioTranscoderService', () => {
  describe('wavToMp3', () => {
    it('returns the encoder output when it is a valid MP3 stream', async () => {
      const mp3 = makeMp3(3);
      const { spawn, calls } = fakeSpawn({ kind: 'output', data: mp3 });
      const out = await new AudioTranscoderService(spawn).wavToMp3(makeWav());
      expect(out.equals(mp3)).toBe(true);
      expect(calls[0]).toEqual(expect.arrayContaining(['libmp3lame', '48k', '24000', '-ac', '1']));
    });

    it('reports a missing ffmpeg binary as unavailable', async () => {
      const { spawn } = fakeSpawn({ kind: 'enoent' });
      expect(await reasonOf(new AudioTranscoderService(spawn).wavToMp3(makeWav()))).toBe('unavailable');
    });

    it('reports a non-zero ffmpeg exit as failed', async () => {
      const { spawn } = fakeSpawn({ kind: 'output', data: Buffer.alloc(0), code: 1 });
      expect(await reasonOf(new AudioTranscoderService(spawn).wavToMp3(makeWav()))).toBe('failed');
    });

    it('rejects output that is not a complete MP3 stream', async () => {
      const truncated = makeMp3(3).subarray(0, 300);
      for (const data of [Buffer.from('garbage'), truncated, Buffer.alloc(0)]) {
        const { spawn } = fakeSpawn({ kind: 'output', data });
        expect(await reasonOf(new AudioTranscoderService(spawn).wavToMp3(makeWav()))).toBe('invalid_output');
      }
    });

    it('rejects empty or non-WAV input without starting ffmpeg', async () => {
      const { spawn, calls } = fakeSpawn({ kind: 'output', data: makeMp3() });
      const svc = new AudioTranscoderService(spawn);
      expect(await reasonOf(svc.wavToMp3(Buffer.alloc(0)))).toBe('invalid_input');
      expect(await reasonOf(svc.wavToMp3(Buffer.from('not a wav file at all')))).toBe('invalid_input');
      expect(calls).toHaveLength(0);
    });

    it('kills a hung ffmpeg and reports a timeout', async () => {
      jest.useFakeTimers();
      try {
        const { spawn, kills } = fakeSpawn({ kind: 'hang' });
        const pending = reasonOf(new AudioTranscoderService(spawn).wavToMp3(makeWav()));
        await jest.advanceTimersByTimeAsync(20_001);
        expect(await pending).toBe('timeout');
        expect(kills).toEqual(['SIGKILL']);
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('mp3ToWav', () => {
    it('rewrites streamed placeholder sizes so the WAV header is exact', async () => {
      const wav = makeWav(5, 1000);
      const streamed = Buffer.from(wav);
      streamed.writeUInt32LE(0xffffffff, 4);
      streamed.writeUInt32LE(0xffffffff, 40);
      const { spawn } = fakeSpawn({ kind: 'output', data: streamed });

      const out = await new AudioTranscoderService(spawn).mp3ToWav(makeMp3());
      expect(out.readUInt32LE(4)).toBe(out.length - 8);
      expect(out.readUInt32LE(40)).toBe(1000);
      expect(parseWav(out).data.length).toBe(1000);
    });

    it('rejects invalid MP3 input and non-WAV output', async () => {
      const ok = fakeSpawn({ kind: 'output', data: makeWav() });
      expect(await reasonOf(new AudioTranscoderService(ok.spawn).mp3ToWav(Buffer.from('nope')))).toBe('invalid_input');
      expect(ok.calls).toHaveLength(0);

      const bad = fakeSpawn({ kind: 'output', data: Buffer.from('not wav') });
      expect(await reasonOf(new AudioTranscoderService(bad.spawn).mp3ToWav(makeMp3()))).toBe('invalid_output');
    });
  });

  it('isAvailable reflects whether ffmpeg runs and has libmp3lame', async () => {
    expect(await new AudioTranscoderService(fakeSpawn({ kind: 'enoent' }).spawn).isAvailable()).toBe(false);
    expect(await new AudioTranscoderService(fakeSpawn({ kind: 'output', data: Buffer.from(' A....D aac') }).spawn).isAvailable()).toBe(false);
    expect(
      await new AudioTranscoderService(fakeSpawn({ kind: 'output', data: Buffer.from(' A....D libmp3lame  MP3') }).spawn).isAvailable(),
    ).toBe(true);
  });
});

// Runs against the real binary wherever it is installed (the production image); skipped elsewhere.
const hasFfmpeg = spawnSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout?.includes('libmp3lame') ?? false;

(hasFfmpeg ? describe : describe.skip)('AudioTranscoderService with the real ffmpeg', () => {
  /** 2 s of a 440 Hz tone, 24 kHz mono 16-bit: the provider's format. */
  const toneWav = () => {
    const rate = 24000;
    const pcm = Buffer.alloc(rate * 2 * 2);
    for (let i = 0; i < rate * 2; i += 1) pcm.writeInt16LE(Math.round(8000 * Math.sin((2 * Math.PI * 440 * i) / rate)), i * 2);
    const fmt = Buffer.alloc(16);
    fmt.writeUInt16LE(1, 0);
    fmt.writeUInt16LE(1, 2);
    fmt.writeUInt32LE(rate, 4);
    fmt.writeUInt32LE(rate * 2, 8);
    fmt.writeUInt16LE(2, 12);
    fmt.writeUInt16LE(16, 14);
    return buildWav(fmt, pcm);
  };

  it('encodes WAV to a much smaller MP3 of the same length and decodes it back', async () => {
    const svc = new AudioTranscoderService();
    expect(await svc.isAvailable()).toBe(true);

    const wav = toneWav();
    const mp3 = await svc.wavToMp3(wav);
    expect(looksLikeMp3(mp3)).toBe(true);
    expect(mp3.length).toBeLessThan(wav.length / 6);
    expect(Math.abs(estimateMp3DurationMs(mp3) - 2000)).toBeLessThan(120);

    const back = await svc.mp3ToWav(mp3);
    const { data } = parseWav(back);
    expect(back.readUInt32LE(4)).toBe(back.length - 8);
    expect(Math.abs(data.length / 2 / 24000 - 2)).toBeLessThan(0.1);
  });
});
