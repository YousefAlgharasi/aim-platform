import { PageTitleBar } from '../../components/common/PageTitleBar';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '../../components/common/Icons';
import { t } from '../../i18n';

/**
 * Small presentational helpers shared by the placement and assessments screens.
 * Visual language from design-prototype (OptionCard, ProgressBar, QuestionTimer, hero badges).
 */

export const CARD =
  'bg-surface rounded-2xl ring-1 ring-line shadow-sm';

export const EYEBROW = 'text-brand-ink text-xs font-extrabold uppercase tracking-wider';

export const H1 = 'm-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-tight';

export const H2 = 'm-0 text-lg font-extrabold tracking-tight text-ink';

export const BODY = 'm-0 text-sm leading-relaxed text-ink-muted';

export const TEXTAREA =
  'w-full bg-control border-1.5 border-line focus:border-focus focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 rounded-xl p-3.5 text-sm text-ink resize-y leading-relaxed font-sans placeholder:text-ink-muted disabled:opacity-60';

export const SR_ONLY = 'sr-only';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  fallback,
}: {
  /** Where the back arrow goes when the tab has no earlier page. */
  fallback?: string;
  /** Extra content under the title (e.g. status badges). */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return <PageTitleBar title={title} subtitle={subtitle} meta={eyebrow} action={action} fallback={fallback} />;
}

export function HeroBadge({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'emerald' }) {
  const glow = tone === 'emerald' ? 'from-success to-accent' : 'from-brand to-secondary';
  const face = tone === 'emerald' ? 'from-success to-accent shadow-success/25' : 'from-brand to-secondary shadow-brand/25';
  return (
    <div className="relative size-16 shrink-0" aria-hidden="true">
      <div className={`absolute -inset-2 bg-gradient-to-r ${glow} rounded-3xl opacity-20 blur-md`} />
      <div className={`relative size-16 rounded-2xl bg-gradient-to-br ${face} flex items-center justify-center text-white shadow-lg`}>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, total, label }: { value: number; total: number; label?: string }) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
  return (
    <div className="h-1.5 bg-surface-strong rounded-full overflow-hidden">
      <div
        className="h-full bg-brand rounded-full transition-all duration-400 ease-out"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      />
    </div>
  );
}

export function TimerPill({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return (
    <span
      aria-live="off"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono font-semibold text-xs ${
        warning
          ? 'bg-danger-soft text-danger-ink'
          : 'bg-brand-soft text-brand-ink'
      }`}
    >
      <svg className="size-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      {children}
    </span>
  );
}

/** Radio-backed answer row (prototype option card / question option). */
export function ChoiceRow({
  selected,
  name,
  value,
  onChange,
  disabled,
  keyLabel,
  children,
  subtitle,
  icon,
  large = false,
}: {
  selected: boolean;
  name: string;
  value: string;
  onChange: () => void;
  disabled?: boolean;
  keyLabel?: string;
  children: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  large?: boolean;
}) {
  const shape = large ? 'gap-4 px-4 py-4 rounded-2xl' : 'gap-3 p-3.5 rounded-xl';
  const state = selected
    ? large
      ? 'bg-brand-soft ring-2 ring-brand-ink shadow-lg shadow-brand/15'
      : 'bg-brand-soft ring-[1.5px] ring-brand-ink'
    : 'bg-surface ring-1 ring-line hover:ring-brand-line hover:shadow-sm';
  return (
    <label
      className={`relative flex items-center cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70 ${shape} ${state}`}
    >
      <input type="radio" name={name} value={value} checked={selected} onChange={onChange} disabled={disabled} className="sr-only" />
      {icon && (
        <span
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            selected ? 'bg-brand-soft text-brand-ink' : 'bg-surface-muted text-ink-muted'
          }`}
        >
          {icon}
        </span>
      )}
      {keyLabel && (
        <span
          className={`size-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
            selected ? 'bg-brand text-white' : 'bg-surface-muted text-ink-muted dark:text-ink-soft'
          }`}
        >
          {keyLabel}
        </span>
      )}
      <span className="flex-1 min-w-0 flex flex-col">
        <span
          className={`${large ? 'text-[15px] font-bold' : 'text-sm'} leading-snug ${
            selected ? 'text-brand-ink font-semibold' : 'text-ink'
          }`}
        >
          {children}
        </span>
        {subtitle && (
          <span className={`text-xs mt-0.5 leading-relaxed ${selected ? 'text-brand-ink' : 'text-ink-muted'}`}>
            {subtitle}
          </span>
        )}
      </span>
      {large ? (
        selected ? (
          <span className="size-6 rounded-full bg-brand flex items-center justify-center shrink-0 shadow-md">
            <CheckIcon className="size-3 text-white" />
          </span>
        ) : (
          <span className="size-6 rounded-full ring-1 ring-line-strong shrink-0" />
        )
      ) : (
        <span
          className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-brand-ink bg-brand' : 'border-line-strong bg-transparent'
          }`}
        >
          {selected && <span className="size-1.5 rounded-full bg-white" />}
        </span>
      )}
    </label>
  );
}

export type BadgeTone = 'indigo' | 'violet' | 'emerald' | 'amber' | 'red' | 'slate';

const TONES: Record<BadgeTone, string> = {
  indigo: 'bg-brand-soft text-brand-ink',
  violet: 'bg-secondary-soft text-secondary-ink',
  emerald: 'bg-success-soft text-success-ink',
  amber: 'bg-warning-soft text-warning-ink',
  red: 'bg-danger-soft text-danger-ink',
  slate: 'bg-surface-muted text-ink-soft',
};

export function Badge({ tone = 'slate', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${TONES[tone]}`}>
      {children}
    </span>
  );
}
