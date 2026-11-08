// Reader-comfort settings kept on this device: text size and reduced motion.
export type FontScale = 'default' | 'large' | 'xlarge';
export interface DisplayPrefs { fontScale: FontScale; reduceMotion: boolean }

const KEY = 'aim-display-prefs';
const DEFAULTS: DisplayPrefs = { fontScale: 'default', reduceMotion: false };

export function readDisplayPrefs(): DisplayPrefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<DisplayPrefs> | null;
    const fontScale = raw?.fontScale === 'large' || raw?.fontScale === 'xlarge' ? raw.fontScale : 'default';
    return { fontScale, reduceMotion: raw?.reduceMotion === true };
  } catch {
    return DEFAULTS;
  }
}

/** Put the preferences on <html>; CSS (accessibility.css) does the rest. */
export function applyDisplayPrefs(prefs: DisplayPrefs = readDisplayPrefs()) {
  const el = document.documentElement;
  el.dataset.fontScale = prefs.fontScale;
  el.dataset.motion = prefs.reduceMotion ? 'reduce' : 'auto';
}

export function saveDisplayPrefs(prefs: DisplayPrefs) {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* applies for this session only */ }
  applyDisplayPrefs(prefs);
}
