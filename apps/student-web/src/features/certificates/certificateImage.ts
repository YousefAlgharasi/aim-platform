// Draws the certificate as a picture (landscape A4 at 150 dpi) so it can be previewed and saved as a PNG.
// Pure canvas drawing, no libraries. Everything printed on it comes from the data passed in; it never prints a link.

export const CERT_W = 1754;
export const CERT_H = 1240;

export interface CertificateImageData {
  /** Null when the account has no name; the line is left out. */
  studentName: string | null;
  courseTitle: string;
  /** Final mark out of 100, or null when there is no score yet. */
  scorePercent: number | null;
  /** Already formatted for the viewer's language, e.g. "6 November 2026". */
  issuedText: string;
  /** A short reference printed small at the bottom (not a link). */
  reference: string;
  /** Right-to-left layout (Arabic). */
  rtl: boolean;
  formatNumber: (n: number) => string;
  labels: {
    brand: string;
    title: string;
    presentedTo: string;
    forCompleting: string;
    finalScore: string;
    issued: string;
    reference: string;
  };
}

const FONT = '"IBM Plex Sans", "IBM Plex Sans Arabic", Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const INK = '#111827';
const MUTED = '#5B6475';
const BRAND = '#4762EE';
const GOLD = '#C8A24A';
const GOLD_DARK = '#8A6B1F';
const PAPER = '#FFFEFB';

type Ctx = CanvasRenderingContext2D;

const font = (weight: number, px: number) => `${weight} ${px}px ${FONT}`;

/** The biggest size (down to minPx) at which the text still fits in maxWidth; leaves the font set to it. */
function fit(ctx: Ctx, text: string, weight: number, maxPx: number, minPx: number, maxWidth: number): number {
  let px = maxPx;
  for (;;) {
    ctx.font = font(weight, px);
    if (px <= minPx || ctx.measureText(text).width <= maxWidth) return px;
    px -= 2;
  }
}

/** Splits text on spaces into at most maxLines lines no wider than maxWidth (the last line takes the rest). */
function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth && lines.length < maxLines - 1) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function setSpacing(ctx: Ctx, px: number) {
  // Letter spacing is not in every browser; the design reads fine without it.
  (ctx as unknown as { letterSpacing?: string }).letterSpacing = `${px}px`;
}

function star(ctx: Ctx, cx: number, cy: number, outer: number, inner: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** A gold seal with a star and two ribbon tails. */
function seal(ctx: Ctx, cx: number, cy: number) {
  // ribbon tails
  ctx.fillStyle = BRAND;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * 18, cy + 60);
    ctx.lineTo(cx + dir * 70, cy + 150);
    ctx.lineTo(cx + dir * 38, cy + 138);
    ctx.lineTo(cx + dir * 4, cy + 156);
    ctx.closePath();
    ctx.fill();
  }
  // scalloped edge
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  const teeth = 28;
  for (let i = 0; i < teeth * 2; i += 1) {
    const r = i % 2 === 0 ? 96 : 88;
    const a = (Math.PI / teeth) * i;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PAPER;
  star(ctx, cx, cy, 44, 18);
  ctx.fill();
}

/** Paints the whole certificate onto a CERT_W x CERT_H canvas context. */
export function drawCertificate(ctx: Ctx, d: CertificateImageData): void {
  const W = CERT_W;
  const H = CERT_H;
  const cx = W / 2;

  ctx.save();
  ctx.direction = d.rtl ? 'rtl' : 'ltr';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Paper, with a soft wash of brand colour in two corners.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.rect(46, 46, W - 92, H - 92);
  ctx.clip();
  ctx.fillStyle = 'rgba(71, 98, 238, 0.06)';
  for (const [x, y] of [[0, 0], [W, H]] as const) {
    ctx.beginPath();
    ctx.arc(x, y, 420, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Frame: a strong brand line outside, a fine gold line inside, gold squares at the corners.
  ctx.strokeStyle = BRAND;
  ctx.lineWidth = 10;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(76, 76, W - 152, H - 152);
  ctx.fillStyle = GOLD;
  for (const [x, y] of [[76, 76], [W - 76, 76], [76, H - 76], [W - 76, H - 76]] as const) {
    ctx.fillRect(x - 11, y - 11, 22, 22);
  }

  // Brand and title.
  ctx.fillStyle = BRAND;
  ctx.font = font(700, 54);
  setSpacing(ctx, d.rtl ? 0 : 2);
  ctx.fillText(d.labels.brand, cx, 188);
  ctx.fillStyle = GOLD_DARK;
  ctx.font = font(600, d.rtl ? 42 : 30);
  setSpacing(ctx, d.rtl ? 0 : 9);
  ctx.fillText(d.rtl ? d.labels.title : d.labels.title.toUpperCase(), cx, 262);
  setSpacing(ctx, 0);

  // Divider with a small star.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 280, 312);
  ctx.lineTo(cx - 36, 312);
  ctx.moveTo(cx + 36, 312);
  ctx.lineTo(cx + 280, 312);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  star(ctx, cx, 312, 15, 6);
  ctx.fill();

  // Who it is for.
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 32);
  ctx.fillText(d.labels.presentedTo, cx, 392);

  const name = d.studentName?.trim();
  if (name) {
    ctx.fillStyle = INK;
    fit(ctx, name, 600, 112, 54, 1280);
    ctx.fillText(name, cx, 520);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 460, 584);
    ctx.lineTo(cx + 460, 584);
    ctx.stroke();
  }

  // What for.
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 32);
  ctx.fillText(d.labels.forCompleting, cx, 648);

  ctx.fillStyle = BRAND;
  fit(ctx, d.courseTitle, 700, 72, 52, 1300);
  const lines = ctx.measureText(d.courseTitle).width <= 1300 ? [d.courseTitle] : wrap(ctx, d.courseTitle, 1300, 2);
  const titleBottom = 738 + (lines.length - 1) * 74;
  lines.forEach((line, i) => ctx.fillText(line, cx, 738 + i * 74));

  // Footer: date on one side, seal in the middle, score on the other (mirrored in right-to-left).
  const left = 400;
  const right = W - 400;
  const issuedX = d.rtl ? right : left;
  const scoreX = d.rtl ? left : right;
  const footerY = Math.max(990, titleBottom + 170);

  seal(ctx, cx, footerY - 50);

  const column = (x: number, label: string, value: string, valueColor: string, valuePx: number) => {
    ctx.fillStyle = MUTED;
    ctx.font = font(400, 26);
    ctx.fillText(label, x, footerY - 100);
    ctx.fillStyle = valueColor;
    fit(ctx, value, 600, valuePx, 28, 420);
    ctx.fillText(value, x, footerY - 22);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 200, footerY + 14);
    ctx.lineTo(x + 200, footerY + 14);
    ctx.stroke();
  };

  column(issuedX, d.labels.issued, d.issuedText, INK, 40);
  if (d.scorePercent != null) {
    // A left-to-right isolate keeps "73 / 100" in that order in Arabic too (otherwise it would read "100 / 73").
    column(scoreX, d.labels.finalScore, `\u2066${d.formatNumber(d.scorePercent)} / ${d.formatNumber(100)}\u2069`, BRAND, 60);
  }

  // Reference, small (never a link).
  ctx.fillStyle = MUTED;
  ctx.font = font(400, 22);
  setSpacing(ctx, d.rtl ? 0 : 1);
  ctx.fillText(`${d.labels.reference}: ${d.reference}`, cx, H - 104);
  setSpacing(ctx, 0);

  ctx.restore();
}

/** Makes sure the app fonts are loaded before drawing, so the picture never falls back to a default font. */
export async function loadCertificateFonts(): Promise<void> {
  const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
  if (!fonts?.load) return;
  try {
    await Promise.all([
      fonts.load(font(700, 54), 'AIM Aa'),
      fonts.load(font(600, 80), 'AIM Aa'),
      fonts.load(font(400, 32), 'AIM Aa'),
      fonts.load(font(600, 80), 'أ'),
    ]);
  } catch {
    // A font that fails to load only means a fallback font is used.
  }
}

/** A file-name-safe version of the course title, for the downloaded PNG. */
export function certificateFileName(courseTitle: string): string {
  const slug = courseTitle
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `certificate-${slug || 'course'}.png`;
}
