/**
 * Theme contrast guard. Reads the semantic tokens straight from src/styles/tokens.css and asserts
 * WCAG 2.2 AA for the foreground/background pairs the UI actually uses, in BOTH themes.
 *   text >= 4.5:1   |   large text, icons and input borders >= 3:1
 * If you change a colour in tokens.css and this fails, the new colour is not accessible.
 */
import fs from 'fs';
import path from 'path';

const css = fs.readFileSync(path.join(__dirname, '../styles/tokens.css'), 'utf8');

function block(selector: RegExp): string {
  const m = css.match(selector);
  if (!m) throw new Error('block not found: ' + selector);
  const start = css.indexOf('{', m.index!) + 1;
  let depth = 1, i = start;
  while (depth > 0) { const c = css[i++]; if (c === '{') depth++; else if (c === '}') depth--; }
  return css.slice(start, i - 1);
}

const rootBlock = block(/^:root\s*{/m);
const darkBlock = block(/^\.dark\s*{/m);

function vars(b: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of b.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const primitives = vars(rootBlock);

/** Resolve --c-* (possibly var(--p-*)) to [r,g,b]. */
function resolver(overrides: Record<string, string>) {
  const all = { ...vars(rootBlock), ...overrides };
  const get = (name: string): [number, number, number] => {
    let v = all[name];
    if (v === undefined) throw new Error('missing token --' + name);
    for (let guard = 0; guard < 6 && v.startsWith('var('); guard++) v = all[v.slice(6, -1)];
    const parts = v.split(/\s+/).map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) throw new Error(`token --${name} is not an RGB triplet: ${v}`);
    return parts as [number, number, number];
  };
  return get;
}
const light = resolver({});
const dark = resolver(vars(darkBlock));

const lum = ([r, g, b]: number[]) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

type Pair = [fg: string, bg: string, min: number, note: string];
const surfaces = ['page', 'surface', 'surface-muted', 'surface-sunken'];

const PAIRS: Pair[] = [
  // Body text on every surface
  ...surfaces.flatMap((s): Pair[] => [
    ['ink', s, 4.5, 'primary text'],
    ['ink-soft', s, 4.5, 'secondary text'],
    ['ink-muted', s, 4.5, 'muted text / placeholders'],
    ['ink-faint', s, 3, 'non-text icons'],
    ['brand-ink', s, 4.5, 'brand text'],
    ['secondary-ink', s, 4.5, 'secondary brand text'],
    ['accent-ink', s, 4.5, 'accent text'],
    ['success-ink', s, 4.5, 'success text'],
    ['warning-ink', s, 4.5, 'warning text'],
    ['danger-ink', s, 4.5, 'error text'],
    ['info-ink', s, 4.5, 'info text'],
  ]),
  // Tinted status / brand backgrounds with their ink
  ['brand-ink', 'brand-soft', 4.5, 'brand text on soft brand'],
  ['secondary-ink', 'secondary-soft', 4.5, 'secondary on soft'],
  ['accent-ink', 'accent-soft', 4.5, 'accent on soft'],
  ['success-ink', 'success-soft', 4.5, 'success on soft'],
  ['warning-ink', 'warning-soft', 4.5, 'warning on soft'],
  ['danger-ink', 'danger-soft', 4.5, 'error on soft'],
  ['info-ink', 'info-soft', 4.5, 'info on soft'],
  // Filled buttons / chips
  ['on-brand', 'brand', 4.5, 'white on primary button'],
  ['on-brand', 'brand-hover', 4.5, 'white on primary hover'],
  ['on-brand', 'brand-active', 4.5, 'white on primary active'],
  ['on-brand', 'secondary', 4.5, 'white on secondary fill'],
  ['on-brand', 'success', 4.5, 'white on success fill'],
  ['on-brand', 'danger', 4.5, 'white on danger fill'],
  ['on-brand', 'warning', 4.5, 'white on warning fill'],
  ['on-brand', 'info', 4.5, 'white on info fill'],
  // UI components (non-text): input borders, focus ring, status fills against surfaces
  ['line-strong', 'surface', 3, 'input border on card'],
  ['line-strong', 'field', 3, 'input border on field'],
  ['focus', 'surface', 3, 'focus ring on card'],
  ['focus', 'page', 3, 'focus ring on page'],
  ['gold', 'surface', 3, 'streak / rating icon'],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (_name, get) => {
  it.each(PAIRS)('%s on %s ≥ %d:1 (%s)', (fg, bg, min) => {
    expect(ratio(get('c-' + fg), get('c-' + bg))).toBeGreaterThanOrEqual(min);
  });
});


// ── Combinations found by auditing the rendered app ────────────────────────────
const blend = (top: number[], a: number, bottom: number[]) => top.map((c, i) => c * a + bottom[i] * (1 - a));

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme: rendered combinations', (_name, get) => {
  it('white text on a translucent dark chip (bg-black/20) over BOTH brand gradient ends', () => {
    for (const end of ['c-brand', 'c-secondary']) {
      const chip = blend([0, 0, 0], 0.2, get(end));
      expect(ratio(get('c-on-brand'), chip)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('brand-coloured text on a white button (AI Teacher / hero buttons)', () => {
    expect(ratio(get('c-brand'), get('c-on-brand'))).toBeGreaterThanOrEqual(4.5);
  });
  it('placeholders and muted text on the input field and strong surfaces', () => {
    expect(ratio(get('c-ink-muted'), get('c-field'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(get('c-ink-muted'), get('c-surface-strong'))).toBeGreaterThanOrEqual(4.5);
    expect(ratio(get('c-ink'), get('c-field'))).toBeGreaterThanOrEqual(4.5);
  });
  it('disabled controls stay legible (>= 3:1) while remaining visibly different from enabled ones', () => {
    expect(ratio(get('c-ink-disabled'), get('c-disabled'))).toBeGreaterThanOrEqual(3);
    // ...and a disabled button is not mistaken for an enabled primary one
    expect(ratio(get('c-disabled'), get('c-brand'))).toBeGreaterThan(1.5);
  });
  it('input and switch boundaries are visible against the page', () => {
    expect(ratio(get('c-line-strong'), get('c-page'))).toBeGreaterThanOrEqual(3);
  });
  it('active controls stay distinguishable from their surface', () => {
    // switch ON: the fill is the brand colour; in dark it also gets a brand-ink outline (see ThemeSwitch)
    expect(ratio(get('c-brand-ink'), get('c-surface'))).toBeGreaterThanOrEqual(3);
  });
});

describe('light theme only', () => {
  it('switch ON fill against a white card', () => {
    expect(ratio(light('c-brand'), light('c-surface'))).toBeGreaterThanOrEqual(3);
  });
});

describe('brand identity', () => {
  it('uses the AIM brand colours', () => {
    const hex = (t: number[]) => '#' + t.map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase();
    expect(hex(light('c-brand'))).toBe('#4762EE');
    expect(hex(light('c-secondary'))).toBe('#8455E4');
    expect(hex(light('c-accent'))).toBe('#15A898');
  });
  it('defines every semantic token for both themes (dark must not lose one)', () => {
    const lightNames = Object.keys(vars(rootBlock)).filter((n) => n.startsWith('c-'));
    const darkNames = Object.keys(vars(darkBlock));
    const exempt = new Set<string>(); // tokens that intentionally keep the light value in dark
    const missing = lightNames.filter((n) => !darkNames.includes(n) && !exempt.has(n));
    expect(missing).toEqual([]);
  });
  it('keeps raw colours out of the semantic layer', () => {
    for (const [n, v] of Object.entries(vars(rootBlock))) {
      if (n.startsWith('c-')) expect(v).toMatch(/^var\(--p-[\w-]+\)$/);
    }
    expect(Object.keys(primitives).some((n) => n.startsWith('p-'))).toBe(true);
  });
});
