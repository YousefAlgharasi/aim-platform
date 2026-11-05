import { useEffect, useMemo, useState } from 'react';
import { FixedCelebration } from './FixedCelebration';
import { WeeklyRecap } from './WeeklyRecap';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { ImproveSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { buttonClasses } from '../../components/common/buttonStyles';
import { useAimResults } from '../progress/useAimResults';
import {
  formatDate,
  prettifySkillId,
  toPercent,
  trendLabel,
  type AimResults,
  type RecommendationEntry,
  type SkillStateEntry,
  type WeaknessRecordEntry,
} from '../progress/aimApi';
import { mistakesApi } from '../learner/learnerApi';
import * as ui from '../progress/ui';

const OPEN = new Set(['open', 'improving']);
const SEVERITY_RANK: Record<string, number> = { critical: 0, developing: 1, emerging: 2 };

export interface WeakSpot {
  skillId: string;
  /** Present when the AIM engine opened a weakness record for this skill. */
  weakness: WeaknessRecordEntry | null;
  skill: SkillStateEntry | null;
  /** The lesson AIM suggests for this skill, if any. */
  lessonId: string | null;
  severity: 'critical' | 'developing' | 'emerging';
  attempts: number;
}

/**
 * Turn the raw AIM outputs into an ordered list of things to work on.
 * Weakness records come from lesson practice, placement and assessment attempts; low-mastery
 * skills without a record are included so nothing the student is shaky on is hidden.
 */
export function buildWeakSpots(data: AimResults): WeakSpot[] {
  const skillById = new Map(data.skillStates.map((s) => [s.skillId, s]));
  const recBySkill = new Map<string, RecommendationEntry>();
  [...data.recommendations].sort((a, b) => a.rank - b.rank).forEach((r) => {
    if (r.targetLessonId && !recBySkill.has(r.targetSkillId)) recBySkill.set(r.targetSkillId, r);
  });

  const spots: WeakSpot[] = [];
  const seen = new Set<string>();
  for (const w of data.weaknessRecords) {
    if (!OPEN.has(w.status.toLowerCase()) || seen.has(w.skillId)) continue;
    seen.add(w.skillId);
    const sev = w.severity.toLowerCase();
    spots.push({
      skillId: w.skillId,
      weakness: w,
      skill: skillById.get(w.skillId) ?? null,
      lessonId: recBySkill.get(w.skillId)?.targetLessonId ?? null,
      severity: sev === 'critical' || sev === 'developing' ? sev : 'emerging',
      attempts: w.triggerAttemptIds.length,
    });
  }
  for (const s of data.skillStates) {
    if (seen.has(s.skillId) || s.masteryScore >= 0.5) continue;
    spots.push({
      skillId: s.skillId,
      weakness: null,
      skill: s,
      lessonId: recBySkill.get(s.skillId)?.targetLessonId ?? null,
      severity: s.masteryScore < 0.3 ? 'critical' : 'developing',
      attempts: 0,
    });
  }
  return spots.sort(
    (a, b) =>
      SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
      (a.skill?.masteryScore ?? 0.5) - (b.skill?.masteryScore ?? 0.5),
  );
}

const CATEGORIES = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking', 'pronunciation', 'comprehension'] as const;
export type Category = (typeof CATEGORIES)[number] | 'other';
export const CATEGORY_LABEL: Record<Category, string> = {
  grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', listening: 'Listening', writing: 'Writing',
  speaking: 'Speaking', pronunciation: 'Pronunciation', comprehension: 'Comprehension', other: 'Other',
};
export const categoryOf = (skillId: string): Category => {
  const id = skillId.toLowerCase();
  return CATEGORIES.find((c) => id.includes(c)) ?? (id.includes('vocab') ? 'vocabulary' : id.includes('grammar') ? 'grammar' : 'other');
};

const sevTone = { critical: ui.tone.error, developing: ui.tone.warning, emerging: ui.tone.neutral } as const;
const sevLabel = { critical: 'Needs focus', developing: 'Getting there', emerging: 'Just spotted' } as const;

const secondary =
  'inline-flex min-h-10 items-center justify-center rounded-xl bg-control px-4 text-[13px] font-bold text-ink no-underline transition-colors hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

function Stat({ value, label, tone = '' }: { value: string | number; label: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
      <span className={`text-2xl font-extrabold tracking-tight tabular-nums ${tone}`}>{value}</span>
      <span className="text-xs font-semibold text-on-brand">{label}</span>
    </div>
  );
}

function SpotCard({ spot }: { spot: WeakSpot }) {
  const { t, plural } = useI18n();
  const name = prettifySkillId(spot.skillId);
  const pct = spot.skill ? toPercent(spot.skill.masteryScore) : null;
  const trend = spot.skill?.masteryTrend;
  return (
    <Card>
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 text-base font-extrabold tracking-tight text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">{name}</h3>
          <span className={ui.badge(sevTone[spot.severity])}>{t(sevLabel[spot.severity])}</span>
        </div>

        {pct !== null && (
          <div className="flex flex-col gap-1.5">
            <div className={ui.barTrack} role="progressbar" aria-label={t('{name} mastery', { name })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className={ui.barFillWeak} style={{ width: `${Math.max(pct, 3)}%` }} />
            </div>
            <div className="flex justify-between text-xs font-semibold text-ink-muted">
              <span>{t('Mastery {pct}%', { pct })}</span>
              {trend && trend !== 'insufficient_data' && <span>{trendLabel(trend)}</span>}
            </div>
          </div>
        )}

        <p className={`${ui.meta} flex-1`}>
          {spot.weakness
            ? [
                t('Detected {date}', { date: formatDate(spot.weakness.detectedAt) }),
                spot.attempts > 0
                  ? plural(spot.attempts, {
                      one: t('Based on {n} attempt', { n: spot.attempts }),
                      two: t('Based on {n} attempts [two]', { n: spot.attempts }),
                      few: t('Based on {n} attempts [few]', { n: spot.attempts }),
                      other: t('Based on {n} attempts', { n: spot.attempts }),
                    })
                  : '',
              ].filter(Boolean).join(' · ')
            : t('Your recent answers on this skill were low.')}
        </p>

        <div className="flex flex-wrap gap-2">
          {spot.lessonId ? (
            <>
              <Link to={`/practice/lesson/${encodeURIComponent(spot.lessonId)}`} className={buttonClasses('primary', 'sm')}>{t('Practice now')}</Link>
              <Link to={`/lessons/${encodeURIComponent(spot.lessonId)}`} className={secondary}>{t('Re-read the lesson')}</Link>
              <Link to={`/ai-teacher?lessonId=${encodeURIComponent(spot.lessonId)}`} className={secondary}>{t('Ask AI Teacher')}</Link>
            </>
          ) : (
            <Link to="/curriculum" className={buttonClasses('primary', 'sm')}>{t('Find a lesson')}</Link>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Where the student is weak (from lessons, practice and assessments) and how to fix it. */
export function ImprovePage() {
  const { t, plural } = useI18n();
  const { data, loading, error, reload } = useAimResults();
  const [mistakes, setMistakes] = useState<number | null>(null);
  const [cat, setCat] = useState<Category | 'all'>('all');

  useEffect(() => {
    mistakesApi.list().then((r) => setMistakes(r.total)).catch(() => setMistakes(null));
  }, []);

  const spots = useMemo(() => (data ? buildWeakSpots(data) : []), [data]);

  if (loading) return <ImproveSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const fixed = data.weaknessRecords.filter((w) => w.status.toLowerCase() === 'resolved');
  const dueReviews = data.reviewSchedules.filter((r) => ['due', 'pending', 'rescheduled'].includes(r.status.toLowerCase()) && new Date(r.dueAt).getTime() <= Date.now());
  const counts = spots.reduce<Partial<Record<Category, number>>>((m, s) => ({ ...m, [categoryOf(s.skillId)]: (m[categoryOf(s.skillId)] ?? 0) + 1 }), {});
  const cats = (Object.keys(counts) as Category[]).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
  const visible = cat === 'all' ? spots : spots.filter((s) => categoryOf(s.skillId) === cat);
  const top = spots[0];
  const topLesson = top?.lessonId;

  return (
    <div className="stagger flex flex-col gap-6">
      <PageTitleBar title={t('Improve')} subtitle={t('See where you are losing points in lessons, practice and tests, then fix it.')} />

      <FixedCelebration records={data.weaknessRecords} />

      <div className="hero-panel">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4">
          {top ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="m-0 text-xs font-bold text-on-brand">{t('Start with this')}</p>
                <p className="m-0 mt-0.5 text-xl font-extrabold leading-snug [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-2xl">{prettifySkillId(top.skillId)}</p>
              </div>
              <Link
                to={topLesson ? `/practice/lesson/${encodeURIComponent(topLesson)}` : '/curriculum'}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
              >
                {topLesson ? t('Practice now') : t('Find a lesson')}
              </Link>
            </div>
          ) : (
            <p className="m-0 text-lg font-extrabold">{t('No weak spots right now. Keep learning to stay sharp.')}</p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat value={spots.length} label={t('To work on')} />
            <Stat value={mistakes ?? '—'} label={t('Mistakes to retry')} />
            <Stat value={dueReviews.length} label={t('Reviews due')} />
            <Stat value={fixed.length} label={t('Already fixed')} />
          </div>
        </div>
      </div>

      {((mistakes ?? 0) > 0 || dueReviews.length > 0) && (
        <Card interactive>
          <Link to="/mistakes?quick=1" className="flex items-center gap-4 no-underline">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-warning-soft text-xl text-warning-ink" aria-hidden="true">⚡</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold text-ink">{t('5-minute fix session')}</span>
              <span className="block text-sm text-ink-muted">
                {(mistakes ?? 0) > 0
                  ? t('Up to 5 questions you got wrong, picked for you. The fastest way to turn a mistake into a point.')
                  : t('A few quick questions to keep your weak spots from coming back.')}
              </span>
            </span>
            <span className="text-sm font-bold text-brand-ink">{t('Start')}</span>
          </Link>
        </Card>
      )}

      <section className="flex flex-col gap-3" aria-label={t('Weak spots')}>
        <h2 className={`${ui.sectionTitle} px-1`}>{t('Weak spots')}</h2>
        {spots.length === 0 ? (
          <EmptyState title={t('No weaknesses detected')} message={t('Great work — no areas to improve have been detected yet.')} />
        ) : (
          <>
            {cats.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('Filter by skill type')}>
                {(['all', ...cats] as Array<Category | 'all'>).map((c) => (
                  <button key={c} type="button" role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                    className={`min-h-10 shrink-0 cursor-pointer rounded-full border-0 px-4 text-sm font-bold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${cat === c ? 'bg-brand text-white ring-brand' : 'bg-surface text-ink-soft ring-line hover:bg-brand-soft'}`}>
                    {c === 'all' ? `${t('All')} (${spots.length})` : `${t(CATEGORY_LABEL[c])} (${counts[c]})`}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {visible.map((s) => <SpotCard key={s.skillId} spot={s} />)}
            </div>
          </>
        )}
      </section>

      {dueReviews.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('Reviews due')}>
          <div className="flex items-center justify-between px-1">
            <h2 className={ui.sectionTitle}>{t('Reviews due')}</h2>
            <Link to="/progress/reviews" className={ui.link}>{t('View all')}</Link>
          </div>
          <Card>
            <ul className="m-0 flex list-none flex-col divide-y divide-line-subtle p-0 dark:divide-line">
              {dueReviews.slice(0, 4).map((r) => (
                <li key={r.scheduleId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm font-bold text-ink [unicode-bidi:plaintext]">{prettifySkillId(r.skillId)}</span>
                  <span className={ui.meta}>{formatDate(r.dueAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <WeeklyRecap records={data.weaknessRecords} />

      {fixed.length > 0 && (
        <section className="flex flex-col gap-3" aria-label={t('Already fixed')}>
          <h2 className={`${ui.sectionTitle} px-1`}>{t('Already fixed')}</h2>
          <div className="flex flex-wrap gap-2">
            {fixed.slice(0, 12).map((w) => (
              <span key={w.weaknessId} className={ui.badge(ui.tone.success)}>✓ {prettifySkillId(w.skillId)}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
