import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { BAND_NAME, type Band, type Relation } from './bands';
import { useLearnerLevel } from './LevelContext';

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold no-underline';

/** The student's CEFR level (e.g. "B1 · Intermediate"), linking to the courses page. Shows a "find your level" prompt if unknown. */
export function LevelBadge({ tone = 'soft', showName = true }: { tone?: 'soft' | 'onBrand'; showName?: boolean }) {
  const { t } = useI18n();
  const { band, loading } = useLearnerLevel();
  const cls = tone === 'onBrand' ? 'bg-black/20 text-white border border-white/20' : 'text-ink ring-1 ring-line-strong';
  if (loading) return <span aria-hidden="true" className={`${base} ${cls} opacity-50`}>···</span>;
  if (!band) {
    return <Link to="/placement" className={`${base} ${cls} hover:underline`}>{t('Find your level')}</Link>;
  }
  return (
    <Link to="/curriculum" className={`${base} ${cls} hover:underline`} aria-label={t('Your level: {level}', { level: `${band} ${t(BAND_NAME[band])}` })}>
      <span>{band}</span>
      {showName && <span className="font-medium opacity-80">{t(BAND_NAME[band])}</span>}
    </Link>
  );
}

const REL_TONE: Record<Exclude<Relation, 'unknown'>, string> = {
  passed: 'text-success-ink ring-1 ring-success-line',
  current: 'bg-ink text-ink-inverse',
  ahead: 'text-ink-muted ring-1 ring-line-strong',
};
const REL_LABEL: Record<Exclude<Relation, 'unknown'>, string> = { passed: 'Passed level', current: 'Your level', ahead: 'Ahead of you' };

/** Where a course/lesson band sits relative to the student's level. */
export function RelationChip({ relation, band }: { relation: Relation; band?: Band | null }) {
  const { t } = useI18n();
  if (relation === 'unknown') return band ? <span className={`${base} text-ink ring-1 ring-line-strong`}>{band}</span> : null;
  return (
    <span className={`${base} ${REL_TONE[relation]}`}>
      {relation === 'passed' && <span aria-hidden="true">✓</span>}
      {band && <span>{band}</span>}
      <span className="font-medium">{t(REL_LABEL[relation])}</span>
    </span>
  );
}
