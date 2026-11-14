import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { QuestionSkeleton } from '../../components/common/Skeleton';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { BookIcon, HeadphonesIcon, LightbulbIcon } from '../../components/common/Icons';
import { ResultIcon, playSound, resultCue } from '../../interaction';
import { QuestionRenderer } from './QuestionRenderer';
import { submitAttempt, type SessionQuestion } from './practiceApi';
import { isPracticeMode, skillPracticeApi, type PracticeMode, type PracticeSkill, type PracticeStart } from './skillPracticeApi';
import { PILL_PRIMARY, PILL_SECONDARY, SessionComplete } from '../learner/sessionUi';
import { fetchAimResults } from '../progress/aimApi';
import { useAuth } from '../../hooks/useAuth';

const MODE_INFO: Record<PracticeMode, { title: string; blurb: string }> = {
  grammar: { title: 'Grammar practice', blurb: 'Short drills on one grammar point, matched to your level.' },
  listening: { title: 'Listening practice', blurb: 'Listen to a short recording, then answer questions about it.' },
  reading: { title: 'Reading practice', blurb: 'Read a short passage, then answer questions about it.' },
};

export function ModeIcon({ mode, className }: { mode: PracticeMode; className?: string }) {
  return mode === 'grammar' ? <LightbulbIcon className={className} /> : mode === 'listening' ? <HeadphonesIcon className={className} /> : <BookIcon className={className} />;
}

/**
 * Grammar / Listening / Reading practice. Step 1 picks a skill (the weakest one is suggested); step 2 is a real
 * learning session: every answer goes through POST /sessions/:id/attempt, so the AIM engine updates mastery.
 * This page never computes mastery; it only shows the engine's value before and after.
 */
export function SkillPracticePage() {
  const { mode: modeParam } = useParams();
  if (!isPracticeMode(modeParam)) return <Navigate to="/practice" replace />;
  return <SkillPractice key={modeParam} mode={modeParam} />;
}

function SkillPractice({ mode }: { mode: PracticeMode }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<PracticeSkill[] | null>(null);
  const [run, setRun] = useState<PracticeStart | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [busy, setBusy] = useState(false);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const shownAt = useRef(new Date());
  const info = MODE_INFO[mode];

  const loadSkills = useCallback(() => {
    setError(''); setSkills(null);
    skillPracticeApi.skills(mode).then((r) => setSkills(r.skills)).catch((e) => setError(getErrorMessage(e, t('Could not load your practice'))));
  }, [mode, t]);
  useEffect(() => { loadSkills(); }, [loadSkills]);

  const masteryOf = useCallback(async (skillKey: string) => {
    if (!user?.id) return null;
    const r = await fetchAimResults(user.id);
    return r.skillStates.find((s) => s.skillId === skillKey)?.masteryScore ?? null;
  }, [user?.id]);

  async function start(skill: PracticeSkill) {
    if (starting) return;
    setStarting(skill.skillKey); setError('');
    try {
      void masteryOf(skill.skillKey).then(setBefore).catch(() => setBefore(null));
      const r = await skillPracticeApi.start(mode, skill.skillKey);
      setRun(r); setIndex(0); setPicked(''); setVerdict(null); setRight(0); setAfter(null); shownAt.current = new Date();
    } catch (e) {
      setError(getErrorMessage(e, t('We could not prepare this practice right now. Please try again in a moment.')));
    } finally { setStarting(null); }
  }

  const done = !!run && index >= run.questions.length;
  useEffect(() => {
    if (!done || !run) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => { void masteryOf(run.skillKey).then(setAfter).catch(() => undefined); if (++tries < 3) timer = setTimeout(tick, 2500); };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [done, run, masteryOf]);

  // ── Step 1: pick a skill ──
  if (!run) {
    if (error && !skills) return <ErrorState message={error} onRetry={loadSkills} />;
    const rec = skills?.find((s) => s.recommended);
    return (
      <div className="flex w-full flex-col gap-6">
        <PageTitleBar title={t(info.title)} />
        <p className="m-0 text-base text-ink-muted">{t(info.blurb)}</p>
        {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger-ink">{error}</p>}
        {!skills ? <QuestionSkeleton /> : skills.length === 0 ? (
          <p className="m-0 text-base text-ink-muted">{t('No practice is available for this skill area yet')}</p>
        ) : (
          <>
            {rec && (
              <section className="flex flex-col gap-4 rounded-2xl bg-brand p-6 text-white" aria-label={t('Recommended for you')}>
                <div>
                  <p className="m-0 text-xs font-bold">{t('Recommended for you')}</p>
                  <p className="lp-display m-0 mt-1 text-[1.5rem] font-semibold [overflow-wrap:anywhere]">{rec.title}</p>
                </div>
                <button type="button" onClick={() => void start(rec)} disabled={!!starting}
                  className="inline-flex h-14 items-center justify-center rounded-full border-0 bg-white px-8 text-base font-semibold text-brand transition hover:bg-white/90 active:scale-[0.98] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  {starting === rec.skillKey ? t('Preparing…') : t('Start practice')}
                </button>
              </section>
            )}
            <section className="flex flex-col gap-2" aria-label={t('All skills')}>
              <h2 className="m-0 px-1 text-sm font-semibold text-ink-muted">{t('Choose a skill')}</h2>
              {skills.map((s) => {
                const pct = s.masteryScore == null ? null : Math.round(s.masteryScore * 100);
                return (
                  <button key={s.skillKey} type="button" onClick={() => void start(s)} disabled={!!starting}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border-0 bg-surface p-4 text-start ring-1 ring-line transition-colors hover:bg-surface-muted hover:ring-line-strong disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-strong text-ink" aria-hidden="true"><ModeIcon mode={mode} className="size-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-semibold text-ink [unicode-bidi:plaintext]">{s.title}</span>
                      <span className="block text-xs font-semibold text-ink-muted">{pct == null ? t('Not practised yet') : t('Mastery {pct}%', { pct })}</span>
                    </span>
                    <span className="text-sm font-bold text-brand-ink">{starting === s.skillKey ? t('Preparing…') : t('Start')}</span>
                  </button>
                );
              })}
            </section>
          </>
        )}
        <Link to="/practice" className={`${PILL_SECONDARY} self-start`}>{t('Back to Practice')}</Link>
      </div>
    );
  }

  // ── Done ──
  if (done) {
    const line = before !== null && after !== null
      ? t('Mastery {from}% → {to}%', { from: Math.round(before * 100), to: Math.round(after * 100) }) + (after > before ? ' ↑' : '')
      : t('Your mastery is being updated.');
    return (
      <div className="flex w-full flex-col gap-6">
        <SessionComplete title={t('Practice complete')} score={right} total={run.questions.length}
          summary={`${run.title}. ${line}`}>
          <button type="button" className={PILL_PRIMARY} onClick={() => { const s = skills?.find((x) => x.skillKey === run.skillKey); setRun(null); if (s) void start(s); }}>{t('Practice again')}</button>
          <button type="button" className={PILL_SECONDARY} onClick={() => { setRun(null); loadSkills(); }}>{t('Choose another skill')}</button>
          <Link to="/practice" className={PILL_SECONDARY}>{t('Back to Practice')}</Link>
        </SessionComplete>
      </div>
    );
  }

  // ── Step 2: the session ──
  const item = run.questions[index];
  const question: SessionQuestion = {
    id: item.itemId, type: item.type, stem: item.prompt, difficulty: '', tags: [],
    options: item.options.map((o, i) => ({ id: o.id, text: o.text, order: i })),
  };
  async function check() {
    if (!picked.trim() || verdict !== null || busy) return;
    setBusy(true);
    try {
      const startedAt = new Date(Math.min(shownAt.current.getTime() - 2000, Date.now())).toISOString();
      const res = await submitAttempt(run!.sessionId, { itemId: item.itemId, answerValue: picked.trim(), startedAt });
      const ok = !!res.isCorrect;
      setVerdict(ok);
      const cue = resultCue(ok);
      if (cue) playSound(cue);
      if (ok) setRight((n) => n + 1);
    } catch (e) { setError(getErrorMessage(e, t('Could not check your answer'))); }
    finally { setBusy(false); }
  }
  function next() { setPicked(''); setVerdict(null); shownAt.current = new Date(); setIndex((i) => i + 1); }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <button type="button" aria-label={t('Exit practice')} title={t('Exit practice')} onClick={() => navigate('/practice')}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-soft ring-1 ring-line-strong transition-colors hover:bg-danger-soft hover:text-danger-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
          <span aria-hidden="true" className="text-lg leading-none">✕</span>
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-sm font-medium text-ink-muted">{t(info.title)}</h1>
          <span className="block truncate text-lg font-semibold text-ink [unicode-bidi:plaintext]">{run.title}</span>
        </div>
        <span className="lp-num text-base font-semibold text-ink">{index + 1}<span className="text-ink-muted">/{run.questions.length}</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={index} aria-valuemin={0} aria-valuemax={run.questions.length} aria-label={t('Round progress')}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${Math.round(((index + (verdict !== null ? 1 : 0)) / run.questions.length) * 100)}%` }} />
      </div>

      {run.passage && (
        <section className="rounded-2xl bg-surface-muted p-4 ring-1 ring-line" aria-label={t('Reading passage')}>
          <p className="m-0 mb-1 text-xs font-bold text-ink-muted">{t('Reading passage')}</p>
          <p className="m-0 whitespace-pre-line text-base leading-relaxed text-ink [unicode-bidi:plaintext]">{run.passage}</p>
        </section>
      )}

      <QuestionRenderer key={item.itemId} question={question} questionNumber={index + 1} questionTotal={run.questions.length}
        selectedAnswer={picked} onAnswerChange={setPicked} disabled={busy || verdict !== null} result={verdict ?? undefined} />
      {error && <p role="alert" className="m-0 rounded-xl bg-danger-soft p-3 text-sm font-semibold text-danger-ink">{error}</p>}
      {verdict !== null && (
        <div role="status" className={`flex items-center gap-3 rounded-2xl p-4 ring-1 ${verdict ? 'bg-success-soft ring-success-line text-success-ink' : 'bg-danger-soft ring-danger-line text-danger-ink'}`}>
          <ResultIcon correct={verdict} className="size-7" />
          <p className="m-0 text-lg font-semibold">{verdict ? t('Right') : t('Not quite')}</p>
        </div>
      )}
      <div className="sticky bottom-3 z-10 -mx-1 rounded-2xl bg-page/85 p-1 backdrop-blur-md">
        {verdict !== null ? (
          <Button variant="primary" size="lg" fullWidth onClick={next}>{index + 1 < run.questions.length ? t('Next question →') : t('Finish practice')}</Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={() => void check()} disabled={!picked.trim()} loading={busy}>{busy ? t('Checking…') : t('Check answer')}</Button>
        )}
      </div>
    </div>
  );
}
