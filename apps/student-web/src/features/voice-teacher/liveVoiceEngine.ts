// The pure part of the live conversation: deciding when the student starts and stops talking, and packaging one
// spoken sentence as audio the backend accepts. No browser audio APIs here, so it can be tested with plain numbers.

export interface VadOptions {
  /** A burst this long (ms) counts as the student starting to talk. */
  startMs: number;
  /** The same, while the teacher is speaking (stricter, so the teacher's own voice coming back is not mistaken for the student). */
  bargeInStartMs: number;
  /** This much quiet (ms) after talking means the student finished. */
  endSilenceMs: number;
  /** Sentences shorter than this (ms of actual talking) are noise, not speech. */
  minSpeechMs: number;
  /** One sentence never lasts longer than this (ms). */
  maxUtteranceMs: number;
  /** Quietest level that can count as speech (0..1 RMS). */
  minLevel: number;
  /** Speech must be this many times louder than the background noise. */
  noiseFactor: number;
  /** While the teacher is speaking the student must be this much louder to interrupt. */
  bargeInFactor: number;
  /** After the mic opens, this long (ms) is spent only learning the room's background noise level. */
  calibrationMs: number;
}

export const DEFAULT_VAD: VadOptions = {
  startMs: 120,
  bargeInStartMs: 380,
  endSilenceMs: 1100,
  minSpeechMs: 350,
  maxUtteranceMs: 60_000,
  minLevel: 0.012,
  noiseFactor: 2.8,
  bargeInFactor: 2.2,
  calibrationMs: 600,
};

export type VadEvent =
  | { type: 'speech-start'; bargeIn: boolean }
  | { type: 'speech-end'; tooShort: boolean };

/**
 * Frame-by-frame voice activity detection. Feed it the loudness (RMS, 0..1) of each audio frame with the frame
 * length; it answers with "the student started talking" / "the student finished". It learns the background noise
 * level while nobody talks, so a noisy room does not keep it open.
 */
export class Vad {
  private readonly o: VadOptions;
  private inSpeech = false;
  private candidateMs = 0;
  private speechMs = 0;
  private silenceMs = 0;
  private totalMs = 0;
  private calibratedMs = 0;
  noiseFloor = 0.004;

  constructor(options: Partial<VadOptions> = {}) {
    this.o = { ...DEFAULT_VAD, ...options };
  }

  get talking(): boolean {
    return this.inSpeech;
  }

  /** The loudness a frame must exceed to count as speech right now. */
  threshold(aiSpeaking: boolean): number {
    const base = Math.max(this.o.minLevel, this.noiseFloor * this.o.noiseFactor);
    return aiSpeaking ? base * this.o.bargeInFactor : base;
  }

  /** Call when the mic opens: the next moment is used to learn how loud the room is, so steady noise is not taken for speech. */
  startCalibration(): void {
    this.calibratedMs = 0;
  }

  process(rms: number, frameMs: number, aiSpeaking: boolean): VadEvent | null {
    if (this.calibratedMs < this.o.calibrationMs) {
      this.calibratedMs += frameMs;
      this.noiseFloor = Math.min(0.05, Math.max(0.002, this.noiseFloor * 0.7 + rms * 0.3));
      return null;
    }
    const threshold = this.threshold(aiSpeaking);

    if (!this.inSpeech) {
      if (rms > threshold) {
        this.candidateMs += frameMs;
        const needed = aiSpeaking ? this.o.bargeInStartMs : this.o.startMs;
        if (this.candidateMs >= needed) {
          this.inSpeech = true;
          this.speechMs = this.candidateMs;
          this.silenceMs = 0;
          this.totalMs = this.candidateMs;
          this.candidateMs = 0;
          return { type: 'speech-start', bargeIn: aiSpeaking };
        }
      } else {
        this.candidateMs = Math.max(0, this.candidateMs - frameMs * 2);
        // Learn the room's background level only while it is quiet and the teacher is not talking.
        if (!aiSpeaking) this.noiseFloor = Math.min(0.05, Math.max(0.002, this.noiseFloor * 0.95 + rms * 0.05));
      }
      return null;
    }

    this.totalMs += frameMs;
    // A little hysteresis: once talking, slightly quieter frames still count, so short dips do not cut a sentence.
    if (rms > threshold * 0.7) {
      this.speechMs += frameMs;
      this.silenceMs = 0;
    } else {
      this.silenceMs += frameMs;
    }
    if (this.silenceMs >= this.o.endSilenceMs || this.totalMs >= this.o.maxUtteranceMs) {
      const tooShort = this.speechMs < this.o.minSpeechMs;
      this.reset();
      return { type: 'speech-end', tooShort };
    }
    return null;
  }

  /** Forget the current sentence (e.g. the mic was muted). */
  reset(): void {
    this.inSpeech = false;
    this.candidateMs = 0;
    this.speechMs = 0;
    this.silenceMs = 0;
    this.totalMs = 0;
  }
}

export function rmsOf(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

/** The sample rate sent to the backend: plenty for speech, and small (about 32 KB per second of talking). */
export const TARGET_SAMPLE_RATE = 16_000;

/** Linear-interpolation resampling to [TARGET_SAMPLE_RATE]. */
export function downsample(input: Float32Array, inputRate: number): Float32Array {
  if (inputRate <= TARGET_SAMPLE_RATE) return input;
  const ratio = inputRate / TARGET_SAMPLE_RATE;
  const length = Math.floor(input.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(i0 + 1, input.length - 1);
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i1] * frac;
  }
  return out;
}

/** 16-bit mono PCM WAV (audio/wav is accepted by the voice teacher backend). */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + bytes);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i)); };
  text(0, 'RIFF');
  view.setUint32(4, 36 + bytes, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, bytes, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export function concatFloat32(chunks: Float32Array[]): Float32Array {
  let length = 0;
  for (const c of chunks) length += c.length;
  const out = new Float32Array(length);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.length; }
  return out;
}
