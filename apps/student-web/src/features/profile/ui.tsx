import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { PageTitleBar } from '../../components/common/PageTitleBar';

// Presentation helpers shared by the account-area feature pages (profile, settings,
// notifications, billing, support, reports). Visual language from design-prototype.

export const h1Cls = 'lp-display m-0 text-[2rem] font-semibold text-ink sm:text-[2.5rem]';
export const subCls = 'text-base text-ink-muted m-0 leading-relaxed';
export const h2Cls = 'text-xl font-semibold tracking-tight text-ink m-0';
export const labelCls = 'text-sm font-medium text-ink';
export const bodyCls = 'text-base text-ink-soft m-0';
export const selectCls =
  'w-full h-[52px] px-4 rounded-xl bg-transparent border border-line-strong text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand/30 cursor-pointer font-[inherit]';
export const textareaCls =
  'w-full px-4 py-3 rounded-xl bg-transparent border border-line-strong text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand/30 font-[inherit] placeholder-ink-muted';
export const pillCls =
  'inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ring-1 ring-line-strong text-ink';
export const tableWrapCls = 'rounded-2xl bg-surface ring-1 ring-line overflow-hidden';

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
  'size-11 shrink-0 rounded-full flex items-center justify-center bg-transparent ring-1 ring-line-strong text-ink-soft hover:bg-surface-strong hover:text-ink transition-colors border-none cursor-pointer no-underline';

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
        <span id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-sm text-danger-ink font-medium">
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
      className="flex items-center gap-3 px-1 py-3 min-h-[52px] no-underline text-ink text-base font-medium hover:text-brand-ink transition-colors"
    >
      {icon && (
        <span className="size-9 rounded-full bg-surface-strong text-ink flex items-center justify-center shrink-0">
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
      <span className={`absolute top-0.5 start-0.5 size-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5 rtl:-translate-x-5' : ''}`} />
    </button>
  );
}

export const inputCls =
  'w-full h-[52px] px-4 rounded-xl bg-transparent border border-line-strong text-base text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand/30 disabled:opacity-50 font-[inherit]';

export const textLinkCls =
  'text-sm font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink';

/** Label / value row used in summaries. */
export function KV({ label, children, strong }: { label: ReactNode; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-base">
      <span className="text-ink-muted">{label}</span>
      <span className={`text-end ${strong ? 'font-semibold text-ink' : 'font-medium text-ink'}`}>{children}</span>
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
    <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${TONE[tone]}`}>
      {children}
    </span>
  );
}
