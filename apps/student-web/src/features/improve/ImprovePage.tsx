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
import { mistakesApi, recoveryApi, type MistakeItem, type RecoverySkill, type SkillGroup } from '../learner/learnerApi';
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

/** The 6 main skills the student sees. Pronunciation and functional language fold into speaking. */
export const GROUPS: SkillGroup[] = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'];
export const GROUP_LABEL: Record<SkillGroup, string> = {
  grammar: 'Grammar', vocabulary: 'Vocabulary', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking',
};
const CATEGORY_TO_GROUP: Record<Category, SkillGroup> = {
  grammar: 'grammar', vocabulary: 'vocabulary', reading: 'reading', listening: 'listening', writing: 'writing',
  speaking: 'speaking', pronunciation: 'speaking', comprehension: 'reading', other: 'vocabulary',
};
/** Server mapping when we have it (skill_group_map); the key-name guess only when the recovery call failed. */
const KEY_SEGMENT_GROUP: Record<string, SkillGroup> = {
  gra: 'grammar', grammar: 'grammar', voc: 'vocabulary', vocabulary: 'vocabulary', read: 'reading', reading: 'reading',
  lis: 'listening', listening: 'listening', write: 'writing', writing: 'writing', spe: 'speaking', speaking: 'speaking',
  pho: 'speaking', pronunciation: 'speaking', func: 'speaking', functional_language: 'speaking',
};
export const groupOf = (skillId: string, recovery?: Map<string, RecoverySkill>): SkillGroup => {
  const mapped = recovery?.get(skillId)?.group;
  if (mapped) return mapped;
  // Keys look like "en.a2.gra.comparatives" or "placement.listening.dialogue": read the segments before guessing by name.
  const seg = skillId.toLowerCase().split('.').map((x) => KEY_SEGMENT_GROUP[x]).find(Boolean);
  return seg ?? CATEGORY_TO_GROUP[categoryOf(skillId)];
};

/** Whole days left until `iso`, rounded up (never below 1 while still locked). */
export const daysUntil = (iso: string, now: number = Date.now()): number => Math.max(1, Math.ceil((new Date(iso).getTime() - now) / 86_400_000));

const sevTone = { critical: ui.tone.error, developing: ui.tone.warning, emerging: ui.tone.neutral } as const;
const sevLabel = { critical: 'Needs focus', developing: 'Getting there', emerging: 'Just spotted' } as const;

const secondary =
  'inline-flex min-h-10 items-center justify-center rounded-xl bg-control px-4 text-[13px] font-bold text-ink no-underline transition-colors hover:bg-brand-soft hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

function Stat({ value, label, tone = '' }: { value: string | number; label: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl bg-white/10 p-3">
      <span className={`text-2xl font-semibold tracking-tight tabular-nums ${tone}`}>{value}</span>
      <span className="text-xs font-semibold text-on-brand">{label}</span>
    </div>
  );
}

export function SpotCard({ spot, mistakes, recovery }: { spot: WeakSpot; mistakes: MistakeItem[]; recovery?: RecoverySkill }) {
  const { t, plural } = useI18n();
  const name = prettifySkillId(spot.skillId);
  const pct = spot.skill ? toPercent(spot.skill.masteryScore) : null;
  const trend = spot.skill?.masteryTrend;
  return (
    <Card>
      <div className="flex h-full flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="m-0 text-xl font-semibold tracking-tight text-ink [overflow-wrap:anywhere] [unicode-bidi:plaintext]">{name}</h3>
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

        {mistakes.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl bg-surface-muted p-3">
            <p className="m-0 text-xs font-bold text-ink">{t('Questions you missed')}</p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {mistakes.slice(0, 2).map((m) => (
                <li key={m.itemId} className="text-sm leading-snug text-ink-soft [overflow-wrap:anywhere] [unicode-bidi:plaintext]">
                  {m.prompt}
                  {m.yourAnswer && <span className="mt-0.5 block text-xs text-ink-muted">{t('Last time you answered: {answer}', { answer: `\u2068${m.yourAnswer}\u2069` })}</span>}
                </li>
              ))}
            </ul>
            {!recovery && (
              <Link to={`/mistakes?skill=${encodeURIComponent(spot.skillId)}`} className={ui.link}>
                {mistakes.length > 2 ? t('See all {n} and fix them', { n: mistakes.length }) : t('Fix them')}
              </Link>
            )}
          </div>
        )}

        {recovery && recovery.openMistakes > 0 && (
          <div className="flex flex-col gap-2 rounded-xl bg-surface-muted p-3" aria-label={t('Recovery steps')}>
            <ol className="m-0 flex list-none items-center gap-2 p-0 text-xs font-bold">
              <li className="rounded-full bg-brand-soft px-2.5 py-1 text-brand-ink">1 · {t('Learn')}</li>
              <li className={`rounded-full px-2.5 py-1 ${recovery.unlocked ? 'bg-success-soft text-success-ink' : 'bg-control text-ink-muted'}`}>2 · {recovery.unlocked ? `✓ ${t('Ready')}` : t('Wait')}</li>
              <li className={`rounded-full px-2.5 py-1 ${recovery.unlocked ? 'bg-brand-soft text-brand-ink' : 'bg-control text-ink-muted'}`}>3 · {t('Retry')}</li>
            </ol>
            {recovery.unlocked ? (
              <Link to={`/improve/retry/${encodeURIComponent(spot.skillId)}`} className={buttonClasses('primary', 'sm')}>{t('Retry now')}</Link>
            ) : (
              <p className="m-0 text-xs text-ink-muted">
                {t('Retry opens in {n} days. Spacing it out helps you remember. Learn it with the AI Teacher in the meantime.', { n: daysUntil(recovery.retryAvailableAt ?? new Date().toISOString()) })}
              </p>
            )}
          </div>
        )}

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
  const { t } = useI18n();
  const { data, loading, error, reload } = useAimResults();
  const [mistakes, setMistakes] = useState<number | null>(null);
  const [mistakeItems, setMistakeItems] = useState<MistakeItem[]>([]);
  const [cat, setCat] = useState<SkillGroup | 'all'>('all');
  const [recoverySkills, setRecoverySkills] = useState<RecoverySkill[] | null>(null);

  useEffect(() => {
    mistakesApi.list().then((r) => { setMistakes(r.total); setMistakeItems(r.items); }).catch(() => setMistakes(null));
  }, []);

  useEffect(() => {
    recoveryApi.overview().then((r) => setRecoverySkills(r.skills)).catch(() => setRecoverySkills(null));
  }, []);
  const recoveryBySkill = useMemo(() => new Map((recoverySkills ?? []).map((r) => [r.skillKey, r])), [recoverySkills]);

  const spots = useMemo(() => (data ? buildWeakSpots(data) : []), [data]);
  // The real wrong answers, grouped under the skill they belong to.
  const mistakesBySkill = useMemo(() => {
    const by = new Map<string, MistakeItem[]>();
    for (const m of mistakeItems) for (const id of m.skillIds ?? []) by.set(id, [...(by.get(id) ?? []), m]);
    return by;
  }, [mistakeItems]);

  if (loading) return <ImproveSkeleton />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const fixed = data.weaknessRecords.filter((w) => w.status.toLowerCase() === 'resolved');
  const dueReviews = data.reviewSchedules.filter((r) => ['due', 'pending', 'rescheduled'].includes(r.status.toLowerCase()) && new Date(r.dueAt).getTime() <= Date.now());
  const groupStats = GROUPS.map((g) => {
    const inGroup = spots.filter((sp) => groupOf(sp.skillId, recoveryBySkill) === g);
    const scored = inGroup.filter((sp) => sp.skill);
    const avg = scored.length ? scored.reduce((n, sp) => n + (sp.skill?.masteryScore ?? 0), 0) / scored.length : null;
    return { group: g, count: inGroup.length, avg, ready: inGroup.filter((sp) => recoveryBySkill.get(sp.skillId)?.unlocked && (recoveryBySkill.get(sp.skillId)?.openMistakes ?? 0) > 0).length };
  });
  const visible = cat === 'all' ? spots : spots.filter((s) => groupOf(s.skillId, recoveryBySkill) === cat);
  const top = spots[0];
  const topLesson = top?.lessonId;

  return (
    <div className="stagger flex flex-col gap-6">
      <PageTitleBar title={t('Improve')} />

      <FixedCelebration records={data.weaknessRecords} />

      <div className="hero-panel">
        <div className="relative z-10 flex flex-col gap-4">
          {top ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="m-0 text-xs font-bold text-on-brand">{t('Start with this')}</p>
                <p className="m-0 mt-0.5 text-xl font-semibold leading-snug [overflow-wrap:anywhere] [unicode-bidi:plaintext] sm:text-2xl">{prettifySkillId(top.skillId)}</p>
              </div>
              <Link
                to={topLesson ? `/practice/lesson/${encodeURIComponent(topLesson)}` : '/curriculum'}
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
              >
                {topLesson ? t('Practice now') : t('Find a lesson')}
              </Link>
            </div>
          ) : (
            <p className="m-0 text-lg font-semibold">{t('No weak spots right now. Keep learning to stay sharp.')}</p>
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
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-ink">{t('5-minute fix session')}</span>
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={t('Filter by skill type')}>
              {groupStats.map((g) => {
                const active = cat === g.group;
                return (
                  <button
                    key={g.group}
                    type="button"
                    disabled={g.count === 0}
                    aria-pressed={active}
                    onClick={() => setCat(active ? 'all' : g.group)}
                    className={`flex min-h-[4.5rem] cursor-pointer flex-col items-start gap-1 rounded-2xl border-0 p-3 text-start ring-1 transition-colors disabled:cursor-default disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${active ? 'bg-brand-soft ring-brand' : 'bg-surface ring-line hover:bg-surface-muted'}`}
                  >
                    <span className="text-sm font-bold text-ink">{t(GROUP_LABEL[g.group])}</span>
                    <span className="text-xs font-semibold text-ink-muted">
                      {g.count === 0 ? t('All good') : [t('{n} to work on', { n: g.count }), g.avg !== null ? t('Mastery {pct}%', { pct: toPercent(g.avg) }) : ''].filter(Boolean).join(' · ')}
                    </span>
                    {g.ready > 0 && <span className={ui.badge(ui.tone.success)}>{t('{n} ready to retry', { n: g.ready })}</span>}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {visible.map((s) => <SpotCard key={s.skillId} spot={s} mistakes={mistakesBySkill.get(s.skillId) ?? []} recovery={recoveryBySkill.get(s.skillId)} />)}
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
