import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { ThemeToggleButton } from '../../components/common/ThemeToggleButton';
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher';
import { StartCardSkeleton } from '../../components/common/Skeleton';
import { studyPlanApi, type PlanGoal } from '../learner/learnerApi';
import { setPlacementDecision, type PlacementDecision } from '../placement/placementApi';
import { cacheSetupDone, fetchSetupStatus, type SetupStatus } from './setupStatus';
import { ensureStartingCourse } from './enrollStart';
import { ED_BODY, ED_BTN, EdProgress, edRow } from '../placement/ed';
import '../landing/landing.css';

const GOALS: Array<{ id: PlanGoal; label: string; hint: string }> = [
  { id: 'work', label: 'For work', hint: 'Emails, meetings and interviews' },
  { id: 'study', label: 'For school or university', hint: 'Exams and coursework' },
  { id: 'travel', label: 'For travel', hint: 'Getting around and talking to people' },
  { id: 'fun', label: 'For fun', hint: 'Movies, music and friends' },
  { id: 'other', label: 'Something else', hint: 'I have my own reason' },
];
const MINUTES = [10, 20, 30, 45];
const STEPS = 4;

/**
 * Full-screen setup before the dashboard: goal, daily time, reminder, then "start from zero or
 * take the placement test". Progress lives on the server (study plan + placement decision), so
 * it resumes at the right step and cannot be skipped.
 */
export function StartPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = !!user?.roles.includes('student');
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<PlanGoal | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [reminder, setReminder] = useState('19:00');
  const [wantsReminder, setWantsReminder] = useState(true);
  const [choice, setChoice] = useState<PlacementDecision | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isStudent) return;
    let alive = true;
    fetchSetupStatus().then((s) => {
      if (!alive) return;
      setStatus(s);
      setStep(s.needsPlan ? 0 : 3);
    });
    return () => { alive = false; };
  }, [isStudent]);

  if (!isStudent) return <Navigate to="/" replace />;

  // Questions and choice are done: either the test is still owed (locked into it) or all is finished.
  if (status && !status.needsPlan && !status.needsChoice) {
    if (status.needsPlacement) return <Navigate to="/placement" replace />;
    if (user) cacheSetupDone(user.id);
    return <Navigate to="/dashboard" replace />;
  }

  async function savePlan() {
    if (!goal || !minutes) return;
    setBusy(true); setError('');
    try {
      const { plan } = await studyPlanApi.save({ goal, dailyMinutes: minutes, reminderTime: wantsReminder ? reminder : null });
      await studyPlanApi.setDailyGoal(plan.dailyGoalLessons).catch(() => undefined);
      if (status && !status.needsChoice) {
        if (!status.needsPlacement && user) cacheSetupDone(user.id);
        navigate(status.needsPlacement ? '/placement' : '/dashboard', { replace: true });
        return;
      }
      setStep(3);
    } catch (e) {
      setError(getErrorMessage(e, t('Could not save your plan')));
    } finally {
      setBusy(false);
    }
  }

  async function choose(decision: PlacementDecision) {
    setBusy(true); setError('');
    try {
      await setPlacementDecision(decision);
      // "Start from zero" goes straight to the dashboard, so give them the beginner course to follow there.
      if (decision === 'start_from_scratch') await ensureStartingCourse();
      // Only "start from zero" unlocks the dashboard now; the placement test must be completed first.
      if (decision === 'start_from_scratch' && user) cacheSetupDone(user.id);
      navigate(decision === 'take_placement' ? '/placement' : '/dashboard', { replace: true });
    } catch (e) {
      setError(getErrorMessage(e, t('Could not save your choice. Please try again.')));
      setBusy(false);
    }
  }

  const STEP_LABELS = [t('Your goal'), t('Daily time'), t('Reminder'), t('Starting point')];

  function next() {
    if (step === 0 && goal) setStep(1);
    else if (step === 1 && minutes) setStep(2);
    else if (step === 2) void savePlan();
    else if (step === 3 && choice) void choose(choice);
  }
  function back() {
    if (step === 3) setStep(2);
    else if (step > 0) setStep(step - 1);
  }
  const canNext =
    !busy && ((step === 0 && !!goal) || (step === 1 && !!minutes) || (step === 2 && !!goal && !!minutes && (!wantsReminder || !!reminder)) || (step === 3 && !!choice));
  const canBack = step > 0 && !(step === 3 && status && !status.needsPlan);
  const nextLabel = busy ? t('Saving…') : step === 3 ? (choice === 'take_placement' ? t('Start the placement test') : t('Start learning')) : t('Continue');
  const h1 = 'lp-display m-0 text-[2.25rem] font-semibold text-ink sm:text-[2.75rem] rtl:text-4xl';

  // One choice per row, hairlines between rows; the selected row reads in ink with a brand dot.
  const radio = (selected: boolean, label: string, hint: string, onPick: () => void) => (
    <button key={label} type="button" role="radio" aria-checked={selected} onClick={onPick} disabled={busy}
      className={`flex w-full cursor-pointer items-start gap-4 border-0 bg-transparent px-1 py-4 text-start transition-colors focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${selected ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}>
      <span aria-hidden className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ring-2 transition-colors ${selected ? 'ring-brand' : 'ring-line-strong'}`}>
        {selected && <span className="size-3 rounded-full bg-brand" />}
      </span>
      <span className="min-w-0">
        <span className={`block text-lg leading-snug ${selected ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        <span className="mt-0.5 block text-[15px] leading-relaxed text-ink-muted">{hint}</span>
      </span>
    </button>
  );
  const group = 'flex flex-col divide-y divide-line border-y border-line';

  return (
    <div className="lp lp-auth lp-full flex min-h-screen flex-col bg-page text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
          <span className="text-[22px] font-bold leading-none tracking-tight text-ink rtl:tracking-normal">AIM</span>
          <div className="flex items-center gap-1.5"><ThemeToggleButton /><LanguageSwitcher /></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:py-20">
        {!status ? <StartCardSkeleton /> : (
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
            {/* Where you are: a real sequence, so it is numbered. */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <div className="lg:hidden">
                  <p className="m-0 mb-3 text-sm font-medium text-ink-muted">
                    <span className="lp-num font-semibold text-ink">{step + 1}</span> / {STEPS}{'  '}{STEP_LABELS[step]}
                  </p>
                  <EdProgress value={step} total={STEPS} label={t('Step {n} of {total}', { n: step + 1, total: STEPS })} />
                </div>
                <div className="hidden lg:block" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} aria-label={t('Step {n} of {total}', { n: step + 1, total: STEPS })}>
                  <h2 className="m-0 text-lg font-semibold text-ink">{t('Set up your learning')}</h2>
                  <p className="m-0 mt-1 text-[15px] text-ink-muted">{t('Getting started with AIM')}</p>
                  <ol className="m-0 mt-8 list-none border-y border-line p-0" aria-label={t('Setup steps')}>
                    {STEP_LABELS.map((label, i) => {
                      const done = i < step;
                      const current = i === step;
                      return (
                        <li key={label} aria-current={current ? 'step' : undefined} className={`flex items-center gap-4 py-4 ${edRow(i)}`}>
                          <span className={`lp-num grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${done ? 'bg-success-soft text-success-ink' : current ? 'bg-brand text-white' : 'text-ink-muted ring-1 ring-line-strong'}`}>
                            {done ? <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M20 6L9 17l-5-5" /></svg> : i + 1}
                          </span>
                          <span className={`text-lg ${current ? 'font-semibold text-ink' : done ? 'font-medium text-ink-soft' : 'font-medium text-ink-muted'}`}>{label}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </aside>

            {/* The question. */}
            <section className="flex flex-col gap-8 lg:col-span-7 lg:col-start-6 lg:min-h-[28rem]">
              {error && <Banner variant="error">{error}</Banner>}

              {step === 0 && (
                <>
                  <div><h1 className={h1}>{t('Why are you learning English?')}</h1><p className={`${ED_BODY} mt-3`}>{t('We use this to shape your daily plan.')}</p></div>
                  <div role="radiogroup" aria-label={t('Why are you learning English?')} className={group}>
                    {GOALS.map((g) => radio(goal === g.id, t(g.label), t(g.hint), () => setGoal(g.id)))}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div><h1 className={h1}>{t('How much time can you study each day?')}</h1><p className={`${ED_BODY} mt-3`}>{t('A small daily habit beats a long session once a week.')}</p></div>
                  <div role="radiogroup" aria-label={t('How much time can you study each day?')} className={group}>
                    {MINUTES.map((m) => radio(minutes === m, t('{n} minutes', { n: m }), t('About {n} lessons a day', { n: Math.max(1, Math.round(m / 10)) }), () => setMinutes(m)))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div><h1 className={h1}>{t('When should we remind you?')}</h1><p className={`${ED_BODY} mt-3`}>{t('A gentle nudge helps you keep your streak.')}</p></div>
                  <div className={group}>
                    <label className="flex cursor-pointer items-center gap-4 px-1 py-4 text-ink">
                      <input type="checkbox" checked={wantsReminder} onChange={(e) => setWantsReminder(e.target.checked)} className="size-6 accent-[rgb(var(--c-brand))]" />
                      <span className="text-lg font-semibold">{t('Remind me every day')}</span>
                    </label>
                    {wantsReminder && (
                      <label className="flex items-center justify-between gap-4 px-1 py-4 text-lg font-medium text-ink-soft">
                        {t('Reminder time')}
                        <input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} required
                          className="h-12 w-40 rounded-xl border border-line-strong bg-transparent px-4 text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand/30" />
                      </label>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div><h1 className={h1}>{t('Where do you want to start?')}</h1><p className={`${ED_BODY} mt-3`}>{t('The placement test is timed and cannot be paused once you begin.')}</p></div>
                  <div role="radiogroup" aria-label={t('Where do you want to start?')} className={group}>
                    {radio(choice === 'take_placement', t('Take the placement test'), t('A short test places you at the right level, so you never repeat what you already know.'), () => setChoice('take_placement'))}
                    {radio(choice === 'start_from_scratch', t('Start from zero'), t('Begin at the first level and build up step by step.'), () => setChoice('start_from_scratch'))}
                  </div>
                </>
              )}

              <div className="mt-auto flex items-center gap-3">
                {canBack && (
                  <button type="button" onClick={back} disabled={busy} aria-label={t('Back')}
                    className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink-soft ring-1 ring-line-strong transition hover:bg-surface-strong hover:text-ink disabled:opacity-50">
                    <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 rtl:-scale-x-100"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
                  </button>
                )}
                <Button size="lg" className={`${ED_BTN} flex-1`} onClick={next} disabled={!canNext}>{nextLabel}</Button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
