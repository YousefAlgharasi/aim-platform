import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import * as ui from './ui';

/** Where the four stops of the preview road sit (viewBox units), alternating like the real roadmap. */
const STOPS: Array<[number, number]> = [[104, 78], [376, 204], [104, 330], [376, 456]];

function bend([x0, y0]: [number, number], [x1, y1]: [number, number]) {
  const ym = (y0 + y1) / 2;
  const sg = x1 > x0 ? 1 : -1;
  const r = 34;
  return `M ${x0} ${y0} V ${ym - r} Q ${x0} ${ym} ${x0 + sg * r} ${ym} H ${x1 - sg * r} Q ${x1} ${ym} ${x1} ${ym + r} V ${y1}`;
}

/**
 * The roadmap card before there is a road to show: no course started yet, or the lessons could not be loaded.
 * The text sits at the top; below it a large, faded road shows what will appear.
 */
export function RoadmapEmpty({ courseId, courseTitle, unavailable = false }: { courseId: string | null; courseTitle: string | null; unavailable?: boolean }) {
  const { t } = useI18n();
  return (
    <section aria-label={t('Your roadmap')} className={ui.panel}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-md">
          <h2 className="m-0 text-xl font-semibold tracking-tight text-ink">{t('Your roadmap')}</h2>
          <p className="m-0 mt-1.5 text-base leading-relaxed text-ink-muted">
            {unavailable
              ? t("We couldn't show your lessons right now. Open your course to see them, or try again in a moment.")
              : t('Start a course and each lesson of your current chapter becomes a stop on the road.')}
          </p>
        </div>
        <Link to={courseId ? `/curriculum/${courseId}` : '/curriculum'} className={`${ui.primaryLink} shrink-0`} title={courseTitle ?? undefined}>
          {courseId ? t('Open course') : t('Browse courses')}
        </Link>
      </div>

      {/* A large faded preview of the road, drawn like the real one. */}
      <svg aria-hidden="true" viewBox="0 0 480 506" className="mx-auto mt-4 h-auto w-full max-w-lg rtl:-scale-x-100">
        {STOPS.slice(0, -1).map((p, i) => (
          <path key={i} d={bend(p, STOPS[i + 1])} fill="none" strokeWidth="24" strokeLinecap="round" className="stroke-surface-strong" />
        ))}
        {STOPS.map(([cx, cy], i) => {
          const labelRight = cx < 240;
          const lx = labelRight ? cx + 56 : cx - 56 - 150;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="34" strokeWidth="11" className={`fill-surface ${i === 0 ? 'stroke-brand' : 'stroke-line-strong'}`} />
              {i === 0 && <path d={`M ${cx - 11} ${cy} l 8 8 l 15 -16`} fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="stroke-brand" />}
              <rect x={lx} y={cy - 22} width="110" height="14" rx="7" className="fill-surface-strong" />
              <rect x={lx} y={cy + 2} width="150" height="12" rx="6" className="fill-surface-strong" opacity="0.7" />
            </g>
          );
        })}
      </svg>
    </section>
  );
}
