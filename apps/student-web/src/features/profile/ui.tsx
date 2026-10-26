import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

// Presentation helpers shared by the account-area feature pages (profile, settings,
// notifications, billing, support, reports). Visual language from design-prototype.

export const eyebrowCls = 'text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider m-0';
export const h1Cls = 'text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0';
export const subCls = 'text-sm text-slate-500 dark:text-slate-400 m-0 leading-relaxed';
export const h2Cls = 'text-base font-extrabold tracking-tight text-slate-900 dark:text-white m-0';
export const labelCls = 'text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400';
export const bodyCls = 'text-sm text-slate-600 dark:text-slate-300 m-0';
export const selectCls =
  'w-full h-[54px] px-4 rounded-[14px] bg-[#F1F5F9] dark:bg-slate-800 border-[1.5px] border-[#CBD5E1] dark:border-slate-700 text-[15px] text-[#0F172A] dark:text-white outline-none focus:border-[#4F46E5] cursor-pointer font-[inherit]';
export const textareaCls =
  'w-full px-4 py-3 rounded-[14px] bg-[#F1F5F9] dark:bg-slate-800 border-[1.5px] border-[#CBD5E1] dark:border-slate-700 text-[15px] text-[#0F172A] dark:text-white outline-none focus:border-[#4F46E5] font-[inherit] placeholder-[#94A3B8] dark:placeholder-slate-500';
export const pillCls =
  'inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300';
export const tableWrapCls = 'rounded-2xl bg-white dark:bg-slate-800 ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm overflow-hidden';

export function ChevronIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={`${className} rtl:rotate-180`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg className="size-5 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export const backBtnCls =
  'size-10 shrink-0 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors border-none cursor-pointer no-underline';

export function BackLink({ to, label = 'Back' }: { to: string; label?: string }) {
  const { t } = useI18n();
  label = t(label);
  return (
    <Link to={to} aria-label={label} title={label} className={backBtnCls}>
      <BackIcon />
    </Link>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  back?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, back, action }: PageHeaderProps) {
  return (
    <header className="flex items-start gap-3">
      {back}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {eyebrow && <p className={eyebrowCls}>{eyebrow}</p>}
        <h1 className={h1Cls}>{title}</h1>
        {subtitle && <p className={subCls}>{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className={h2Cls}>{children}</h2>
      {hint && <p className={subCls}>{hint}</p>}
    </div>
  );
}

export function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

/** Grouped settings row link (prototype ProfileTab / settings rows). */
export function LinkRow({ to, icon, children }: { to: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-1 py-3 min-h-[48px] no-underline text-slate-800 dark:text-slate-100 text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      {icon && (
        <span className="size-9 rounded-xl bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">{children}</span>
      <ChevronIcon className="size-4 text-slate-400" />
    </Link>
  );
}

/** Prototype-style toggle switch. */
export function Switch({
  checked, onChange, disabled, label, id,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-[#4F46E5]' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`absolute top-0.5 start-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
    </button>
  );
}

export const inputCls =
  'w-full h-[54px] px-4 rounded-[14px] bg-[#F1F5F9] dark:bg-slate-800 border-[1.5px] border-[#CBD5E1] dark:border-slate-700 text-[15px] text-[#0F172A] dark:text-white outline-none focus:border-[#4F46E5] disabled:opacity-50 font-[inherit]';

export const textLinkCls =
  'text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline no-underline';

/** Label / value row used in summaries. */
export function KV({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-end ${strong ? 'font-extrabold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-100'}`}>{children}</span>
    </div>
  );
}

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'indigo';
const TONE: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300',
};

export function StatusPill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${TONE[tone]}`}>
      {children}
    </span>
  );
}
