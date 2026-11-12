import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { buttonClasses } from '../../components/common/buttonStyles';
import { isFocusPath } from '../../layouts/focusMode';
import { tourById, tourForPath, type Tour, type TourStep } from './tours';
import { TOUR_START_EVENT, hasSeenTour, markTourSeen } from './tourStore';

const SPOT_PAD = 8;
const GAP = 14;
const MARGIN = 12;
const WAIT_MS = 8000;
/** Time constant of the glide (ms): the glow eases toward its target, so a move settles in about a third of a second. */
const GLIDE_MS = 90;

interface Glide { x: number; y: number; w: number; h: number; r: number; px: number; py: number; pw: number }

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return false;
  const cs = window.getComputedStyle(el);
  return cs.visibility !== 'hidden' && cs.display !== 'none';
}

/** First visible element for a step, or null (missing or hidden, e.g. the sidebar on a phone). */
function findTarget(selector: string): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return all.find(isVisible) ?? null;
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * The guided tour. Dims the page, puts a soft glow around one element at a time and shows a small card beside it.
 * The dimming is visual only (pointer-events: none), so navigation and the page itself stay usable.
 * Closing it any way, including leaving the page, counts as seen.
 */
export function GuidedTour() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const userId = user?.id;

  const [run, setRun] = useState<{ tour: Tour; steps: TourStep[] } | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const spotRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  /** Where the glow and the card are drawn right now; eased toward where they should be, every frame. */
  const glideRef = useRef<Glide | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const waitRef = useRef<number | null>(null);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const cancelWait = useCallback(() => {
    if (waitRef.current != null) { window.clearInterval(waitRef.current); waitRef.current = null; }
  }, []);

  /** Wait for the page to show the tour's first element, then start with only the steps that can be shown. */
  const begin = useCallback((tour: Tour) => {
    cancelWait();
    const startedAt = Date.now();
    waitRef.current = window.setInterval(() => {
      if (Date.now() - startedAt > WAIT_MS) { cancelWait(); return; }
      if (!tour.path.test(pathRef.current)) return;
      if (!findTarget(tour.steps[0].target) && !tour.steps.some((s) => findTarget(s.target))) return;
      // Give the rest of the page a moment to finish loading, then take stock.
      cancelWait();
      window.setTimeout(() => {
        if (!tour.path.test(pathRef.current)) return;
        const steps = tour.steps.filter((s) => findTarget(s.target));
        if (steps.length === 0) return;
        returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dirRef.current = 1;
        glideRef.current = null;
        setVisible(false);
        setIndex(0);
        setRun({ tour, steps });
      }, 350);
    }, 250);
  }, [cancelWait]);

  const finish = useCallback(() => {
    cancelWait();
    setRun((current) => {
      if (current && userId) markTourSeen(userId, current.tour.id);
      return null;
    });
    setVisible(false);
    targetRef.current = null;
    const back = returnFocusRef.current;
    returnFocusRef.current = null;
    if (back && back.isConnected) back.focus({ preventScroll: true });
  }, [cancelWait, userId]);

  // First visit: offer the tour for this page if it is the kind that starts by itself.
  useEffect(() => {
    if (!userId) return;
    const tour = tourForPath(pathname);
    if (!tour?.autoStart || hasSeenTour(userId, tour.id) || isFocusPath(pathname)) return;
    begin(tour);
    return cancelWait;
  }, [userId, pathname, begin, cancelWait]);

  // Replay: from the Help button, or from Settings (which may need to move to the right page first).
  useEffect(() => {
    const onStart = (e: Event) => {
      const id = (e as CustomEvent<{ tourId?: string }>).detail?.tourId;
      const tour = id ? tourById(id) : tourForPath(pathRef.current);
      if (!tour || isFocusPath(pathRef.current)) return;
      if (!tour.path.test(pathRef.current)) navigate(tour.home);
      begin(tour);
    };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [begin, navigate]);

  // Leaving the page ends the tour; so does signing out.
  useEffect(() => {
    if (run && !run.tour.path.test(pathname)) finish();
  }, [pathname, run, finish]);
  useEffect(() => () => cancelWait(), [cancelWait]);

  const go = useCallback((delta: 1 | -1) => {
    dirRef.current = delta;
    setIndex((i) => i + delta);
  }, []);

  // Point at the current step: find its element, bring it into view, and keep the glow and the card eased onto it
  // every frame (so scrolling, resizing and moving between steps all glide instead of jumping).
  useEffect(() => {
    if (!run) return;
    if (index < 0 || index >= run.steps.length) { finish(); return; }
    const step = run.steps[index];
    let el = findTarget(step.target);
    if (!el) {
      // The element went away since the tour began: skip this step safely, in the direction we were travelling.
      const next = index + dirRef.current;
      if (next < 0 || next >= run.steps.length) finish(); else setIndex(next);
      return;
    }
    const reduced = prefersReducedMotion();
    const tall = el.getBoundingClientRect().height > window.innerHeight * 0.7;
    el.scrollIntoView({ block: tall ? 'start' : 'center', behavior: reduced ? 'auto' : 'smooth' });
    if (tall) window.scrollBy(0, -72);

    // Match the glow's corners to the element's own (a pill gets a pill, a card a card).
    let radius = 14;
    const readRadius = (target: HTMLElement) => {
      const cs = window.getComputedStyle(target);
      const px = parseFloat(cs.borderTopLeftRadius);
      const r = target.getBoundingClientRect();
      radius = Number.isFinite(px) && px > 0 ? Math.min(px, Math.min(r.width, r.height) / 2) : 12;
    };
    readRadius(el);

    let raf = 0;
    let last = performance.now();
    let shown = false;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (!el!.isConnected || !isVisible(el!)) {
        const again = findTarget(step.target);
        if (!again) { const next = index + dirRef.current; if (next < 0 || next >= run.steps.length) finish(); else setIndex(next); return; }
        el = again;
        readRadius(el);
      }
      const r = el!.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;

      // Where the glow should be.
      const sx = r.left - SPOT_PAD, sy = r.top - SPOT_PAD, sw = r.width + SPOT_PAD * 2, sh = r.height + SPOT_PAD * 2;
      const sr = Math.min(radius + SPOT_PAD, Math.min(sw, sh) / 2);

      // Where the card should be: below the element, else above it, else along the bottom edge (very tall elements).
      const pw = Math.min(340, vw - MARGIN * 2);
      const ph = popRef.current?.offsetHeight ?? 200;
      let py: number;
      if (vh - (sy + sh) - MARGIN >= ph + GAP) py = sy + sh + GAP;
      else if (sy - MARGIN >= ph + GAP) py = sy - GAP - ph;
      else py = vh - ph - MARGIN;
      py = Math.max(py, MARGIN);
      const px = Math.min(Math.max(r.left + r.width / 2 - pw / 2, MARGIN), vw - pw - MARGIN);

      // Ease toward it. First frame of a tour, and reduced motion, snap straight there.
      const g = glideRef.current;
      const k = reduced || !g ? 1 : 1 - Math.exp(-dt / GLIDE_MS);
      const cur: Glide = g
        ? { x: g.x + (sx - g.x) * k, y: g.y + (sy - g.y) * k, w: g.w + (sw - g.w) * k, h: g.h + (sh - g.h) * k, r: g.r + (sr - g.r) * k, px: g.px + (px - g.px) * k, py: g.py + (py - g.py) * k, pw: g.pw + (pw - g.pw) * k }
        : { x: sx, y: sy, w: sw, h: sh, r: sr, px, py, pw };
      glideRef.current = cur;

      const spot = spotRef.current;
      if (spot) {
        spot.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
        spot.style.width = `${cur.w}px`;
        spot.style.height = `${cur.h}px`;
        spot.style.borderRadius = `${cur.r}px`;
      }
      const pop = popRef.current;
      if (pop) {
        pop.style.transform = `translate(${cur.px}px, ${cur.py}px)`;
        pop.style.width = `${cur.pw}px`;
      }
      if (!shown) {
        shown = true;
        setVisible(true);
        pop?.focus({ preventScroll: true });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // New step: let screen readers and keyboard users land on the new card.
    popRef.current?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(raf);
  }, [run, index, finish]);

  // Escape closes the tour.
  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); finish(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [run, finish]);

  if (!run) return null;
  const step = run.steps[index];
  const total = run.steps.length;
  const last = index === total - 1;
  const title = t(step.title);

  return createPortal(
    <>
      <div
        ref={spotRef}
        aria-hidden="true"
        className={`pointer-events-none fixed left-0 top-0 z-[70] transition-opacity duration-200 motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          // A crisp white edge, a brand-color halo and a soft glow: readable on the dimmed page in light and dark.
          boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.6), 0 0 0 2px rgb(255 255 255 / 0.92), 0 0 0 5px rgb(var(--c-brand) / 0.55), 0 0 30px 8px rgb(var(--c-brand) / 0.35)',
        }}
      />
      <div role="status" aria-live="polite" className="sr-only">{t('Step {n} of {total}', { n: index + 1, total })}: {title}</div>
      <div
        ref={popRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="guided-tour-title"
        aria-describedby="guided-tour-body"
        tabIndex={-1}
        className={`fixed left-0 top-0 z-[71] rounded-2xl bg-elevated p-5 text-start text-ink shadow-2xl ring-1 ring-line-strong outline-none transition-opacity duration-200 motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: 340 }}
      >
        <div key={index} className="tour-step flex flex-col gap-4">
          <div>
            <h2 id="guided-tour-title" className="m-0 text-lg font-semibold leading-snug text-ink">{title}</h2>
            <p id="guided-tour-body" className="m-0 mt-1.5 text-sm leading-relaxed text-ink-muted">{t(step.body)}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink-muted" aria-hidden="true">{t('{n} of {total}', { n: index + 1, total })}</span>
            <button type="button" onClick={finish} className={`${buttonClasses('ghost', 'sm')} -me-2`}>{t('Skip tour')}</button>
          </div>
          <div className="flex items-center justify-end gap-2">
            {index > 0 && <button type="button" onClick={() => go(-1)} className={buttonClasses('secondary', 'sm')}>{t('Back')}</button>}
            <button type="button" onClick={() => (last ? finish() : go(1))} className={buttonClasses('primary', 'sm')}>{last ? t('Done') : t('Next')}</button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
