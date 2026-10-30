import { spawn as nodeSpawn } from 'child_process';
import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';

import { parseWav } from '../wav-audio.util';
import { looksLikeMp3 } from './mp3-audio.util';

/**
 * Speech MP3 settings, verified against the stored Orpheus clips: mono, the provider's native 24 kHz
 * (no resampling), 48 kbps CBR. About 8x smaller than the provider's WAV with transcripts unchanged.
 */
export const MP3_ENCODE_ARGS = ['-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '48k'] as const;
export const MP3_MIME = 'audio/mpeg';

const FFMPEG_BIN = process.env.FFMPEG_PATH || 'ffmpeg';
const TIMEOUT_MS = 20_000;
/** Generous for minutes of speech in either direction; protects memory from a runaway process. */
const MAX_OUTPUT_BYTES = 50 * 1024 * 1024;

export type AudioTranscodeFailure = 'unavailable' | 'invalid_input' | 'failed' | 'invalid_output' | 'timeout';

export class AudioTranscodeError extends Error {
  constructor(readonly reason: AudioTranscodeFailure) {
    super(`Audio transcoding failed: ${reason}`);
    this.name = 'AudioTranscodeError';
  }
}

export type SpawnFn = typeof nodeSpawn;
/** Lets tests substitute the process launcher; production uses child_process.spawn. */
export const TRANSCODER_SPAWN = Symbol('TRANSCODER_SPAWN');

/**
 * WAV <-> MP3 through the ffmpeg binary in the runtime image, using stdin/stdout pipes (no temp files).
 * Every result is validated before it is returned, so a caller never stores or serves a broken file.
 */
@Injectable()
export class AudioTranscoderService implements OnModuleInit {
  private readonly logger = new Logger(AudioTranscoderService.name);
  private readonly spawn: SpawnFn;

  constructor(@Optional() @Inject(TRANSCODER_SPAWN) spawn?: SpawnFn) {
    this.spawn = spawn ?? nodeSpawn;
  }

  async onModuleInit(): Promise<void> {
    if (await this.isAvailable()) {
      this.logger.log('AudioTranscoderService: ffmpeg with libmp3lame is available');
    } else {
      this.logger.error('AudioTranscoderService: ffmpeg/libmp3lame NOT available; new TTS audio cannot be stored as MP3');
    }
  }

  /** True when ffmpeg runs and has the MP3 encoder. */
  async isAvailable(): Promise<boolean> {
    try {
      const out = await this.run(['-hide_banner', '-encoders'], Buffer.alloc(0));
      return out.toString('utf8').includes('libmp3lame');
    } catch {
      return false;
    }
  }

  async wavToMp3(wav: Buffer): Promise<Buffer> {
    if (!wav || wav.length === 0) throw new AudioTranscodeError('invalid_input');
    try {
      parseWav(wav);
    } catch {
      throw new AudioTranscodeError('invalid_input');
    }
    const mp3 = await this.run(
      ['-v', 'error', '-f', 'wav', '-i', 'pipe:0', '-map_metadata', '-1', ...MP3_ENCODE_ARGS, '-id3v2_version', '0', '-f', 'mp3', 'pipe:1'],
      wav,
    );
    if (!looksLikeMp3(mp3)) throw new AudioTranscodeError('invalid_output');
    return mp3;
  }

  /** For clients that have not opted into MP3: same speech, PCM WAV at the source rate. */
  async mp3ToWav(mp3: Buffer): Promise<Buffer> {
    if (!mp3 || mp3.length === 0 || !looksLikeMp3(mp3)) throw new AudioTranscodeError('invalid_input');
    const piped = await this.run(
      ['-v', 'error', '-f', 'mp3', '-i', 'pipe:0', '-map_metadata', '-1', '-fflags', '+bitexact', '-ac', '1', '-ar', '24000', '-c:a', 'pcm_s16le', '-f', 'wav', 'pipe:1'],
      mp3,
    );
    const wav = this.withExactRiffSize(piped);
    try {
      parseWav(wav);
    } catch {
      throw new AudioTranscodeError('invalid_output');
    }
    return wav;
  }

  /**
   * ffmpeg cannot seek back on a pipe, so streamed WAV headers carry placeholder sizes. Rewrite the RIFF
   * and data chunk sizes to the real values so strict players (and our own WAV checks) accept the file.
   */
  private withExactRiffSize(wav: Buffer): Buffer {
    if (wav.length < 12 || wav.toString('latin1', 0, 4) !== 'RIFF') return wav;
    const fixed = Buffer.from(wav);
    fixed.writeUInt32LE(fixed.length - 8, 4);
    let offset = 12;
    while (offset + 8 <= fixed.length) {
      const id = fixed.toString('latin1', offset, offset + 4);
      if (id === 'data') {
        fixed.writeUInt32LE(fixed.length - offset - 8, offset + 4);
        break;
      }
      offset += 8 + fixed.readUInt32LE(offset + 4);
    }
    return fixed;
  }

  private run(args: readonly string[], input: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      let child: ReturnType<SpawnFn>;
      try {
        child = this.spawn(FFMPEG_BIN, [...args], { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch {
        reject(new AudioTranscodeError('unavailable'));
        return;
      }

      const chunks: Buffer[] = [];
      let size = 0;
      let settled = false;
      const finish = (error: AudioTranscodeError | null, value?: Buffer) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) {
          child.kill('SIGKILL');
          reject(error);
        } else {
          resolve(value as Buffer);
        }
      };
      const timer = setTimeout(() => finish(new AudioTranscodeError('timeout')), TIMEOUT_MS);

      child.on('error', (err: NodeJS.ErrnoException) => finish(new AudioTranscodeError(err.code === 'ENOENT' ? 'unavailable' : 'failed')));
      child.stdout?.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_OUTPUT_BYTES) finish(new AudioTranscodeError('failed'));
        else chunks.push(chunk);
      });
      // stderr is drained so ffmpeg never blocks on a full pipe; its text is not logged (it can echo input).
      child.stderr?.on('data', () => undefined);
      child.on('close', (code) => {
        if (code === 0) finish(null, Buffer.concat(chunks));
        else finish(new AudioTranscodeError('failed'));
      });

      // EPIPE when ffmpeg exits early is reported through 'close'.
      child.stdin?.on('error', () => undefined);
      child.stdin?.end(input);
    });
  }
}
