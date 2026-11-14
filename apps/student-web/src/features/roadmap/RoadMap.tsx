import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { BookIcon, CheckIcon, ClipboardIcon } from '../../components/common/Icons';
import { LockIcon } from '../curriculum/CurriculumIcons';

export type RowStatus = 'completed' | 'current' | 'available' | 'locked';

/** One stop on the road: a lesson or the chapter quiz. */
export interface RoadStop {
  key: string;
  kind: 'lesson' | 'quiz' | 'story';
  status: RowStatus;
  /** Bold line next to the stop, e.g. "Lesson 3" or "Chapter quiz". */
  label: string;
  /** Second line: the lesson / quiz title. May be empty for locked placeholders. */
  title: string;
  to: string;
  /** Number shown inside a lesson's circle. */
  n: number;
}

/** Space between two stops on the road, and how thick the road and the rings are (px). Road and ring match. */
const ROW = 116;
const RING = 10;
const ROAD = RING;

/** Width of an element, kept up to date, so the road can be drawn in real pixels (rounded bends stay round). */
function useWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(480);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => setW(el.clientWidth || 480);
    read();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

interface RoadMapProps {
  stops: RoadStop[];
  /** Passed to the lesson player so it can link back to this course. */
  courseId?: string;
  /** Bring the current stop into view once, when the page is still at the top (the course page). */
  scrollToCurrent?: boolean;
  className?: string;
}

/**
 * The road: stops zig-zag between a left and a right lane, joined by a road as thick as the rings.
 * Finished stretches are green, the stretch to the stop you are on is blue, what is ahead stays pale.
 * Used by the dashboard (current chapter) and the course page (every chapter).
 */
export function RoadMap({ stops, courseId, scrollToCurrent = false, className = 'mt-4' }: RoadMapProps) {
  const { t } = useI18n();
  const statuses = stops.map((st) => st.status);

  // Tapping a locked stop explains why it is locked (and shakes it a little) instead of doing nothing.
  const [nudge, setNudge] = useState<{ key: string; text: string; n: number } | null>(null);
  const nudgeTimer = useRef<number | null>(null);
  useEffect(() => () => { if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current); }, []);
  function explainLocked(i: number) {
    const stop = stops[i];
    const text = stop.kind === 'quiz' ? t('Finish every lesson to unlock the quiz') : stop.kind === 'story' ? t('Finish this chapter\'s lessons to unlock the story') : t('Finish {lesson} first', { lesson: stops[i - 1]?.label ?? '' });
    if (nudgeTimer.current !== null) window.clearTimeout(nudgeTimer.current);
    setNudge((cur) => ({ key: stop.key, text, n: (cur?.n ?? 0) + 1 }));
    nudgeTimer.current = window.setTimeout(() => setNudge(null), 2600);
  }

  // Bring the stop you are on into view once (only when the page has not been scrolled yet).
  const currentRef = useRef<HTMLLIElement>(null);
  const hasCurrent = statuses.includes('current');
  useEffect(() => {
    if (scrollToCurrent && hasCurrent && window.scrollY < 50) currentRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, [scrollToCurrent, hasCurrent]);

  // Physical coordinates, mirrored for right-to-left.
  const listRef = useRef<HTMLOListElement>(null);
  const width = useWidth(listRef);
  const rtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  const laneL = Math.max(44, Math.round(width * 0.2));
  const laneR = width - laneL;
  const xs = stops.map((_, i) => ((i % 2 === 0) !== rtl ? laneL : laneR));
  const H = stops.length * ROW;
  const ys = stops.map((_, i) => i * ROW + ROW / 2);
  // One piece of road between two stops: down, a rounded bend across, down again.
  const road = (i: number) => {
    const x0 = xs[i], y0 = ys[i], x1 = xs[i + 1], y1 = ys[i + 1];
    const ym = (y0 + y1) / 2;
    const sg = x1 > x0 ? 1 : -1;
    const r = Math.min(28, Math.abs(x1 - x0) / 2 - 1);
    return `M ${x0} ${y0} V ${ym - r} Q ${x0} ${ym} ${x0 + sg * r} ${ym} H ${x1 - sg * r} Q ${x1} ${ym} ${x1} ${ym + r} V ${y1}`;
  };
  const roadTone = (i: number) => {
    if (statuses[i] !== 'completed') return null;
    return statuses[i + 1] === 'completed' ? 'stroke-success' : 'stroke-brand';
  };

  return (
    <>
      <ol ref={listRef} className={`relative m-0 list-none p-0 ${className}`} role="list" style={{ height: H }}>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={H}>
          {stops.slice(0, -1).map((_, i) => (
            <path key={`base-${i}`} d={road(i)} fill="none" strokeWidth={ROAD} strokeLinecap="round" className="stroke-surface-strong" />
          ))}
          {stops.slice(0, -1).map((_, i) => {
            const tone = roadTone(i);
            return tone ? <path key={`on-${i}`} d={road(i)} fill="none" strokeWidth={ROAD} strokeLinecap="round" className={tone} /> : null;
          })}
        </svg>
        {stops.map((stop, i) => {
          const status = stop.status;
          const isQuiz = stop.kind === 'quiz';
          const isStory = stop.kind === 'story';
          const shape = isQuiz ? 'rounded-2xl' : 'rounded-full';
          const locked = status === 'locked';
          const current = status === 'current';
          const x = xs[i];
          const labelLeft = x > width / 2;
          const ring = status === 'completed' ? 'border-success' : current ? 'border-brand' : status === 'available' ? 'border-line-strong' : 'border-surface-strong';
          const tone = status === 'completed' ? 'text-success-ink' : current ? 'text-brand-ink' : 'text-ink-muted';
          const R = 34;
          const inner = (
            <>
              <span className={`relative shrink-0 ${current ? 'lp-pulse' : ''}`}>
                <span key={nudge?.key === stop.key ? nudge.n : 0} aria-hidden="true" className={`lp-node grid size-[68px] place-items-center ${shape} bg-surface ${tone} border-solid ${ring} ${nudge?.key === stop.key ? 'lp-shake' : ''}`} style={{ borderWidth: RING }}>
                  {status === 'completed' ? <CheckIcon className="size-6" /> : locked ? <LockIcon className="size-5" /> : isQuiz ? <ClipboardIcon className="size-6" /> : isStory ? <BookIcon className="size-6" /> : <span className="lp-num text-xl font-semibold">{stop.n}</span>}
                </span>
                {current && (
                  <span aria-hidden="true" className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full bg-brand text-white ring-2 ring-surface">
                    <svg viewBox="0 0 24 24" className="size-3.5 rtl:-scale-x-100" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" /></svg>
                  </span>
                )}
              </span>
              <span className={`min-w-0 max-w-[11rem] ${labelLeft ? 'text-right' : 'text-left'}`}>
                <span className={`lp-num block text-base font-semibold leading-tight sm:text-xl ${tone}`}>{stop.label}</span>
                {stop.title && <span className={`mt-0.5 block text-sm leading-snug sm:text-base [overflow-wrap:anywhere] [unicode-bidi:plaintext] ${locked ? 'text-ink-muted' : 'text-ink'}`}>{stop.title}</span>}
                {nudge?.key === stop.key && <span role="status" className="mt-1 block text-sm font-medium text-warning-ink">{nudge.text}</span>}
              </span>
            </>
          );
          const pos = labelLeft ? { right: width - x - R, left: undefined } : { left: x - R, right: undefined };
          // A flex row already runs right-to-left in Arabic, so the node/label order only needs reversing when the label's
          // physical side and the reading direction disagree.
          const row = `absolute top-0 flex h-[116px] items-center gap-4 ${labelLeft !== rtl ? 'flex-row-reverse' : ''}`;
          return (
            <li
              key={stop.key}
              ref={current ? currentRef : undefined}
              role="listitem"
              data-status={status}
              aria-disabled={locked ? true : undefined}
              title={locked ? (isQuiz ? t('Complete every lesson in this chapter to unlock the quiz') : isStory ? t('Complete every lesson in this chapter to unlock the story') : t('Complete the previous lesson first')) : undefined}
              className="relative h-[116px]"
            >
              {locked ? (
                <button type="button" aria-disabled="true" onClick={() => explainLocked(i)} className={`${row} cursor-not-allowed rounded-full border-0 bg-transparent p-0 opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`} style={pos}>{inner}</button>
              ) : (
                <Link to={stop.to} state={isQuiz || isStory || !courseId ? undefined : { courseId }} className={`${row} rounded-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`} style={pos}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
