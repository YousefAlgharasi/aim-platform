import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  errorCode,
  fetchPlacementResult,
  formatPlacementLevel,
  humanize,
  skillLabel,
  type PlacementResult,
} from './placementApi';
import { useI18n } from '../../i18n/I18nContext';
import { Badge, BODY, CARD, H2, PageHeader, type BadgeTone } from './ui';

const SIGNAL_TONES: Record<string, BadgeTone> = {
  strong: 'emerald',
  developing: 'amber',
  emerging: 'red',
};

const SHELL = 'mx-auto w-full max-w-3xl flex flex-col gap-6';
const SECTION_TITLE = 'm-0 px-1 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white';

// Same polling policy as Flutter PlacementResultNotifier.
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2000;

const SIGNAL_LABELS: Record<string, string> = {
  strong: 'Strong',
  developing: 'Developing',
  emerging: 'Emerging',
};

export function PlacementResultPage() {
  const { t, plural } = useI18n();
  const { id = '' } = useParams<{ id: string }>();
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<number | null>(null);

  const fetchResult = useCallback((attempt = 1) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    if (attempt === 1) {
      setLoading(true);
      setError('');
    }
    fetchPlacementResult(id)
      .then((r) => {
        setResult(r);
        setPending(false);
        setLoading(false);
      })
      .catch((err) => {
        const code = errorCode(err);
        const notReady = code === 'ATTEMPT_NOT_COMPLETED' || code === 'RESULT_NOT_FOUND' || code === 'ATTEMPT_NOT_SUBMITTED';
        if (notReady && attempt < MAX_POLL_ATTEMPTS) {
          setPending(true);
          setLoading(false);
          timer.current = window.setTimeout(() => fetchResult(attempt + 1), POLL_INTERVAL_MS);
          return;
        }
        setPending(false);
        setLoading(false);
        setError(
          notReady
            ? t('Your result is still being prepared. Please check again in a moment.')
            : getErrorMessage(err, t('Failed to load result')),
        );
      });
  }, [id, t]);

  useEffect(() => {
    fetchResult(1);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [fetchResult]);

  if (loading) return <LoadingSpinner />;
  if (pending) {
    return (
      <div className={`${SHELL} max-w-xl`}>
        <div className="w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-6 flex flex-col items-center text-center gap-3" role="status">
          <LoadingSpinner />
          <h2 className={H2}>{t('Calculating your level…')}</h2>
          <p className={BODY}>{t('This usually takes a few seconds.')}</p>
        </div>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={() => fetchResult(1)} />;
  if (!result) return null;

  const level = formatPlacementLevel(result.estimated_level);
  const skills = Object.entries(result.skill_mastery_map ?? {});
  const weaknesses = [...(result.weakness_map?.weaknesses ?? [])].sort((a, b) => a.priority - b.priority);
  const writing = result.additional_signals?.writing ?? null;
  const speaking = result.additional_signals?.speaking ?? null;

  return (
    <div className={SHELL}>
      <PageHeader eyebrow={t('Placement Test')} title={t('Placement Result')} />

      <div className="bg-gradient-to-b from-indigo-50/60 via-white to-slate-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-2xl ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm p-6 flex flex-col items-center text-center gap-3">
        <div className="relative mb-1">
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl opacity-25 blur-lg" />
          <div className="relative min-w-24 h-24 px-3 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25">
            <span className="font-extrabold text-4xl tracking-tight leading-none">{level.code ?? level.label}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mt-1">{t('Level')}</span>
          </div>
        </div>
        <h2 className={H2}>{t('Your level')}</h2>
        {level.code && (
          <span className="inline-block px-3 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] tracking-wider uppercase">
            {level.label}
          </span>
        )}
        {result.note && <p className={`${BODY} max-w-md`}>{result.note}</p>}
        {result.unlocked_course_ids?.length > 0 && (
          <p className="m-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {plural(result.unlocked_course_ids.length, {
              one: t('1 course unlocked for your level.'),
              two: t('2 courses unlocked for your level.'),
              few: t('{n} courses unlocked for your level.#few', { n: result.unlocked_course_ids.length }),
              other: t('{n} courses unlocked for your level.', { n: result.unlocked_course_ids.length }),
            })}
          </p>
        )}
      </div>

      {skills.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_TITLE}>{t('Skill summary')}</h2>
          <div className="grid gap-2.5 md:grid-cols-2">
            {skills.map(([code, value]) => (
              <div key={code} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${CARD}`}>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{skillLabel(code)}</span>
                <Badge tone={SIGNAL_TONES[value.signal] ?? 'slate'}>
                  {SIGNAL_LABELS[value.signal] ? t(SIGNAL_LABELS[value.signal]) : humanize(value.signal)}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {weaknesses.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_TITLE}>{t('Focus areas')}</h2>
          <div className="grid gap-2.5 md:grid-cols-2">
            {weaknesses.map((w) => (
              <div key={w.skill_code} className={`flex items-center justify-between gap-3 px-4 py-3.5 ${CARD}`}>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{skillLabel(w.skill_code)}</span>
                <Badge tone="indigo">{t('Priority {n}', { n: w.priority })}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {(writing || speaking) && (
        <section className="flex flex-col gap-3">
          <h2 className={SECTION_TITLE}>{t('Writing & speaking feedback')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {writing && (
              <Card>
                <div className="flex flex-col gap-2">
                  <Badge tone="indigo">{t('Writing · {score}/10', { score: writing.score })}</Badge>
                  <p className={BODY}>{writing.feedback}</p>
                </div>
              </Card>
            )}
            {speaking && (
              <Card>
                <div className="flex flex-col gap-2">
                  <Badge tone="violet">{t('Speaking · {score}/10', { score: speaking.score })}</Badge>
                  <p className={BODY}>{speaking.feedback}</p>
                  {speaking.transcript && (
                    <p className="m-0 border-s-[3px] border-[#4F46E5] bg-[#F1F5F9] dark:bg-slate-900/60 rounded-e-lg p-3 text-sm italic text-slate-500 dark:text-slate-400">
                      “{speaking.transcript}”
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/curriculum" className="flex-1">
          <Button variant="primary" size="lg" fullWidth>{t('Browse courses')}</Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button variant="secondary" size="lg" fullWidth>{t('Go to Dashboard')}</Button>
        </Link>
      </div>
    </div>
  );
}
