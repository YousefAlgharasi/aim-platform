import type { ReactNode } from 'react';
import { CheckIcon } from '../../components/common/Icons';
import { useI18n } from '../../i18n/I18nContext';

/** Shared look for the small practice sessions (My mistakes, My words review): one header, one finish screen. */

export const PILL_PRIMARY =
  'inline-flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-brand px-8 text-base font-semibold text-white no-underline transition hover:bg-brand-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page';
export const PILL_SECONDARY =
  'inline-flex h-14 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-transparent px-7 text-base font-semibold text-ink no-underline ring-1 ring-line-strong transition hover:bg-surface-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus';

export function CrossIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** "Question 3 of 10" above a slim progress bar. `done` is how many are finished, so the bar fills as you go. */
export function SessionProgress({ done, total, label, text }: { done: number; total: number; label: string; text: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="lp-num m-0 text-sm font-semibold text-ink-muted" aria-live="polite">{text}</p>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
        <div className="h-full rounded-full bg-brand transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type ChoiceState = 'idle' | 'picked' | 'right' | 'wrong' | 'dim';

/** One answer row: a letter badge, the text, and (after checking) a tick or a cross, so it never relies on colour alone. */
export function ChoiceRow({ letter, text, state, disabled, onClick }: { letter: string; text: string; state: ChoiceState; disabled: boolean; onClick: () => void }) {
  const tone: Record<ChoiceState, string> = {
    idle: 'bg-surface ring-line text-ink hover:ring-line-strong hover:bg-surface-muted',
    picked: 'bg-brand-soft ring-brand text-ink',
    right: 'bg-success-soft ring-success-line text-success-ink',
    wrong: 'bg-danger-soft ring-danger-line text-danger-ink',
    dim: 'bg-surface ring-line text-ink-muted opacity-70',
  };
  const badge: Record<ChoiceState, string> = {
    idle: 'ring-1 ring-line-strong text-ink-soft',
    picked: 'bg-brand text-white',
    right: 'bg-success text-white',
    wrong: 'bg-danger text-white',
    dim: 'ring-1 ring-line text-ink-muted',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-14 w-full cursor-pointer items-center gap-4 rounded-2xl border-0 px-4 py-3 text-start text-base font-medium ring-1 transition-colors disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${tone[state]}`}
    >
      <span aria-hidden="true" className={`lp-num grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${badge[state]}`}>
        {state === 'right' ? <CheckIcon className="size-4" /> : state === 'wrong' ? <CrossIcon /> : letter}
      </span>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere] [unicode-bidi:plaintext]">{text}</span>
    </button>
  );
}

/** The finish screen: a green stop on the road, the score big, and one clear next step. */
export function SessionComplete({ title, score, total, summary, children }: { title: string; score: number; total: number; summary: string; children: ReactNode }) {
  const { formatNumber } = useI18n();
  return (
    <section aria-label={title} className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 rounded-2xl bg-surface px-6 py-10 text-center ring-1 ring-line sm:px-10">
      <span aria-hidden="true" className="ix-pop lp-node grid size-24 place-items-center rounded-full border-solid border-success bg-surface text-success-ink" style={{ borderWidth: 10 }}>
        <CheckIcon className="size-9" />
      </span>
      <div className="flex flex-col items-center gap-2">
        <h2 className="lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.5rem]">{title}</h2>
        {total > 0 && (
          <p className="lp-display lp-num m-0 text-5xl font-semibold text-ink">
            {formatNumber(score)}<span className="text-ink-muted">/{formatNumber(total)}</span>
          </p>
        )}
        <p className="m-0 text-base text-ink-muted">{summary}</p>
      </div>
      <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">{children}</div>
    </section>
  );
}
