import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon } from '../../components/common/Icons';

/**
 * Small presentational helpers shared by the placement and assessments screens.
 * Visual language from design-prototype (OptionCard, ProgressBar, QuestionTimer, hero badges).
 */

export const CARD =
  'bg-white dark:bg-slate-800 rounded-2xl ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm';

export const EYEBROW = 'text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider';

export const H1 = 'm-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight';

export const H2 = 'm-0 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white';

export const BODY = 'm-0 text-sm leading-relaxed text-slate-500 dark:text-slate-400';

export const TEXTAREA =
  'w-full bg-[#F1F5F9] dark:bg-slate-800 border-1.5 border-[#E2E8F0] dark:border-slate-700 focus:border-[#4F46E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/30 rounded-xl p-3.5 text-sm text-[#0F172A] dark:text-white resize-y leading-relaxed font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-60';

export const SR_ONLY = 'sr-only';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  backTo,
  backLabel = 'Back',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <header className="flex items-start gap-3">
      {backTo && (
        <Link
          to={backTo}
          aria-label={backLabel}
          className="size-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <svg className="size-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {eyebrow && <span className={EYEBROW}>{eyebrow}</span>}
        <h1 className={H1}>{title}</h1>
        {subtitle && <p className={BODY}>{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function HeroBadge({ children, tone = 'indigo' }: { children: ReactNode; tone?: 'indigo' | 'emerald' }) {
  const glow = tone === 'emerald' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-violet-500';
  const face = tone === 'emerald' ? 'from-emerald-500 to-teal-600 shadow-emerald-500/25' : 'from-indigo-600 to-violet-600 shadow-indigo-500/25';
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
    <div className="h-1.5 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#4F46E5] rounded-full transition-all duration-400 ease-out"
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
          ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
          : 'bg-[rgba(79,70,229,0.08)] dark:bg-indigo-950/60 text-[#4F46E5] dark:text-indigo-400'
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
      ? 'bg-[rgba(79,70,229,0.07)] dark:bg-indigo-950/40 ring-2 ring-[#4F46E5] shadow-[0_4px_20px_rgba(79,70,229,0.15)]'
      : 'bg-[rgba(79,70,229,0.08)] dark:bg-indigo-950/60 ring-[1.5px] ring-[#4F46E5]'
    : 'bg-white dark:bg-slate-800 ring-1 ring-[#E2E8F0] dark:ring-slate-700 hover:ring-[#C7D2FE] dark:hover:ring-indigo-700 hover:shadow-sm';
  return (
    <label
      className={`relative flex items-center cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#4F46E5] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70 ${shape} ${state}`}
    >
      <input type="radio" name={name} value={value} checked={selected} onChange={onChange} disabled={disabled} className="sr-only" />
      {icon && (
        <span
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            selected ? 'bg-indigo-100 dark:bg-indigo-900/50 text-[#4F46E5] dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}
        >
          {icon}
        </span>
      )}
      {keyLabel && (
        <span
          className={`size-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
            selected ? 'bg-[#4F46E5] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
          }`}
        >
          {keyLabel}
        </span>
      )}
      <span className="flex-1 min-w-0 flex flex-col">
        <span
          className={`${large ? 'text-[15px] font-bold' : 'text-sm'} leading-snug ${
            selected ? 'text-[#4F46E5] dark:text-indigo-400 font-semibold' : 'text-[#0F172A] dark:text-white'
          }`}
        >
          {children}
        </span>
        {subtitle && (
          <span className={`text-xs mt-0.5 leading-relaxed ${selected ? 'text-indigo-400' : 'text-[#94A3B8] dark:text-slate-500'}`}>
            {subtitle}
          </span>
        )}
      </span>
      {large ? (
        selected ? (
          <span className="size-6 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0 shadow-md">
            <CheckIcon className="size-3 text-white" />
          </span>
        ) : (
          <span className="size-6 rounded-full ring-1 ring-[#CBD5E1] dark:ring-slate-600 shrink-0" />
        )
      ) : (
        <span
          className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-[#CBD5E1] dark:border-slate-600 bg-transparent'
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
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

export function Badge({ tone = 'slate', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TONES[tone]}`}>
      {children}
    </span>
  );
}
