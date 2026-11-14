import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { BookIcon, HeadphonesIcon, LightbulbIcon, MicIcon, PencilIcon } from '../../components/common/Icons';
import { RetryIcon, TargetIcon } from '../../layouts/navItems';
import { mistakesApi, vocabularyApi } from '../learner/learnerApi';

interface Mode { to: string; title: string; body: string; icon: ReactNode; meta?: string; tone: string }

function ModeCard({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  return (
    <Link
      to={mode.to}
      className="group flex h-full flex-col gap-3 rounded-2xl bg-surface p-5 no-underline ring-1 ring-line transition-colors duration-200 hover:bg-surface-muted hover:ring-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-surface-strong text-ink" aria-hidden="true">{mode.icon}</span>
        {mode.meta && <span className="lp-num rounded-full px-3 py-1 text-sm font-semibold text-ink ring-1 ring-line-strong">{mode.meta}</span>}
      </span>
      <span className="flex-1">
        <span className="block text-xl font-semibold tracking-tight text-ink">{t(mode.title)}</span>
        <span className="mt-1 block text-base leading-relaxed text-ink-muted">{t(mode.body)}</span>
      </span>
      <span className="text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 group-hover:decoration-ink">{t('Open')}</span>
    </Link>
  );
}

function Group({ title, modes, tour }: { title: string; modes: Mode[]; tour?: string }) {
  const { t } = useI18n();
  return (
    <section data-tour={tour} className="flex flex-col gap-3" aria-label={t(title)}>
      <h2 className="m-0 text-2xl font-semibold tracking-tight text-ink">{t(title)}</h2>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${modes.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
        {modes.map((m) => <ModeCard key={m.to} mode={m} />)}
      </div>
    </section>
  );
}

/** One place to see every way to practice, with what is waiting for you today. */
export function PracticeHubPage() {
  const { t } = useI18n();
  const [due, setDue] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<number | null>(null);

  // Both counts settle (loaded or failed) before the plan card says anything, so it never flashes the wrong message.
  const [settled, setSettled] = useState({ due: false, mistakes: false });

  useEffect(() => {
    let cancelled = false;
    const done = (key: 'due' | 'mistakes') => { if (!cancelled) setSettled((s) => ({ ...s, [key]: true })); };
    vocabularyApi.list().then((r) => !cancelled && setDue(r.dueCount)).catch(() => !cancelled && setDue(null)).finally(() => done('due'));
    mistakesApi.list().then((r) => !cancelled && setMistakes(r.total)).catch(() => !cancelled && setMistakes(null)).finally(() => done('mistakes'));
    return () => { cancelled = true; };
  }, []);
  const loading = !settled.due || !settled.mistakes;

  const waiting = (mistakes ?? 0) + (due ?? 0);
  const ic = 'size-6';

  return (
    <div className="stagger flex flex-col gap-8">
      <PageTitleBar title={t('Practice')} />

      <section data-tour="practice-plan" className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white sm:p-8" aria-busy={loading}>
        {loading ? (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" role="status" aria-label={t('Loading…')}>
            <div className="min-w-0 flex-1">
              <div className="h-9 w-3/4 max-w-md animate-pulse rounded-lg bg-white/20 motion-reduce:animate-none" />
              <div className="mt-3 h-5 w-2/3 max-w-xs animate-pulse rounded-lg bg-white/15 motion-reduce:animate-none" />
            </div>
            <div className="h-14 w-40 shrink-0 animate-pulse rounded-full bg-white/20 motion-reduce:animate-none" />
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="lp-display m-0 text-[1.75rem] font-semibold sm:text-[2.25rem]">
                {waiting > 0 ? t('Your 5-minute plan is ready') : t('You are all caught up')}
              </p>
              <p className="m-0 mt-2 text-base text-white">
                {waiting > 0
                  ? [mistakes ? t('{n} mistakes to retry', { n: mistakes }) : '', due ? t('{n} words due', { n: due }) : ''].filter(Boolean).join(', ')
                  : t('Try a conversation or a new topic to keep your streak going.')}
              </p>
            </div>
            <Link
              to={mistakes ? '/mistakes?quick=1' : due ? '/vocabulary' : '/ai-teacher'}
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-brand no-underline transition hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
            >
              {waiting > 0 ? t('Start now') : t('Chat with AI Teacher')}
            </Link>
          </div>
        )}
      </section>

      <Group
        title="Train a skill"
        tour="practice-skills"
        modes={[
          { to: '/practice/skill/grammar', title: 'Practice Grammar', body: 'Short drills on one grammar point, matched to your level.', icon: <LightbulbIcon className={ic} />, tone: 'bg-info-soft text-info-ink' },
          { to: '/practice/skill/listening', title: 'Practice Listening', body: 'Listen to a short recording and answer questions.', icon: <HeadphonesIcon className={ic} />, tone: 'bg-accent-soft text-accent-ink' },
          { to: '/practice/skill/reading', title: 'Practice Reading', body: 'Read a short passage and answer questions.', icon: <BookIcon className={ic} />, tone: 'bg-success-soft text-success-ink' },
        ]}
      />
      <Group
        title="Speak and write"
        tour="practice-speak"
        modes={[
          { to: '/practice/speaking', title: 'Practice Speaking', body: 'Pick a topic, talk about it, earn XP.', icon: <MicIcon className={ic} />, tone: 'bg-accent-soft text-accent-ink' },
          { to: '/practice/writing', title: 'Write a Paragraph', body: 'Write on a topic and see exactly what to fix.', icon: <PencilIcon className={ic} />, tone: 'bg-warning-soft text-warning-ink' },
        ]}
      />
      <Group
        title="Remember and fix"
        tour="practice-fix"
        modes={[
          { to: '/vocabulary', title: 'My words', body: 'Review the words you saved with spaced flashcards.', icon: <LightbulbIcon className={ic} />, meta: due ? t('{n} due', { n: due }) : undefined, tone: 'bg-success-soft text-success-ink' },
          { to: '/mistakes', title: 'My mistakes', body: 'Retry the questions you got wrong until they stick.', icon: <RetryIcon className={ic} />, meta: mistakes ? String(mistakes) : undefined, tone: 'bg-danger-soft text-danger-ink' },
          { to: '/improve', title: 'Improve', body: 'See your weak spots and train them directly.', icon: <TargetIcon className={ic} />, tone: 'bg-info-soft text-info-ink' },
        ]}
      />
    </div>
  );
}
