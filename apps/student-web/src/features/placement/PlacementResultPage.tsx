import { DetailSkeleton } from '../../components/common/Skeleton';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
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
import { useAuth } from '../../hooks/useAuth';
import { cacheSetupDone } from '../start/setupStatus';
import { ensureStartingCourse } from '../start/enrollStart';
import { ED_BODY, ED_BTN, ED_H2, ED_SHELL, EdHeader, edRow } from './ed';

const SIGNAL_DOT: Record<string, string> = { strong: 'bg-success', developing: 'bg-warning', emerging: 'bg-danger' };

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
  const { user } = useAuth();

  // A result exists, so the test is completed: the dashboard guard does not need to re-check (no extra loader).
  // The page then stays until the student chooses where to go.
  useEffect(() => {
    if (result && user) cacheSetupDone(user.id);
    // Start the recommended course (if they have none yet) so the dashboard roadmap has lessons to show.
    if (result) void ensureStartingCourse(result.recommended_course_id);
  }, [result, user]);

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

  if (loading) return <DetailSkeleton />;
  if (pending) {
    return (
      <div className={ED_SHELL}>
        <div className="flex flex-col gap-4" role="status">
          <LoadingSpinner />
          <h1 className={ED_H2}>{t('Calculating your level…')}</h1>
          <p className={ED_BODY}>{t('This usually takes a few seconds.')}</p>
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
  const sectionTitle = 'm-0 text-xl font-semibold text-ink';

  return (
    <div className={ED_SHELL}>
      <EdHeader title={t('Placement Result')} />

      {/* The level is the one big thing on this page. */}
      <section className="border-t border-line pt-6">
        <p className="m-0 text-sm text-ink-muted">{t('Your level')}</p>
        <p className="lp-display lp-num m-0 mt-1 text-[clamp(5rem,20vw,9rem)] font-semibold leading-none text-ink">{level.code ?? level.label}</p>
        {level.code && <p className="m-0 mt-3 text-xl font-medium text-ink-soft">{level.label}</p>}
        {result.note && <p className={`${ED_BODY} mt-4 max-w-md`}>{result.note}</p>}
        {result.unlocked_course_ids?.length > 0 && (
          <p className="m-0 mt-4 text-[15px] font-semibold text-success-ink">
            {plural(result.unlocked_course_ids.length, {
              one: t('1 course unlocked for your level.'),
              two: t('2 courses unlocked for your level.'),
              few: t('{n} courses unlocked for your level.#few', { n: result.unlocked_course_ids.length }),
              other: t('{n} courses unlocked for your level.', { n: result.unlocked_course_ids.length }),
            })}
          </p>
        )}
      </section>

      {skills.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={sectionTitle}>{t('Skill summary')}</h2>
          <ul className="m-0 list-none border-y border-line p-0">
            {skills.map(([code, value], i) => (
              <li key={code} className={`flex items-center justify-between gap-3 py-3.5 ${edRow(i)}`}>
                <span className="text-lg font-medium text-ink">{skillLabel(code)}</span>
                <span className="inline-flex items-center gap-2 text-[15px] text-ink-soft">
                  <span aria-hidden className={`size-2 rounded-full ${SIGNAL_DOT[value.signal] ?? 'bg-line-strong'}`} />
                  {SIGNAL_LABELS[value.signal] ? t(SIGNAL_LABELS[value.signal]) : humanize(value.signal)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weaknesses.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className={sectionTitle}>{t('Focus areas')}</h2>
          <ul className="m-0 list-none border-y border-line p-0">
            {weaknesses.map((w, i) => (
              <li key={w.skill_code} className={`flex items-center justify-between gap-3 py-3.5 ${edRow(i)}`}>
                <span className="text-lg font-medium text-ink">{skillLabel(w.skill_code)}</span>
                <span className="lp-num text-[15px] text-ink-muted">{t('Priority {n}', { n: w.priority })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(writing || speaking) && (
        <section className="flex flex-col gap-4">
          <h2 className={sectionTitle}>{t('Writing & speaking feedback')}</h2>
          {writing && (
            <div className="border-t border-line pt-4">
              <p className="m-0 text-[15px] font-semibold text-ink">{t('Writing · {score}/10', { score: writing.score })}</p>
              <p className={`${ED_BODY} mt-1.5`}>{writing.feedback}</p>
            </div>
          )}
          {speaking && (
            <div className="border-t border-line pt-4">
              <p className="m-0 text-[15px] font-semibold text-ink">{t('Speaking · {score}/10', { score: speaking.score })}</p>
              <p className={`${ED_BODY} mt-1.5`}>{speaking.feedback}</p>
              {speaking.transcript && (
                <p className="m-0 mt-3 border-s-2 border-line-strong ps-4 text-[15px] italic text-ink-muted">“{speaking.transcript}”</p>
              )}
            </div>
          )}
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/curriculum" className="flex-1">
          <Button variant="secondary" size="lg" fullWidth className={ED_BTN}>{t('Browse courses')}</Button>
        </Link>
        <Link to="/dashboard" className="flex-1">
          <Button variant="primary" size="lg" fullWidth className={ED_BTN}>{t('Go to Dashboard')}</Button>
        </Link>
      </div>
    </div>
  );
}
