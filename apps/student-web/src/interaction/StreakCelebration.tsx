import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { plural } from '../i18n';
import { useI18n } from '../i18n/I18nContext';
import { dismissCelebration, setEngagementUser } from './engagementStore';
import { useEngagement } from './hooks';
import { playSound, soundBusyForMs } from './sound';
import { STREAK_TONE_TEXT, streakTone, type StreakCelebration as Celebration } from './streak';

/** Let the screen's own "finished" moment land first, then show the streak. */
const SHOW_DELAY_MS = 650;
const VISIBLE_MS = 5200;
const VISIBLE_MILESTONE_MS = 7000;
const LEAVE_MS = 180;

/** AIM's own streak flame: a rounded two-tone flame, drawn for this badge. */
export function StreakFlame({ className = 'size-7', live = false }: { className?: string; live?: boolean }) {
  return (
    <svg className={`${className} ${live ? 'ix-fire' : ''}`} viewBox="0 0 32 32" aria-hidden="true">
      <path className={live ? 'ix-fire-outer' : undefined} d="M16.6 2.5c.7 4.6 3.2 6.900 5.600 9.700 2.200 2.600 3.800 5.300 3.800 8.800 0 5.500-4.500 9.500-10 9.500S6 26.500 6 21c0-2.900 1.200-5.300 2.900-7.100.5 1.800 1.500 3 2.900 3.600-.6-5.300 1.300-10.700 4.800-15z" fill="rgb(var(--c-gold))" />
      <path className={live ? 'ix-fire-inner' : undefined} d="M16.200 15.500c.5 2.300 1.800 3.500 2.900 4.900.9 1.200 1.500 2.400 1.500 3.900 0 2.600-2.100 4.500-4.600 4.500s-4.600-1.900-4.600-4.500c0-1.400.5-2.500 1.300-3.400.3.900.8 1.500 1.500 1.800-.2-2.600.5-5.100 2-7.200z" fill="rgb(var(--p-gold-300))" />
    </svg>
  );
}

function particles(count: number): Array<{ dx: number; dy: number; size: number; tone: string; delay: number }> {
  const tones = ['bg-gold', 'bg-brand', 'bg-success', 'bg-secondary'];
  return Array.from({ length: count }, (_, i) => {
    // Evenly spread around the badge with a fixed wobble, so the burst looks the same every time (no layout work).
    const angle = (i / count) * Math.PI * 2 + (i % 2 ? 0.22 : -0.12);
    const reach = 34 + ((i * 7) % 3) * 9;
    return {
      dx: Math.round(Math.cos(angle) * reach),
      dy: Math.round(Math.sin(angle) * reach),
      size: i % 3 === 0 ? 7 : 5,
      tone: tones[i % tones.length],
      delay: (i % 4) * 30,
    };
  });
}

function StreakToast({ celebration, onClose }: { celebration: Celebration; onClose: () => void }) {
  const { t, formatNumber } = useI18n();
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const { current, previous, milestone } = celebration;

  const close = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    if (!leaving) return undefined;
    const id = window.setTimeout(onClose, LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [leaving, onClose]);

  useEffect(() => {
    if (paused || leaving) return undefined;
    const id = window.setTimeout(close, milestone ? VISIBLE_MILESTONE_MS : VISIBLE_MS);
    return () => window.clearTimeout(id);
  }, [paused, leaving, close, milestone]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Optional sound, once. If another cue (lesson finished) is still sounding, wait for it instead of overlapping.
  useEffect(() => {
    const cue = milestone ? 'milestone' : 'streak';
    const id = window.setTimeout(() => { playSound(cue); }, soundBusyForMs() + 160);
    return () => window.clearTimeout(id);
  }, [milestone]);

  const title = plural(current, {
    one: t('1-day streak'),
    two: t('2-day streak'),
    few: t('{n}-day streak [few]', { n: formatNumber(current) }),
    other: t('{n}-day streak', { n: formatNumber(current) }),
  });
  const message = t(STREAK_TONE_TEXT[streakTone(current)]);
  const dots = particles(milestone ? 16 : 9);

  return (
    <div
      className="ix-toast pointer-events-auto relative flex w-full max-w-sm items-center gap-3.5 rounded-2xl bg-elevated p-3.5 pe-2 text-ink shadow-xl ring-1 ring-line"
      data-leaving={leaving}
      data-testid="streak-celebration"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Screen readers get one plain sentence; the animated parts are decorative. */}
      <span className="sr-only" role="status">{`${title}. ${message}`}</span>

      <span aria-hidden="true" className="relative grid size-14 shrink-0 place-items-center">
        <span className="ix-glow absolute inset-0 rounded-full" style={{ background: 'radial-gradient(closest-side, rgb(var(--c-gold) / 0.55), transparent)' }} />
        <span className="ix-particles absolute inset-0">
          {dots.map((d, i) => (
            <span
              key={i}
              className={`ix-particle absolute left-1/2 top-1/2 rounded-full ${d.tone}`}
              style={{
                width: d.size, height: d.size, marginLeft: -d.size / 2, marginTop: -d.size / 2,
                ['--dx' as string]: `${d.dx}px`, ['--dy' as string]: `${d.dy}px`,
                animationDelay: `${260 + d.delay}ms`,
              }}
            />
          ))}
        </span>
        <span className={`ix-flame relative grid size-14 place-items-center rounded-full bg-surface-strong ${milestone ? 'ring-2 ring-gold' : 'ring-1 ring-line'}`}>
          <StreakFlame />
        </span>
      </span>

      <div aria-hidden="true" className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="lp-num relative inline-grid h-8 overflow-hidden text-2xl font-bold leading-8 text-ink">
            <span className="ix-count-out col-start-1 row-start-1">{formatNumber(previous)}</span>
            <span className="ix-count-in col-start-1 row-start-1">{formatNumber(current)}</span>
          </span>
          <span className="truncate text-sm font-semibold text-ink-soft">{t('Day streak')}</span>
          {milestone && (
            <span className="shrink-0 rounded-full bg-surface-strong px-2 py-0.5 text-[11px] font-bold text-ink ring-1 ring-gold">{t('Milestone')}</span>
          )}
        </div>
        <p className="m-0 mt-0.5 text-sm font-medium leading-snug text-ink-soft">{message}</p>
      </div>

      <button
        type="button"
        onClick={close}
        aria-label={t('Dismiss streak message')}
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-muted transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <svg className="size-3.5" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

/**
 * Mounted once in the signed-in layout. Shows the streak celebration raised by `reportLearningCompleted()`.
 * It floats at the bottom of the screen (clear of the result at the top of the page), takes no focus and blocks no clicks outside its own small card.
 */
export function StreakCelebrationHost() {
  const { user } = useAuth();
  const { celebration } = useEngagement();
  const [shown, setShown] = useState<Celebration | null>(null);
  const uid = user?.id ?? null;
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => { setEngagementUser(uid); }, [uid]);

  useEffect(() => {
    window.clearTimeout(timer.current);
    if (!celebration) { setShown(null); return undefined; }
    timer.current = window.setTimeout(() => setShown(celebration), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer.current);
  }, [celebration]);

  if (!shown) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-50 flex justify-center px-4 md:bottom-6">
      <StreakToast key={shown.day} celebration={shown} onClose={dismissCelebration} />
    </div>
  );
}
