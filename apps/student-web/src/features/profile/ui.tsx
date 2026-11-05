import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitleBar } from '../../components/common/PageTitleBar';

// Presentation helpers shared by the account-area feature pages (profile, settings,
// notifications, billing, support, reports). Visual language from design-prototype.

export const h1Cls = 'text-2xl sm:text-3xl font-extrabold tracking-tight text-ink m-0';
export const subCls = 'text-sm text-ink-muted m-0 leading-relaxed';
export const h2Cls = 'text-base font-extrabold tracking-tight text-ink m-0';
export const labelCls = 'text-xs font-bold uppercase tracking-wider text-ink-muted';
export const bodyCls = 'text-sm text-ink-soft m-0';
export const selectCls =
  'w-full h-[54px] px-4 rounded-[14px] bg-control border-[1.5px] border-line-strong dark:border-line text-[15px] text-ink outline-none focus:border-focus cursor-pointer font-[inherit]';
export const textareaCls =
  'w-full px-4 py-3 rounded-[14px] bg-control border-[1.5px] border-line-strong dark:border-line text-[15px] text-ink outline-none focus:border-focus font-[inherit] placeholder-ink-muted';
export const pillCls =
  'inline-flex items-center text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-soft text-brand-ink';
export const tableWrapCls = 'rounded-2xl bg-surface ring-1 ring-line shadow-sm overflow-hidden';

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
  'size-10 shrink-0 rounded-xl flex items-center justify-center bg-control text-ink-soft hover:bg-brand-soft hover:text-brand-ink transition-colors border-none cursor-pointer no-underline';

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
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  fallback?: string;
}

/** Page heading: back arrow + centered title on one line. */
export function PageHeader({ title, subtitle, action, fallback }: PageHeaderProps) {
  return <PageTitleBar title={title} subtitle={subtitle} action={action} fallback={fallback} />;
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className={h2Cls}>{children}</h2>
      {hint && <p className={subCls}>{hint}</p>}
    </div>
  );
}

export function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelCls}>{label}</label>
      {children}
      {error && (
        <span id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-xs text-danger-ink font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

/** Grouped settings row link (prototype ProfileTab / settings rows). */
export function LinkRow({ to, icon, children }: { to: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-1 py-3 min-h-[48px] no-underline text-ink text-sm font-semibold hover:text-brand-ink transition-colors"
    >
      {icon && (
        <span className="size-9 rounded-xl bg-brand-soft text-brand-ink flex items-center justify-center shrink-0">
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">{children}</span>
      <ChevronIcon className="size-4 text-ink-faint" />
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
      className={`relative shrink-0 w-11 h-6 rounded-full border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-brand dark:ring-1 dark:ring-inset dark:ring-brand-ink' : 'bg-line-strong'}`}
    >
      <span className={`absolute top-0.5 start-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
    </button>
  );
}

export const inputCls =
  'w-full h-[54px] px-4 rounded-[14px] bg-control border-[1.5px] border-line-strong dark:border-line text-[15px] text-ink outline-none focus:border-focus disabled:opacity-50 font-[inherit]';

export const textLinkCls =
  'text-sm font-semibold text-brand-ink hover:underline no-underline';

/** Label / value row used in summaries. */
export function KV({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className={`text-end ${strong ? 'font-extrabold text-ink' : 'font-semibold text-ink'}`}>{children}</span>
    </div>
  );
}

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'indigo';
const TONE: Record<Tone, string> = {
  success: 'bg-success-soft text-success-ink',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-danger-soft text-danger-ink',
  neutral: 'bg-surface-muted text-ink-soft',
  indigo: 'bg-brand-soft text-brand-ink',
};

export function StatusPill({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${TONE[tone]}`}>
      {children}
    </span>
  );
}
