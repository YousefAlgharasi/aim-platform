import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { QuestionRenderer } from '../practice/QuestionRenderer';
import { submitAttempt } from '../practice/practiceApi';
import { recoveryApi, type RecoveryStart } from '../learner/learnerApi';
import { PILL_PRIMARY, PILL_SECONDARY, SessionComplete } from '../learner/sessionUi';
import { ResultIcon, playSound, resultCue } from '../../interaction';
import { prettifySkillId, fetchAimResults } from '../progress/aimApi';
import { useAuth } from '../../hooks/useAuth';

/**
 * Scored retry for one weak skill. Unlike "My mistakes" (a drill), every answer here is a real attempt: it goes
 * through POST /sessions/:id/attempt, so the AIM engine updates mastery. This page never computes mastery; it
 * only reads the engine's value before and after.
 */
export function RecoveryRetryPage() {
  const { t } = useI18n();
  const { skillKey = '' } = useParams();
  const { user } = useAuth();
  const [run, setRun] = useState<RecoveryStart | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [busy, setBusy] = useState(false);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const shownAt = useRef(new Date());

  const masteryOf = useCallback(async () => {
    if (!user?.id) return null;
    const r = await fetchAimResults(user.id);
    return r.skillStates.find((s) => s.skillId === skillKey)?.masteryScore ?? null;
  }, [user?.id, skillKey]);

  const load = useCallback(() => {
    setError(''); setLocked(null); setRun(null); setIndex(0); setPicked(null); setVerdict(null); setRight(0); setAfter(null);
    void masteryOf().then(setBefore).catch(() => setBefore(null));
    // The overview says whether the cooldown is over (and when it ends), so a locked skill shows a friendly screen.
    recoveryApi.overview()
      .then(async (o) => {
        const skill = o.skills.find((x) => x.skillKey === skillKey);
        if (skill && !skill.unlocked && skill.retryAvailableAt) { setLocked(skill.retryAvailableAt); return; }
        const r = await recoveryApi.start(skillKey);
        setRun(r); shownAt.current = new Date();
      })
      .catch((e: unknown) => setError(getErrorMessage(e, t('Could not start your retry'))));
  }, [skillKey, masteryOf, t]);
  useEffect(() => { load(); }, [load]);

  const name = prettifySkillId(skillKey);
  const done = !!run && index >= run.questions.length;
  // Read the engine's updated mastery once the last answer is in (the pipeline may take a moment).
  useEffect(() => {
    if (!done) return;
    let tries = 0;
    const tick = () => { void masteryOf().then((m) => { setAfter(m); }).catch(() => undefined); if (++tries < 3) timer = setTimeout(tick, 2500); };
    let timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [done, masteryOf]);

  if (locked) {
    return (
      <div className="flex w-full flex-col gap-6">
        <SessionComplete title={t('Retry opens soon')} score={0} total={0}
          summary={t('Spacing your retry helps you remember it for good. It opens on {date}. Until then, learn it with the AI Teacher.', { date: new Date(locked).toLocaleDateString() })}>
          <Link to="/improve" className={PILL_PRIMARY}>{t('Back to Improve')}</Link>
        </SessionComplete>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!run) return <QuestionSkeleton />;

  if (done) {
    const moved = before !== null && after !== null ? Math.round((after - before) * 100) : null;
    return (
      <div className="flex w-full flex-col gap-6">
        <SessionComplete title={t('Retry complete')} score={right} total={run.questions.length}
          summary={[
            t('You got {right} of {total} right on {skill}.', { right, total: run.questions.length, skill: name }),
            before !== null && after !== null
              ? t('Mastery {from}% → {to}%', { from: Math.round(before * 100), to: Math.round(after * 100) }) + (moved !== null && moved > 0 ? ' ↑' : '')
              : t('Your mastery is being updated.'),
          ].join(' ')}>
          <Link to="/improve" className={PILL_PRIMARY}>{t('Back to Improve')}</Link>
          <Link to={`/ai-teacher`} className={PILL_SECONDARY}>{t('Ask AI Teacher')}</Link>
        </SessionComplete>
      </div>
    );
  }

  const item = run.questions[index];
  async function check() {
    if (!picked || verdict !== null || busy) return;
    setBusy(true);
    try {
      const startedAt = new Date(Math.min(shownAt.current.getTime() - 2000, Date.now())).toISOString();
      const res = await submitAttempt(run!.sessionId, { itemId: item.itemId, answerValue: picked, startedAt });
      const ok = !!res.isCorrect;
      setVerdict(ok);
      const cue = resultCue(ok);
      if (cue) playSound(cue);
      if (ok) setRight((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() { setPicked(null); setVerdict(null); shownAt.current = new Date(); setIndex((i) => i + 1); }

  const question = {
    id: item.itemId, type: item.type, stem: item.prompt, difficulty: '', tags: [],
    options: item.options.map((o, i) => ({ id: o.id, text: o.text, order: i })),
  };
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link to="/improve" aria-label={t('Exit practice')} title={t('Exit practice')}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink-soft no-underline ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <span aria-hidden="true" className="text-lg leading-none">✕</span>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-sm font-medium text-ink-muted">{t('Retry')}</h1>
          <span className="block truncate text-lg font-semibold text-ink">{name}</span>
        </div>
        <span className="lp-num text-base font-semibold text-ink">{index + 1}<span className="text-ink-muted">/{run.questions.length}</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={run.questions.length} aria-label={t('Round progress')}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.round(((index + (verdict !== null ? 1 : 0)) / run.questions.length) * 100)}%` }} />
      </div>
      <QuestionRenderer key={item.itemId} question={question} questionNumber={index + 1} questionTotal={run.questions.length}
        selectedAnswer={picked ?? ''} onAnswerChange={setPicked} disabled={busy || verdict !== null} result={verdict ?? undefined} />
      {verdict !== null && (
        <div role="status" className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${verdict ? 'bg-success-soft ring-success-line text-success-ink' : 'bg-danger-soft ring-danger-line text-danger-ink'}`}>
          <ResultIcon correct={verdict} className="size-7" />
          <p className="m-0 text-lg font-semibold">{verdict ? t('Right') : t('Not quite')}</p>
        </div>
      )}
      <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
        {verdict !== null ? (
          <Button variant="primary" size="lg" fullWidth onClick={next}>{index + 1 < run.questions.length ? t('Next question →') : t('Finish retry')}</Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => void check()} disabled={!picked} loading={busy}>{busy ? t('Checking…') : t('Check answer')}</Button>
        )}
      </div>
    </div>
  );
}
