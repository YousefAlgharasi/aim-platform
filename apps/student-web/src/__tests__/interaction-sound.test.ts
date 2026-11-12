import * as fs from 'fs';
import * as path from 'path';
import {
  __resetSoundForTests,
  holdUiSounds,
  isLearningAudioActive,
  isSoundEnabled,
  playSound,
  setSoundEnabled,
} from '../interaction/sound';

class FakeParam { value = 0; setValueAtTime = jest.fn(); exponentialRampToValueAtTime = jest.fn(); }
class FakeNode { gain = new FakeParam(); frequency = new FakeParam(); type = ''; onended: null | (() => void) = null; connect = jest.fn(); disconnect = jest.fn(); start = jest.fn(); stop = jest.fn(); }
let created = 0;
let oscillators = 0;
let ctxState: 'running' | 'suspended' = 'running';
class FakeAudioContext {
  currentTime = 0;
  destination = {};
  constructor() { created += 1; }
  get state() { return ctxState; }
  createGain() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
  createOscillator() { oscillators += 1; return new FakeNode(); }
  resume = jest.fn(() => Promise.resolve());
  close = jest.fn(() => Promise.resolve());
}

let now = 1_000_000;
beforeEach(() => {
  localStorage.clear();
  created = 0; oscillators = 0; ctxState = 'running';
  (window as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
  window.history.pushState({}, '', '/practice/abc');
  jest.spyOn(Date, 'now').mockImplementation(() => now);
  now += 60_000;
  __resetSoundForTests();
});
afterEach(() => jest.restoreAllMocks());

describe('UI sound effects', () => {
  test('are off by default and create no audio context', () => {
    expect(isSoundEnabled()).toBe(false);
    expect(playSound('correct')).toBe(false);
    window.dispatchEvent(new Event('pointerdown'));
    expect(created).toBe(0);
  });

  test('turning them on (a user gesture) starts audio and the choice persists', () => {
    setSoundEnabled(true);
    expect(created).toBe(1);
    expect(localStorage.getItem('aim-ui-sounds')).toBe('on');
    expect(playSound('correct')).toBe(true);
    __resetSoundForTests(); // "reload"
    expect(isSoundEnabled()).toBe(true);
    // After a reload nothing plays until the learner interacts with the page.
    expect(playSound('correct')).toBe(false);
    window.dispatchEvent(new Event('pointerdown'));
    now += 1000;
    expect(playSound('correct')).toBe(true);
  });

  test('muting stops everything and closes the context', () => {
    setSoundEnabled(true);
    setSoundEnabled(false);
    expect(localStorage.getItem('aim-ui-sounds')).toBe('off');
    expect(playSound('complete')).toBe(false);
  });

  test('blocked (suspended) audio stays silent without throwing', () => {
    setSoundEnabled(true);
    ctxState = 'suspended';
    expect(playSound('streak')).toBe(false);
  });

  test('no overlapping or rapid-fire cues', () => {
    setSoundEnabled(true);
    expect(playSound('complete')).toBe(true);
    const after = oscillators;
    expect(playSound('correct')).toBe(false); // same instant
    now += 300;
    expect(playSound('streak')).toBe(false); // previous cue still sounding
    expect(oscillators).toBe(after);
    now += 1000;
    expect(playSound('streak')).toBe(true);
  });

  test('stays silent while learning audio is active', () => {
    setSoundEnabled(true);
    const release = holdUiSounds(); // e.g. microphone recording
    expect(playSound('correct')).toBe(false);
    release();
    now += 1000;

    const synth = { speaking: true, pending: false };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    expect(isLearningAudioActive()).toBe(true);
    expect(playSound('correct')).toBe(false);
    synth.speaking = false;

    const audio = document.createElement('audio');
    Object.defineProperty(audio, 'paused', { value: false });
    document.body.appendChild(audio);
    expect(playSound('correct')).toBe(false);
    audio.remove();
    expect(playSound('correct')).toBe(true);
  });

  test('never plays on the voice, placement or assessment-attempt screens', () => {
    setSoundEnabled(true);
    for (const p of ['/voice-teacher', '/placement/test', '/assessments/a1/attempt/x']) {
      window.history.pushState({}, '', p);
      expect(playSound('correct')).toBe(false);
    }
  });
});

describe('assessment rules', () => {
  // Placement and assessments must not gain answer feedback: they may not use the feedback pieces at all.
  const dirs = ['placement', 'assessments'].map((d) => path.resolve(__dirname, '../features', d));
  const files = dirs.flatMap((dir) => fs.readdirSync(dir).filter((f) => /\.tsx?$/.test(f)).map((f) => path.join(dir, f)));

  test('placement and assessment screens do not import answer feedback or sounds', () => {
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      expect({ file, uses: /interaction|ResultIcon|playSound|useSoundOn|reportLearningCompleted/.test(src) }).toEqual({ file, uses: false });
    }
  });
});
