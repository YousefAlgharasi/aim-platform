import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { getErrorMessage } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Banner } from '../../components/common/Banner';
import { studyPlanApi, type PlanGoal } from './learnerApi';
import { markOnboardingDone } from './onboardingState';

const GOALS: Array<{ id: PlanGoal; label: string; hint: string }> = [
  { id: 'work', label: 'For work', hint: 'Emails, meetings and interviews' },
  { id: 'study', label: 'For school or university', hint: 'Exams and coursework' },
  { id: 'travel', label: 'For travel', hint: 'Getting around and talking to people' },
  { id: 'fun', label: 'For fun', hint: 'Movies, music and friends' },
  { id: 'other', label: 'Something else', hint: 'I have my own reason' },
];
const MINUTES = [10, 20, 30, 45];

/** Three quick questions that set the daily goal and reminder. Skippable; changeable later in Settings. */
export function OnboardingPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<PlanGoal | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [reminder, setReminder] = useState('19:00');
  const [wantsReminder, setWantsReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function finish() {
    markOnboardingDone(user?.id);
    navigate('/', { replace: true });
  }

  async function save() {
    if (!goal || !minutes) return;
    setSaving(true); setError('');
    try {
      const { plan } = await studyPlanApi.save({ goal, dailyMinutes: minutes, reminderTime: wantsReminder ? reminder : null });
      await studyPlanApi.setDailyGoal(plan.dailyGoalLessons).catch(() => undefined);
      finish();
    } catch (e) {
      setError(getErrorMessage(e, t('Could not save your plan')));
      setSaving(false);
    }
  }

  const option = (selected: boolean) =>
    `w-full cursor-pointer rounded-2xl border-0 px-4 py-4 text-start ring-1 transition-colors ${
      selected ? 'bg-brand-soft ring-brand text-brand-ink' : 'bg-surface ring-line text-ink hover:ring-brand-line'}`;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} aria-label={t('Step {n} of 3', { n: step + 1 })}>
          {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 w-10 rounded-full ${i <= step ? 'bg-gradient-to-r from-brand to-secondary' : 'bg-surface-strong'}`} />)}
        </div>
        <button type="button" onClick={finish} className="cursor-pointer border-0 bg-transparent px-2 py-2 text-sm font-semibold text-ink-muted hover:text-ink">{t('Skip for now')}</button>
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-3">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('Why are you learning English?')}</h1>
          <p className="m-0 text-sm text-ink-muted">{t('We use this to shape your daily plan.')}</p>
          {GOALS.map((g) => (
            <button key={g.id} type="button" className={option(goal === g.id)} onClick={() => { setGoal(g.id); setStep(1); }} aria-pressed={goal === g.id}>
              <span className="block text-base font-bold">{t(g.label)}</span>
              <span className="block text-sm opacity-80">{t(g.hint)}</span>
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-3">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('How much time can you study each day?')}</h1>
          <p className="m-0 text-sm text-ink-muted">{t('A small daily habit beats a long session once a week.')}</p>
          {MINUTES.map((m) => (
            <button key={m} type="button" className={option(minutes === m)} onClick={() => { setMinutes(m); setStep(2); }} aria-pressed={minutes === m}>
              <span className="block text-base font-bold">{t('{n} minutes', { n: m })}</span>
              <span className="block text-sm opacity-80">{t('About {n} lessons a day', { n: Math.max(1, Math.round(m / 10)) })}</span>
            </button>
          ))}
          <Button variant="ghost" onClick={() => setStep(0)}>{t('Back')}</Button>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-ink">{t('When should we remind you?')}</h1>
          {error && <Banner variant="error">{error}</Banner>}
          <label className="flex items-center gap-3 text-ink">
            <input type="checkbox" checked={wantsReminder} onChange={(e) => setWantsReminder(e.target.checked)} className="size-5 accent-[rgb(var(--c-brand))]" />
            <span className="font-semibold">{t('Remind me every day')}</span>
          </label>
          {wantsReminder && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
              {t('Reminder time')}
              <input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} required
                className="h-12 w-40 rounded-2xl border border-line bg-field px-4 text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" />
            </label>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>{t('Back')}</Button>
            <Button onClick={() => void save()} disabled={saving || !goal || !minutes}>{saving ? t('Saving…') : t('Start learning')}</Button>
          </div>
        </section>
      )}
    </div>
  );
}
