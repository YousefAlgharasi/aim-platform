// Optional UI sound effects: a small family of soft, generated tones (Web Audio, no audio files).
//
// Rules this module enforces:
//   - Off by default; the choice is saved on this device.
//   - The audio context is only created/resumed from a user gesture, and only while sounds are on.
//   - Never plays over learning audio: speech synthesis, any playing <audio>/<video>, tracked players,
//     an active microphone recording, or the voice / placement / assessment screens.
//   - No overlapping or rapid-fire cues.
// Every cue is decoration: the same outcome is always shown on screen as text and an icon.

export type SoundCue = 'correct' | 'incorrect' | 'complete' | 'achievement' | 'streak' | 'milestone';

const KEY = 'aim-ui-sounds';
/** Screens whose own audio or assessment rules must never be touched by UI sounds. */
const QUIET_PATHS = /^\/(voice-teacher|placement|assessments\/[^/]+\/attempt)(\/|$)/;

interface Note { freq: number; at: number; dur: number; gain: number; partial?: number }
interface CueDef { notes: Note[] }

// Frequencies are plain equal-tempered notes; shapes are original to AIM (short sine "marimba" taps).
const CUES: Record<SoundCue, CueDef> = {
  correct: { notes: [
    { freq: 659.25, at: 0, dur: 0.16, gain: 0.5 },
    { freq: 987.77, at: 0.085, dur: 0.24, gain: 0.45 },
  ] },
  // A soft, low two-note fall. Deliberately quiet and round: information, not a buzzer.
  incorrect: { notes: [
    { freq: 311.13, at: 0, dur: 0.18, gain: 0.32 },
    { freq: 261.63, at: 0.1, dur: 0.26, gain: 0.28 },
  ] },
  complete: { notes: [
    { freq: 523.25, at: 0, dur: 0.18, gain: 0.42 },
    { freq: 659.25, at: 0.09, dur: 0.18, gain: 0.42 },
    { freq: 783.99, at: 0.18, dur: 0.2, gain: 0.42 },
    { freq: 1046.5, at: 0.28, dur: 0.42, gain: 0.4 },
  ] },
  achievement: { notes: [
    { freq: 587.33, at: 0, dur: 0.22, gain: 0.4, partial: 0.18 },
    { freq: 880.0, at: 0.11, dur: 0.24, gain: 0.4, partial: 0.18 },
    { freq: 1174.66, at: 0.22, dur: 0.5, gain: 0.36, partial: 0.18 },
  ] },
  streak: { notes: [
    { freq: 392.0, at: 0, dur: 0.16, gain: 0.4 },
    { freq: 523.25, at: 0.08, dur: 0.16, gain: 0.4 },
    { freq: 659.25, at: 0.16, dur: 0.18, gain: 0.4 },
    { freq: 783.99, at: 0.25, dur: 0.5, gain: 0.38, partial: 0.12 },
  ] },
  milestone: { notes: [
    { freq: 392.0, at: 0, dur: 0.16, gain: 0.4 },
    { freq: 523.25, at: 0.08, dur: 0.16, gain: 0.4 },
    { freq: 659.25, at: 0.16, dur: 0.18, gain: 0.4 },
    { freq: 783.99, at: 0.25, dur: 0.24, gain: 0.38 },
    { freq: 1046.5, at: 0.36, dur: 0.26, gain: 0.36, partial: 0.14 },
    { freq: 1318.51, at: 0.48, dur: 0.6, gain: 0.3, partial: 0.14 },
  ] },
};

const MASTER_GAIN = 0.16;
const MIN_GAP_MS = 140;

type Listener = () => void;
const listeners = new Set<Listener>();
let enabled = readEnabled();
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlockInstalled = false;
let busyUntil = 0;
let lastPlayedAt = 0;
let holds = 0;
const tracked = new Set<HTMLMediaElement>();

function readEnabled(): boolean {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
}

export function isSoundEnabled(): boolean { return enabled; }

export function subscribeSound(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function contextCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Create or resume the context. Only ever called from a user gesture. */
function unlock() {
  if (!enabled) return;
  try {
    if (!ctx) {
      const Ctor = contextCtor();
      if (!Ctor) return;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      // Take the edge off the top end so the tones stay soft on phone speakers.
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 3200;
      master.connect(lowpass);
      lowpass.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  } catch {
    ctx = null; master = null; // audio is unavailable; the UI is complete without it
  }
}

function installUnlock() {
  if (unlockInstalled || typeof window === 'undefined') return;
  unlockInstalled = true;
  const opts = { capture: true, passive: true } as const;
  window.addEventListener('pointerdown', unlock, opts);
  window.addEventListener('keydown', unlock, opts);
}

function removeUnlock() {
  if (!unlockInstalled || typeof window === 'undefined') return;
  unlockInstalled = false;
  window.removeEventListener('pointerdown', unlock, { capture: true });
  window.removeEventListener('keydown', unlock, { capture: true });
}

/** Turn UI sounds on or off. Call from a click/key handler so the browser allows audio to start. */
export function setSoundEnabled(next: boolean) {
  enabled = next;
  try { localStorage.setItem(KEY, next ? 'on' : 'off'); } catch { /* applies for this session only */ }
  if (next) {
    installUnlock();
    unlock();
  } else {
    removeUnlock();
    const old = ctx;
    ctx = null; master = null; busyUntil = 0;
    if (old) void old.close().catch(() => undefined);
  }
  listeners.forEach((l) => l());
}

/** Pause UI sounds while something important uses audio (e.g. a microphone recording). Returns the release. */
export function holdUiSounds(): () => void {
  holds += 1;
  let released = false;
  return () => { if (!released) { released = true; holds = Math.max(0, holds - 1); } };
}

/** Register a player that is not in the page (new Audio()) so UI sounds stay silent while it plays. */
export function trackLearningAudio(el: HTMLMediaElement) {
  tracked.add(el);
  const drop = () => tracked.delete(el);
  el.addEventListener('ended', drop, { once: true });
  el.addEventListener('error', drop, { once: true });
}

function isPlaying(el: HTMLMediaElement): boolean {
  return !el.paused && !el.ended;
}

/** True while pronunciation audio, listening exercises, text-to-speech or a recording is in use. */
export function isLearningAudioActive(): boolean {
  if (typeof window === 'undefined') return false;
  if (holds > 0) return true;
  if (QUIET_PATHS.test(window.location.pathname)) return true;
  const synth = window.speechSynthesis;
  if (synth && (synth.speaking || synth.pending)) return true;
  for (const el of Array.from(tracked)) if (isPlaying(el)) return true;
  const inPage = document.querySelectorAll<HTMLMediaElement>('audio, video');
  for (let i = 0; i < inPage.length; i += 1) if (isPlaying(inPage[i])) return true;
  return false;
}

/**
 * Play a cue if sounds are on, audio is allowed, nothing important is playing and no other cue is sounding.
 * Returns whether it was actually scheduled. Never throws.
 */
export function playSound(cue: SoundCue): boolean {
  if (!enabled || !ctx || !master) return false;
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return false;
  if (ctx.state !== 'running') {
    // Blocked or suspended by the browser: stay silent; the next user gesture resumes it.
    return false;
  }
  if (isLearningAudioActive()) return false;

  const def = CUES[cue];
  const nowMs = Date.now();
  if (nowMs - lastPlayedAt < MIN_GAP_MS) return false;
  // One cue at a time: never layer a new cue over one that is still sounding.
  if (nowMs < busyUntil) return false;

  try {
    const t0 = ctx.currentTime + 0.01;
    let end = 0;
    for (const n of def.notes) {
      tap(ctx, master, n.freq, t0 + n.at, n.dur, n.gain);
      if (n.partial) tap(ctx, master, n.freq * 2, t0 + n.at, n.dur * 0.7, n.gain * n.partial);
      end = Math.max(end, n.at + n.dur);
    }
    lastPlayedAt = nowMs;
    busyUntil = nowMs + end * 1000;
    return true;
  } catch {
    return false;
  }
}

/** One soft tap: sine, 8ms attack, exponential decay. Nodes disconnect themselves when done. */
function tap(ac: AudioContext, out: AudioNode, freq: number, at: number, dur: number, gain: number) {
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env);
  env.connect(out);
  osc.onended = () => { osc.disconnect(); env.disconnect(); };
  osc.start(at);
  osc.stop(at + dur + 0.03);
}

// Returning learners who already turned sounds on: wait for their first gesture, then audio is ready.
if (enabled) installUnlock();

/** Cue for a backend verdict; null when the server sent none. */
export function resultCue(verdict: boolean | null | undefined): SoundCue | null {
  if (verdict == null) return null;
  return verdict ? 'correct' : 'incorrect';
}

/** Milliseconds until the cue that is sounding now has finished (0 when silent). */
export function soundBusyForMs(): number {
  return Math.max(0, busyUntil - Date.now());
}

/** Test hook: forget all module state. */
export function __resetSoundForTests() {
  removeUnlock();
  ctx = null; master = null; busyUntil = 0; lastPlayedAt = 0; holds = 0;
  tracked.clear();
  enabled = readEnabled();
  if (enabled) installUnlock();
}
