import { DEFAULT_VAD, Vad, concatFloat32, downsample, encodeWav, rmsOf, type VadEvent } from '../features/voice-teacher/liveVoiceEngine';

const FRAME = 80; // ms, about one 4096-sample buffer at 48 kHz
const LOUD = 0.2;
const QUIET = 0.003;

/** Feed `ms` of constant loudness and collect the events. */
function feed(vad: Vad, level: number, ms: number, aiSpeaking = false): VadEvent[] {
  const events: VadEvent[] = [];
  for (let t = 0; t < ms; t += FRAME) {
    const e = vad.process(level, FRAME, aiSpeaking);
    if (e) events.push(e);
  }
  return events;
}

describe('Vad: when the student starts and stops talking', () => {
  it('ignores a quiet room', () => {
    const vad = new Vad();
    expect(feed(vad, QUIET, 5000)).toEqual([]);
    expect(vad.talking).toBe(false);
  });

  it('hears a sentence start, and ends it after a short silence', () => {
    const vad = new Vad();
    feed(vad, QUIET, 800);
    expect(feed(vad, LOUD, 1600)).toEqual([{ type: 'speech-start', bargeIn: false }]);
    expect(vad.talking).toBe(true);
    // Not yet finished after a short pause...
    expect(feed(vad, QUIET, DEFAULT_VAD.endSilenceMs - 2 * FRAME)).toEqual([]);
    // ...finished once the silence is long enough.
    expect(feed(vad, QUIET, 3 * FRAME)).toEqual([{ type: 'speech-end', tooShort: false }]);
    expect(vad.talking).toBe(false);
  });

  it('does not cut a sentence at a short pause between words', () => {
    const vad = new Vad();
    feed(vad, QUIET, 800);
    feed(vad, LOUD, 800);
    expect(feed(vad, QUIET, 600)).toEqual([]);
    expect(feed(vad, LOUD, 800)).toEqual([]);
    expect(vad.talking).toBe(true);
  });

  it('marks a tiny burst (a click or cough) as too short to send', () => {
    const vad = new Vad();
    feed(vad, QUIET, 800);
    feed(vad, LOUD, 160);
    expect(feed(vad, QUIET, 2000)).toEqual([{ type: 'speech-end', tooShort: true }]);
  });

  it('ends a very long sentence at the limit instead of recording forever', () => {
    const vad = new Vad({ maxUtteranceMs: 5000 });
    feed(vad, QUIET, 800);
    const events = feed(vad, LOUD, 6000);
    // Cut at the limit; if the student is still talking, the next sentence starts right away.
    expect(events.slice(0, 2).map((e) => e.type)).toEqual(['speech-start', 'speech-end']);
  });

  it('learns a noisy room from the moment the mic opens, so steady noise is not mistaken for speech', () => {
    const vad = new Vad();
    vad.startCalibration();
    expect(feed(vad, 0.02, 8000)).toEqual([]); // steady hum above the quiet-room minimum
    expect(vad.threshold(false)).toBeGreaterThan(0.04);
    // Real speech is still louder than the hum.
    expect(feed(vad, 0.3, 800).map((e) => e.type)).toEqual(['speech-start']);
  });
});

describe('Vad: talking over the teacher', () => {
  it('needs a longer, louder burst while the teacher is speaking', () => {
    const vad = new Vad();
    feed(vad, QUIET, 800);
    // The teacher coming back through the speakers is not loud enough to count as the student.
    expect(feed(vad, vad.threshold(false) * 1.5, 3000, true)).toEqual([]);
    // A short loud burst is not enough either.
    expect(feed(vad, LOUD, 2 * FRAME, true)).toEqual([]);
  });

  it('lets the student interrupt with a clear, sustained voice', () => {
    const vad = new Vad();
    feed(vad, QUIET, 800);
    const events = feed(vad, LOUD, 1000, true);
    expect(events).toEqual([{ type: 'speech-start', bargeIn: true }]);
  });
});

describe('audio packaging', () => {
  it('measures loudness', () => {
    expect(rmsOf(new Float32Array(0))).toBe(0);
    expect(rmsOf(new Float32Array([0.5, -0.5, 0.5, -0.5]))).toBeCloseTo(0.5);
  });

  it('downsamples to 16 kHz and leaves already-low rates alone', () => {
    const input = new Float32Array(48000).fill(0.25);
    const out = downsample(input, 48000);
    expect(out.length).toBe(16000);
    expect(out[100]).toBeCloseTo(0.25);
    expect(downsample(input, 16000)).toBe(input);
  });

  it('writes a valid 16-bit mono WAV', async () => {
    const blob = encodeWav(new Float32Array([0, 1, -1, 2]), 16000);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(44 + 4 * 2);
    // Read it back with FileReader (jsdom's Blob has no arrayBuffer()).
    const buf = await new Promise<ArrayBuffer>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as ArrayBuffer);
      r.readAsArrayBuffer(blob);
    });
    const view = new DataView(buf);
    const tag = (o: number) => String.fromCharCode(view.getUint8(o), view.getUint8(o + 1), view.getUint8(o + 2), view.getUint8(o + 3));
    expect([tag(0), tag(8), tag(12), tag(36)]).toEqual(['RIFF', 'WAVE', 'fmt ', 'data']);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getInt16(44 + 2, true)).toBe(0x7fff); // 1 -> max
    expect(view.getInt16(44 + 4, true)).toBe(-0x8000); // -1 -> min
    expect(view.getInt16(44 + 6, true)).toBe(0x7fff); // 2 is clamped
  });

  it('joins chunks in order', () => {
    expect(Array.from(concatFloat32([new Float32Array([1, 2]), new Float32Array([3])]))).toEqual([1, 2, 3]);
  });
});
