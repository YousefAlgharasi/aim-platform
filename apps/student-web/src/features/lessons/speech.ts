/** Browser text-to-speech for lesson items (free, instant, no server audio quota). */

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

const LETTER_NAMES: Record<string, string> = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'el', m: 'em',
  n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
};

function englishVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(v => v.lang === 'en-US' && v.localService) ?? voices.find(v => v.lang.startsWith('en-US')) ?? voices.find(v => v.lang.startsWith('en'));
}

/** Clean a lesson token for the voice: drop punctuation/markdown; a lone letter is read by its name ("A" -> "ay"). */
export function toSpoken(text: string, isolated: boolean): string {
  const clean = text.replace(/[*_`#"“”.,!?;:()]/g, '').trim();
  if (isolated && /^[A-Za-z]$/.test(clean)) return LETTER_NAMES[clean.toLowerCase()];
  return clean;
}

/** Speak one item; resolves when it finishes or is interrupted. Starting a new one cancels the previous. */
export function speakItem(text: string, isolated: boolean): Promise<void> {
  return new Promise(resolve => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(toSpoken(text, isolated));
    u.lang = 'en-US';
    u.rate = 0.85;
    const v = englishVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

/** Speak a whole sentence (a line of a dialogue) with a chosen pitch; resolves when it ends or is interrupted. */
export function speakLine(text: string, opts: { pitch?: number; rate?: number } = {}): Promise<void> {
  return new Promise(resolve => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(toSpoken(text, false));
    u.lang = 'en-US';
    u.rate = opts.rate ?? 0.9;
    u.pitch = opts.pitch ?? 1;
    const v = englishVoice();
    if (v) u.voice = v;
    // Some browsers (or machines with no voices installed) never report the end; never leave the caller waiting forever.
    const watchdog = window.setTimeout(resolve, 3000 + text.length * 110);
    const done = () => { window.clearTimeout(watchdog); resolve(); };
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
  });
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
