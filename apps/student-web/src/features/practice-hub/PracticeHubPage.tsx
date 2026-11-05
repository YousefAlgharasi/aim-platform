import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitleBar } from '../../components/common/PageTitleBar';
import { ChatIcon, LightbulbIcon, MicIcon, PencilIcon } from '../../components/common/Icons';
import { RetryIcon, TargetIcon } from '../../layouts/navItems';
import { mistakesApi, vocabularyApi } from '../learner/learnerApi';
import { LevelBadge } from '../level/LevelBadge';

interface Mode { to: string; title: string; body: string; icon: ReactNode; meta?: string; tone: string }

function ModeCard({ mode }: { mode: Mode }) {
  const { t } = useI18n();
  return (
    <Link
      to={mode.to}
      className="group flex h-full flex-col gap-3 rounded-2xl bg-surface p-4 no-underline shadow-card ring-1 ring-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-brand-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus motion-reduce:transition-none sm:p-5"
    >
      <span className="flex items-start justify-between gap-3">
        <span className={`grid size-12 place-items-center rounded-2xl ${mode.tone}`} aria-hidden="true">{mode.icon}</span>
        {mode.meta && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-extrabold text-brand-ink">{mode.meta}</span>}
      </span>
      <span className="flex-1">
        <span className="block text-base font-extrabold tracking-tight text-ink">{t(mode.title)}</span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{t(mode.body)}</span>
      </span>
      <span className="text-sm font-bold text-brand-ink">{t('Open')} <span aria-hidden="true" className="inline-block rtl:-scale-x-100 transition-transform group-hover:translate-x-0.5">→</span></span>
    </Link>
  );
}

function Group({ title, modes }: { title: string; modes: Mode[] }) {
  const { t } = useI18n();
  return (
    <section className="flex flex-col gap-3" aria-label={t(title)}>
      <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t(title)}</h2>
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

  useEffect(() => {
    vocabularyApi.list().then((r) => setDue(r.dueCount)).catch(() => setDue(null));
    mistakesApi.list().then((r) => setMistakes(r.total)).catch(() => setMistakes(null));
  }, []);

  const waiting = (mistakes ?? 0) + (due ?? 0);
  const ic = 'size-6';

  return (
    <div className="stagger flex flex-col gap-6">
      <PageTitleBar title={t('Practice')} subtitle={t('Talk, speak, write and review. Pick what fits the time you have.')} />

      <div className="hero-panel">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><LevelBadge tone="onBrand" /></div>
            <p className="m-0 mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
              {waiting > 0 ? t('Your 5-minute plan is ready') : t('You are all caught up')}
            </p>
            <p className="m-0 mt-1 text-sm text-on-brand">
              {waiting > 0
                ? [mistakes ? t('{n} mistakes to retry', { n: mistakes }) : '', due ? t('{n} words due', { n: due }) : ''].filter(Boolean).join(' · ')
                : t('Try a conversation or a new topic to keep your streak going.')}
            </p>
          </div>
          <Link
            to={mistakes ? '/mistakes?quick=1' : due ? '/vocabulary' : '/ai-teacher'}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl hero-cta px-6 text-[15px] font-bold no-underline shadow-lg shadow-black/20 transition-all hover:-translate-y-px active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {waiting > 0 ? t('Start now') : t('Chat with AI Teacher')}
          </Link>
        </div>
      </div>

      <Group
        title="Talk with your teacher"
        modes={[
          { to: '/ai-teacher', title: 'AI Teacher', body: 'Ask anything, get explanations and corrections in a chat.', icon: <ChatIcon className={ic} />, tone: 'bg-brand-soft text-brand-ink' },
          { to: '/voice-teacher', title: 'Voice Teacher', body: 'Speak out loud and get a spoken reply.', icon: <MicIcon className={ic} />, tone: 'bg-secondary-soft text-secondary-ink' },
        ]}
      />
      <Group
        title="Speak and write"
        modes={[
          { to: '/practice/speaking', title: 'Practice Speaking', body: 'Pick a topic, talk about it, earn XP.', icon: <MicIcon className={ic} />, tone: 'bg-accent-soft text-accent-ink' },
          { to: '/practice/writing', title: 'Write a Paragraph', body: 'Write on a topic and see exactly what to fix.', icon: <PencilIcon className={ic} />, tone: 'bg-warning-soft text-warning-ink' },
        ]}
      />
      <Group
        title="Remember and fix"
        modes={[
          { to: '/vocabulary', title: 'My words', body: 'Review the words you saved with spaced flashcards.', icon: <LightbulbIcon className={ic} />, meta: due ? t('{n} due', { n: due }) : undefined, tone: 'bg-success-soft text-success-ink' },
          { to: '/mistakes', title: 'My mistakes', body: 'Retry the questions you got wrong until they stick.', icon: <RetryIcon className={ic} />, meta: mistakes ? String(mistakes) : undefined, tone: 'bg-danger-soft text-danger-ink' },
          { to: '/improve', title: 'Improve', body: 'See your weak spots and train them directly.', icon: <TargetIcon className={ic} />, tone: 'bg-info-soft text-info-ink' },
        ]}
      />
    </div>
  );
}
